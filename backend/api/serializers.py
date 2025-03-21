from rest_framework import serializers
from .models import DatabaseSchemaModel

class DatabaseSchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseSchemaModel
        fields = ['title', 'sql', 'json', 'conversations']