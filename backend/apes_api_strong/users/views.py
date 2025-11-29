from rest_framework import viewsets
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny

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