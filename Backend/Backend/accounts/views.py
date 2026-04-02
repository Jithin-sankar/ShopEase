from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .serializer import RegisterSerializer



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
                refresh = RefreshToken(refresh_token)
                new_access = str(refresh.access_token)

               
                request._new_access_token = new_access

                validated_token = self.get_validated_token(new_access)
                user = self.get_user(validated_token)

                return (user, validated_token)

            except Exception:
                raise AuthenticationFailed("Refresh token expired")



class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User created successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):
    def post(self, request):
        user = authenticate(
            username=request.data.get("username"),
            password=request.data.get("password")
        )

        if not user:
            return Response(
                {"error": "Invalid username or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        response = Response(
            {"message": "Login successful"},
            status=status.HTTP_200_OK
        )

      
        response.set_cookie(
            key="access",
            value=str(refresh.access_token),
            httponly=True,
            secure=False,      
            samesite="Lax",
            path="/",
            max_age=60 * 60
        )

       
        response.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/",
            max_age=7 * 24 * 60 * 60
        )

        return response



class LogoutView(APIView):
    def post(self, request):
        response = Response(
            {"message": "Logged out successfully"},
            status=status.HTTP_200_OK
        )

        response.delete_cookie("access", path="/")
        response.delete_cookie("refresh", path="/")

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

        if hasattr(request, "_new_access_token"):
            response.set_cookie(
                key="access",
                value=request._new_access_token,
                httponly=True,
                secure=False,
                samesite="Lax",
                path="/",
                max_age=60 * 60
            )

        return response