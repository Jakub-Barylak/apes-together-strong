from requests import Response
from apes_api_strong import settings
from rest_framework import viewsets
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from users.serializers.tag_sugesstion_serializer import TagSuggestionSerializer
from users.models import Tag
from users.serializers.tag_serializer import TagSerializer
from rest_framework.response import Response
import openai
from django.conf import settings

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='suggest')
    def suggest(self, request):
        serializer = TagSuggestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_text = serializer.validated_data['text']
        all_tags_qs = Tag.objects.all()
        all_tags = list(all_tags_qs.values_list('name', flat=True))
        tags_str = ", ".join(all_tags)

        print("OPENAI_API_KEY:", settings.OPENAI_API_KEY)

        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"""You are an expert tag suggestion assistant. You are given a fixed list of available tags and a description of a user's interests. 
Your job is to select which tags from the available list match the user's description. 
- Only use tags from the provided list. 
- Do not invent new tags. 
- Your output must be a comma-separated list of tag names, with no extra text.
- Remove duplicates and ignore case differences.
                """},
                {"role": "user", "content": f"""Available tags: {tags_str}

                User description: "{user_text}"

Select matching tags:"""}
            ],
            max_tokens=50
        )
        suggestion_text = response.choices[0].message.content
        suggested_names = [
        tag.strip() for tag in response.choices[0].message.content.split(",")
        if tag.strip() in all_tags
        ]

   
        tag_map = {tag.name: tag.id for tag in all_tags_qs}
        suggested_tags = [{"id": tag_map[name], "name": name} for name in suggested_names]
        
        return Response({
            "suggested_tags": suggested_tags,
        })