from rest_framework import serializers
from django.contrib.auth import get_user_model

class TagSuggestionSerializer(serializers.Serializer):
    text = serializers.CharField()