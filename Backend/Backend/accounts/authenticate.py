from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed

# Mandatory settings for Cross-Domain cookies (Vercel -> Render)
COOKIE_SETTINGS = {
    "httponly": True,
    "secure": True,      # Required for HTTPS on Render
    "samesite": "None",  # Required for Vercel to send cookies to Render
    "path": "/",
}

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
                return None
            try:
                # Silent Refresh Logic
                refresh = RefreshToken(refresh_token)
                new_access = str(refresh.access_token)
                
                # Attach to request so the View can update the cookie in the response
                request._new_access_token = new_access
                
                validated_token = self.get_validated_token(new_access)
                user = self.get_user(validated_token)
                return (user, validated_token)
            except Exception:
                raise AuthenticationFailed("Session expired. Please login again.")