# urls.py
from django.urls import path
from .views import (AdminDashboard,AdminOrders,AdminProducts,AdminUserOrdersView,AdminUsersView,AdminUserUpdateView
)

urlpatterns = [
    path("dashboard/", AdminDashboard.as_view()),
    path("orders/", AdminOrders.as_view()),
    path("orders/<int:pk>/", AdminOrders.as_view()),
    path("products/", AdminProducts.as_view()),           
    path("products/<str:pk>/", AdminProducts.as_view()),  
    path("users/", AdminUsersView.as_view()),
    path("users/<int:id>/", AdminUserUpdateView.as_view()),
    path("user-orders/<int:user_id>/", AdminUserOrdersView.as_view()),
]