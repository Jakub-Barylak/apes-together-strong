from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, TagViewSet

router = DefaultRouter()
router.register('users', UserViewSet)  # puste = /api/users/ jako root
router.register('tags', TagViewSet)  # puste = /api/tags/ jako root

urlpatterns = router.urls