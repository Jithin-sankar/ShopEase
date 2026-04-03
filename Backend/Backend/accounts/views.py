from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializer import RegisterSerializer
from .authenticate import COOKIE_SETTINGS, CookieJWTAuthentication

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user = authenticate(
            username=request.data.get("username"),
            password=request.data.get("password")
        )

        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        response = Response({"message": "Login successful"}, status=status.HTTP_200_OK)

        response.set_cookie(key="access", value=str(refresh.access_token), max_age=3600, **COOKIE_SETTINGS)
        response.set_cookie(key="refresh", value=str(refresh), max_age=604800, **COOKIE_SETTINGS)
        return response

class UserView(APIView):
    # This view uses your custom cookie auth
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        response = Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": "admin" if user.is_staff else "user"
        })

        # If a new access token was generated during authentication, update the cookie
        if hasattr(request, "_new_access_token"):
            response.set_cookie(
                key="access", 
                value=request._new_access_token, 
                max_age=3600, 
                **COOKIE_SETTINGS
            )
        return response

class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie("access", **COOKIE_SETTINGS)
        response.delete_cookie("refresh", **COOKIE_SETTINGS)
        return response