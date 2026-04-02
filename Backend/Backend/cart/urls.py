from django.urls import path
from .views import CartView,CartDeleteView,CartUpdateView

urlpatterns = [
    path('', CartView.as_view()),   
    path('delete/<int:id>/', CartDeleteView.as_view()),
    path("update/<int:id>/", CartUpdateView.as_view()),
]