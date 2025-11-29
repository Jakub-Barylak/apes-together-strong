from django.contrib import admin
from events.models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "date", "location_name", "organizer")
    search_fields = ("title", "description", "location_name", "organizer__username")
    list_filter = ("date", "tags", "personality")
    readonly_fields = ("id",)

