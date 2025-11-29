from django.db import models
from django.contrib.auth.models import AbstractUser
from users.enums import PERSONALITY_CHOICES

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Personality(models.Model):
    code = models.CharField(max_length=4, unique=True)
    label = models.CharField(max_length=100)

    def __str__(self):
        return self.code
    
    

class User(AbstractUser):
    bananas = models.PositiveIntegerField(default=0)

    personality = models.ManyToManyField(Personality, blank=True)

    tags = models.ManyToManyField(Tag, blank=True)

    def __str__(self):
        return self.username
    