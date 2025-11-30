from django.shortcuts import render
from events.models import Event
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from events.serializers.event_serializer import EventSerializer
import openai
from django.conf import settings
from events.middlewares import get_distance
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from events.serializers.my_events_serializer import EventOverviewSerializer 



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
                        - You have to choose at least one personality type.
                        - If unsure, make the best possible guess based on the description provided.
                """},
                {"role": "user", "content": f"""Event description: "{description}" Select the personality types that best match this event."""}
            ],
            max_tokens=50
        )
        suggested_codes = response.choices[0].message.content
        codes_list = [code.strip() for code in suggested_codes.split(",")]

        personalities = Personality.objects.filter(code__in=codes_list)
        event.personality.set(personalities)

    def get_queryset(self):
        queryset = super().get_queryset()
        
        lat_max = self.request.query_params.get("n")
        lon_max = self.request.query_params.get("e")
        lat_min = self.request.query_params.get("s")
        lon_min = self.request.query_params.get("w")

        lat = self.request.query_params.get("lat")
        lon = self.request.query_params.get("lon")
        max_distance = self.request.query_params.get("distance", 10)  # domyślnie 10 km

        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        personality_type = self.request.query_params.get("personality_type")

        tags = self.request.query_params.getlist("tags")

        if lat and lon:
            try:
                lat = float(lat)
                lon = float(lon)
                max_distance = float(max_distance)
            except ValueError:
                return queryset.none()

            filtered_events = [event for event in queryset 
                            if get_distance(lat, lon, event.latitude, event.longitude) <= max_distance]
            return filtered_events
        
        if start_date:
            print(start_date)
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            print(end_date)
            queryset = queryset.filter(date__lte=end_date)
        
        if personality_type:
            queryset = queryset.filter(personality__id=personality_type)

        if tags:
            queryset = queryset.filter(tags__id__in=tags).distinct()

        if lat_max is not None and lon_max is not None and lat_min is not None and lon_min is not None:
            queryset = queryset.filter(latitude__gte=float(lat_min), latitude__lte=float(lat_max), longitude__gte=float(lon_min), longitude__lte=float(lon_max))

        return queryset
    
    @action(detail=True, methods=["post"], url_path="join")
    def join_event(self, request, pk=None):
        event = self.get_object()
        user = request.user

        if event.participants.filter(id=user.id).exists():
            return Response({"detail": "Already participating"}, status=200)

        event.participants.add(user)
        return Response({"detail": "Joined"}, status=200)

    @action(detail=True, methods=["post"], url_path="leave")
    def leave_event(self, request, pk=None):
        event = self.get_object()
        user = request.user

        if not event.participants.filter(id=user.id).exists():
            return Response({"detail": "Not participating"}, status=200)

        event.participants.remove(user)
        return Response({"detail": "Left"}, status=200)
    
    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        user = request.user

        data = {
            "participating": user.events.all(),
            "organizing": user.organized_events.all(),
        }

        serializer = EventOverviewSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='reccommendations')
    def recommendations(self, request):
        user = request.user
        personalities = user.personality.all()

        sponsored_event = (
            Event.objects
            .filter(is_sponsored=True)
            .order_by('-date')[:1]
        )

        personal_events = Event.objects.filter(
            personality__in=personalities
        )

        events = (sponsored_event | personal_events).distinct()

        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

  

