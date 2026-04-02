from django.urls import path
from .views import CreateCheckoutSession, VerifyPayment

urlpatterns = [
    path('create-checkout-session/', CreateCheckoutSession.as_view()),
    path('verify/', VerifyPayment.as_view()),
]