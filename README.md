# SchemaLLM

A modern web application that leverages AI to generate and manage database schemas. This project combines React TypeScript for the frontend with Django REST Framework for the backend, providing a seamless experience for database schema generation and management.

## Project Overview

SchemaLLM is a powerful tool that uses AI to assist in database schema design. It allows users to:
- Generate database schemas through natural language conversations
- Store and retrieve schema designs
- Get AI-powered feedback on schema designs
- Maintain conversation history for context-aware schema generation

## Technology Stack

### Frontend
- React with TypeScript for type-safe development
- TypeScript for enhanced type safety
- TailwindCSS

### Backend
- Django REST Framework for robust API development
- SQLite for reliable database storage
- LangChain for AI integration
- Groq for AI model interactions
- Pydantic for data validation

## AI Integration

The AI integration leverages LangChain and Groq to provide:
- Natural language understanding for schema generation
- Conversation memory for context-aware responses
- Structured output parsing using Pydantic models
- Custom prompt engineering for database-specific tasks

## Schema Generation

The schema generation process includes:
1. Natural language input processing
2. SQL code generation with proper formatting
3. Title generation for schema organization
4. AI feedback on generated schemas
5. Persistent storage of schema designs

## Storage Mechanisms

The project uses a multi-layered storage approach:
- SQLite for main database storage
- Django models for schema persistence
- Pickle serialization for memory
- RESTful API endpoints for data access

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- Groq API key (for AI functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/khonello/SchemaLLM
   cd SchemaLLM
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   yarn install
   ```

4. Set up environment variables:
   Create a `.env` file in the backend directory with:
   ```
   GROQ_API_KEY=your_groq_api_key
   ```

5. Run database migrations:
   ```bash
   cd backend
   python manage.py migrate
   ```

6. Start the development servers:
   - Backend: `python manage.py runserver`
   - Frontend: `yarn start`

## Project Structure

```
SchemaLLM/
├── backend/               # Django backend
│   ├── api/               # API endpoints and views
│   ├── project            # Project configuration
│   └── requirements.txt   # Backend dependencies
├── frontend/              # React TypeScript frontend
│   ├── src/               # Source code
│   └── public/            # Static assets
└── package.json           # Frontend dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- LangChain for AI integration
- Groq for AI model hosting
- Django REST Framework for API development
- React and TypeScript for frontend development

### Notes:
 - Due to a bug, when you make your first request to create a schema, click in the top right button to see the listing of all schemas, and select the one you just created so that subsequent requests updates that schema. Failure to do so will result in a new schema being created instead of updating the current one.