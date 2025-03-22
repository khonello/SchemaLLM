from django.urls import path
from .views import HomeSchemaAPIView, DetailSchemaAPIView, ProjectSchemaAPIView

urlpatterns = [
    path('', HomeSchemaAPIView.as_view(), name= 'home'),
    path('details', DetailSchemaAPIView.as_view(), name= 'details'),
    path('project/<path:project_id>', ProjectSchemaAPIView.as_view(), name= 'project')
]
