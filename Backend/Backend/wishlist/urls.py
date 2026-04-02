from django.urls import path
from .views import WishlistView, WishlistDeleteView

urlpatterns = [
    path('', WishlistView.as_view()),
    path('<int:pk>/', WishlistDeleteView.as_view()),
]