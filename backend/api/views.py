from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.output_parsers import PydanticOutputParser
from langchain.chains import LLMChain
from langchain_groq import ChatGroq
from pydantic import BaseModel
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import DatabaseSchemaModel
from .serializers import DatabaseSchemaSerializer
import sqlparse
import re
import pickle

from dotenv import load_dotenv
load_dotenv()

prompt = PromptTemplate.from_template(
    "Respond strictly in JSON format without markdown or backticks.\n\n"
    "Return a JSON object with the following structure:\n"
    "{{\"sql\": \"SQL code here\", \"title\": \"Short title\", \"ai\": \"Short feedback on what you did. Minimum of 5 words, maximum of 15 words\"}}\n\n"
    "{input}"
)

class DatabaseSchema(BaseModel):
    sql: str
    title: str
    ai: str

class HomeSchemaAPIView(APIView):

    def get(self, request):
        title = request.GET.get('title')
        schema_queryset = DatabaseSchemaModel.objects.filter(title=title)
        serializer = DatabaseSchemaSerializer(schema_queryset.first(), many=False)
        
        return Response(
            {
                'title': title,
                'json': serializer.data.get('json', None),
                'conversations': serializer.data.get('conversations', None),
            },
            status= 200
        )

    def post(self, request):
        title, conversation = request.data.get('title', None), request.data.get('conversation', None)
        
        if not title:
            structured = self.run_llm(conversation)
            if structured.get('error', None):
                return Response(
                    {
                        'status': 'error',
                        'message': structured.get('error', None)
                    },
                    status=400
                )
            
            new_schema = DatabaseSchemaModel.objects.create(
                title=structured.get('title', None),
                sql=structured.get('sql', None),
                json=structured.get('json', None),
                conversations={
                    'chat': [
                        {
                            'user': conversation,
                            'ai': structured.get('ai', None)
                        }
                    ]
                },
                memory=structured.get('memory_binary', None)
            )
            
            return Response(
                {
                    'status': 'success',
                    'schema_id': new_schema.id,
                    'title': new_schema.title
                },
                status=201
            )
        
        else:
            existing_schema = DatabaseSchemaModel.objects.filter(title=title).first()
            if not existing_schema:
                return Response(
                    {
                        'status': 'error',
                        'message': f"No schema found with title: {title}"
                    },
                    status=404
                )
            
            structured = self.run_llm(conversation, existing_schema.memory, existing_sql=existing_schema.sql or "")
            if structured.get('error', None):
                return Response(
                    {
                        'status': 'error',
                        'message': structured.get('error', None)
                    },
                    status=400
                )
            
            current_conversations = existing_schema.conversations
            if 'chat' not in current_conversations:
                current_conversations['chat'] = []
            
            current_conversations['chat'].append({
                'user': conversation,
                'ai': structured.get('ai', None)
            })
            
            existing_schema.sql = structured.get('sql', existing_schema.sql)
            existing_schema.json = structured.get('json', existing_schema.json)
            existing_schema.conversations = current_conversations
            existing_schema.memory = structured.get('memory_binary', existing_schema.memory)
            existing_schema.save()
            
            return Response(
                {
                    'status': 'success',
                    'schema_id': existing_schema.id,
                    'title': existing_schema.title
                },
                status=200
            )

    def parse_sql(self, sql):
        parsed_statements = sqlparse.parse(sql)
        tables = []

        for stmt in parsed_statements:
            if not (stmt.get_type() == 'CREATE' and any(token.value.upper() == 'TABLE' for token in stmt.tokens)):
                continue
            
            stmt_str = str(stmt)
            
            table_match = re.search(r'CREATE\s+TABLE\s+(?:`?|"?)(\w+)(?:`?|"?)', stmt_str, re.IGNORECASE)
            if not table_match:
                continue
                
            table_name = table_match.group(1)
            
            columns_part_match = re.search(r'\((.*)\)', stmt_str, re.DOTALL)
            if not columns_part_match:
                continue
                
            columns_part = columns_part_match.group(1)
            
            level = 0
            current = []
            col_defs = []
            
            for char in columns_part:
                if char == '(' and level == 0:
                    level += 1
                    current.append(char)
                elif char == '(' and level > 0:
                    level += 1
                    current.append(char)
                elif char == ')' and level > 1:
                    level -= 1
                    current.append(char)
                elif char == ')' and level == 1:
                    level -= 1
                    current.append(char)
                elif char == ',' and level == 0:
                    col_defs.append(''.join(current).strip())
                    current = []
                else:
                    current.append(char)
                    
            if current:
                col_defs.append(''.join(current).strip())
            
            columns = []
            for col_def in col_defs:
                if col_def.upper().startswith(('PRIMARY KEY', 'FOREIGN KEY', 'CONSTRAINT', 'INDEX', 'UNIQUE')):
                    continue
                    
                parts = col_def.strip().split(None, 2)
                if len(parts) >= 2:
                    col_name = parts[0].strip('`"\' ')
                    col_type = parts[1].split('(')[0].strip().upper()
                    columns.append({"name": col_name, "type": col_type})
            
            if table_name and columns:
                tables.append({
                    "id": table_name.lower(),
                    "title": table_name.capitalize(),
                    "fields": columns
                })

        return tables

    def setup_llm(self, existing_memory= None):

        chat = ChatGroq(model="llama-3.3-70b-versatile")
        parser = PydanticOutputParser(pydantic_object=DatabaseSchema)

        if existing_memory:
            try:
                memory = pickle.loads(existing_memory)
            except (pickle.PickleError, TypeError, AttributeError) as e:
                memory = ConversationBufferMemory()
                memory.save_context(
                    {"input": "System Instruction"},
                    {"output": "You are a helpful assistant that creates database schemas. You only provide SQL code, no explanations."}
                )
        else:
            memory = ConversationBufferMemory()
            memory.save_context(
                {"input": "System Instruction"},
                {"output": "You are a helpful assistant that creates database schemas. You only provide SQL code, no explanations."}
            )
        
        chain = LLMChain(llm=chat, prompt=prompt, memory=memory)
        return {'chain': chain, 'parser': parser, 'memory': memory}

    def run_llm(self, conversation, existing_memory= None, existing_sql=""):

        llm_setup = self.setup_llm(existing_memory)
        chain, parser, memory = llm_setup['chain'], llm_setup['parser'], llm_setup['memory']

        if existing_sql:
            input_str = (
                f"""
                Include all existing tables provided below in your response\n\n
                {existing_sql}\n\n
                Update the database schema as needed for this request: {conversation}\n
                """
            )
        else:
            input_str = (
                f"Generate the database schema for this request: {conversation}\n"
            )

        raw_response = chain.run(input=input_str)
        try:
            parsed_response = parser.parse(raw_response)

            ai = parsed_response.ai.strip()
            title = parsed_response.title.strip()
            sql = parsed_response.sql.strip()
            json = self.parse_sql(sql)
            
            memory.save_context({"input": conversation}, {"output": raw_response})
            memory_binary = pickle.dumps(memory)
            
            structured = {
                'ai': ai,
                'title': title,
                'json': json,
                'sql': sql,
                'memory_binary': memory_binary
            }
        except Exception as e:
            structured = {
                'error': str(e)
            }
        
        return structured