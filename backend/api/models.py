from django.db import models

# Create your models here.
class DatabaseSchemaModel(models.Model):

    id = models.AutoField(primary_key= True)

    title = models.CharField(max_length= 100)
    sql = models.TextField()
    json = models.JSONField(default= dict)
    conversations = models.JSONField(default= dict)
    
    memory = models.BinaryField()

    created_at = models.DateTimeField(auto_now_add= True)
    updated_at = models.DateTimeField(auto_now= True)

    def __str__(self):
        return self.title