from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .serializer import RegisterSerializer

# --- 1. THE CUSTOM AUTHENTICATION CLASS ---
class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get("access")
        refresh_token = request.COOKIES.get("refresh")

        if not access_token:
            return None

        try:
            validated_token = self.get_validated_token(access_token)
            user = self.get_user(validated_token)
            return (user, validated_token)

        except Exception:
            if not refresh_token:
                raise AuthenticationFailed("No refresh token")

            try:
                # Attempt to refresh the access token automatically
                refresh = RefreshToken(refresh_token)
                new_access = str(refresh.access_token)

                # Store the new token on the request so the view can set the cookie
                request._new_access_token = new_access

                validated_token = self.get_validated_token(new_access)
                user = self.get_user(validated_token)
                return (user, validated_token)

            except Exception:
                raise AuthenticationFailed("Refresh token expired")

# --- 2. SHARED COOKIE SETTINGS ---
# Use these settings to ensure Vercel can talk to Render
COOKIE_SETTINGS = {
    "httponly": True,
    "secure": True,      # Required for HTTPS (Render)
    "samesite": "None",  # Required for Cross-Domain (Vercel -> Render)
    "path": "/",
}

# --- 3. THE VIEWS ---

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        user = authenticate(
            username=request.data.get("username"),
            password=request.data.get("password")
        )

        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        response = Response({"message": "Login successful"}, status=status.HTTP_200_OK)

        # Set Access Cookie
        response.set_cookie(
            key="access",
            value=str(refresh.access_token),
            max_age=60 * 60, # 1 Hour
            **COOKIE_SETTINGS
        )

        # Set Refresh Cookie
        response.set_cookie(
            key="refresh",
            value=str(refresh),
            max_age=7 * 24 * 60 * 60, # 7 Days
            **COOKIE_SETTINGS
        )

        return response

class UserView(APIView):
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

        # If CookieJWTAuthentication generated a new token, send it to the browser
        if hasattr(request, "_new_access_token"):
            response.set_cookie(
                key="access",
                value=request._new_access_token,
                max_age=60 * 60,
                **COOKIE_SETTINGS
            )

        return response

class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie("access", **COOKIE_SETTINGS)
        response.delete_cookie("refresh", **COOKIE_SETTINGS)
        return response