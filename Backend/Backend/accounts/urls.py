from django.urls import path
from .views import LoginView, RegisterView, LogoutView, UserView

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("register/", RegisterView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("user/", UserView.as_view()),
  
]