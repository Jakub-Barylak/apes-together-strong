from django.contrib import admin
from users.models import User, Tag, Personality

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "bananas")
    search_fields = ("username", "email")
    readonly_fields = ("id",)

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)
    readonly_fields = ("id",)

@admin.register(Personality)
class PersonalityAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "label")
    search_fields = ("code", "label")
    readonly_fields = ("id",)