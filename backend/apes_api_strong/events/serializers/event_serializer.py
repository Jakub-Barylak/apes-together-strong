from events.models import Event
from rest_framework import serializers
from users.models import Tag, Personality

class EventSerializer(serializers.ModelSerializer):

    organizer = serializers.PrimaryKeyRelatedField(
        read_only=True, default=serializers.CurrentUserDefault(), required=False
    )
    tags = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Tag.objects.all(), required=False
    )
    personality = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Personality.objects.all(), required=False
    )

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "date",
            "latitude",
            "longitude",
            "location_name",
            "organizer",
            "tags",
            "personality",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        personality_data = validated_data.pop('personality', [])
        event = Event.objects.create(**validated_data)
        event.tags.set(tags_data)
        event.personality.set(personality_data)
        return event

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        personality_data = validated_data.pop('personality', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tags_data is not None:
            instance.tags.set(tags_data)
        if personality_data is not None:
            instance.personality.set(personality_data)

        return instance
