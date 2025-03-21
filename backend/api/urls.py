from django.urls import path
from .views import HomeSchemaAPIView

urlpatterns = [
    path('', HomeSchemaAPIView.as_view(), name= 'home'),
]
