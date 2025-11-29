from django.shortcuts import render
from events.models import Event
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from events.serializers.event_serializer import EventSerializer
import openai
from django.conf import settings

from users.models import Personality
# Create your views here.
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        event = serializer.save(organizer=self.request.user)
        description = event.description

       
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"""You are an expert personality classifier. Your task is to assign the most appropriate personality types from the 16 Myers-Briggs (MBTI) types to a given event description. 
                    Rules:
                        - Only use the codes of the 16 MBTI types: INTJ, INTP, ENTJ, ENTP, INFJ, INFP, ENFJ, ENFP, ISTJ, ISFJ, ESTJ, ESFJ, ISTP, ISFP, ESTP, ESFP.
                        - One event can have multiple personality types, choose all that reasonably fit.
                        - Use only codes, do not add descriptions or explanations.
                        - Separate multiple personality types with commas, no extra text.
                        - Remove duplicates and ignore case differences.
                """},
                {"role": "user", "content": f"""Event description: "{description}" Select the personality types that best match this event."""}
            ],
            max_tokens=50
        )
        suggested_codes = response.choices[0].message.content
        codes_list = [code.strip() for code in suggested_codes.split(",")]

        # ustawiamy relacje ManyToMany
        personalities = Personality.objects.filter(code__in=codes_list)
        event.personality.set(personalities)