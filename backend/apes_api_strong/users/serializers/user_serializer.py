from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.models import Tag

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    tags = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Tag.objects.all(), required=False
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "bananas",
            "personality",
            "tags",
        ]
        read_only_fields = ["id"]
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        user.tags.set(tags_data)  # przypisanie tagów
        return user

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if tags_data is not None:
            instance.tags.set(tags_data)
        return instance
