from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CookiesJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Extraer el token desde las cookies
        access_token = request.COOKIES.get('access_token')

        if not access_token:
            return None  # No hay token en cookies

        try:
            # Validar el token
            validated_token = self.get_validated_token(access_token)
            # Obtener el usuario
            user = self.get_user(validated_token)
            return (user, validated_token)
        except Exception as e:
            raise AuthenticationFailed("Token inválido o expirado")
