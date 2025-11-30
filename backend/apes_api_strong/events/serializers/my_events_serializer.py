from rest_framework import serializers
from events.models import Event
from events.serializers.event_serializer import EventSerializer

class EventOverviewSerializer(serializers.Serializer):
    participating = EventSerializer(many=True)
    organizing = EventSerializer(many=True)