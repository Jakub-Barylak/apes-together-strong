from django.shortcuts import render
from events.models import Event
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from events.serializers.event_serializer import EventSerializer
# Create your views here.
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    
    def get_permissions(self):
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]