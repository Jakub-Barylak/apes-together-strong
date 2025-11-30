from django.db import models
from users.models import Tag, Personality
from django.conf import settings

# Create your models here.
class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    location_name = models.CharField(max_length=200)
    tags = models.ManyToManyField(Tag, blank=True)
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="organized_events")
    personality = models.ManyToManyField(Personality, blank=True)
    is_sponsored = models.BooleanField(default=False)


    def __str__(self):
        return self.title