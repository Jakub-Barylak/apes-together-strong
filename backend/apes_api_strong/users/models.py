from django.db import models
from django.contrib.auth.models import AbstractUser

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

    
    

class User(AbstractUser):
    bananas = models.PositiveIntegerField(default=0)

    PERSONALITY_CHOICES = [
        ("INTJ", "Architect (INTJ)"),
        ("INTP", "Logician (INTP)"),
        ("ENTJ", "Commander (ENTJ)"),
        ("ENTP", "Debater (ENTP)"),
        ("INFJ", "Advocate (INFJ)"),
        ("INFP", "Mediator (INFP)"),
        ("ENFJ", "Protagonist (ENFJ)"),
        ("ENFP", "Campaigner (ENFP)"),
        ("ISTJ", "Logistician (ISTJ)"),
        ("ISFJ", "Defender (ISFJ)"),
        ("ESTJ", "Executive (ESTJ)"),
        ("ESFJ", "Consul (ESFJ)"),
        ("ISTP", "Virtuoso (ISTP)"),
        ("ISFP", "Adventurer (ISFP)"),
        ("ESTP", "Entrepreneur (ESTP)"),
        ("ESFP", "Entertainer (ESFP)"),
    ]

    personality = models.CharField(
        max_length=4,
        choices=PERSONALITY_CHOICES,
        blank=True,
        null=True
    )

    tags = models.ManyToManyField(Tag, blank=True)

    def __str__(self):
        return self.username
    