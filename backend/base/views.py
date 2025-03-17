from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import BasePermission
from rest_framework import status,response, permissions,viewsets
from .models import Categoria, CustomUser,Equipo, RaspadorChancado
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from .serializer import CategoriaSerializer, UserRegistrationSerializer,UserSerializer, AccountSerializer,EquipoSerializer,RaspadorChancadoSerializer
from rest_framework.decorators import api_view, permission_classes,authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.conf import settings
from django.contrib.auth import authenticate,get_user_model
from rest_framework_simplejwt import tokens
from django.middleware import csrf
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

class CustomTokenObtainPairView(TokenObtainPairView):
        def post(self, request, *args, **kwargs):
            try:
                response = super().post(request, *args, **kwargs)
                tokens = response.data  # Accede a los tokens generados
                access_token = tokens.get("access")
                refresh_token = tokens.get("refresh")

                if not access_token or not refresh_token:
                    return Response({"success": False, "error": "No se generaron tokens"}, status=400)

                # Configurar cookies en la respuesta
                res = Response({"success": True, "message": "Login exitoso"})

                # Configurar las cookies
                res.set_cookie(
                    key="access_token",
                    value=access_token,
                    httponly=True,
                    secure=True,  # Usa 'True' en producción
                    samesite="None",  # Asegúrate de que las cookies funcionen cross-site
                    path="/",
                )

                res.set_cookie(
                    key="refresh_token",
                    value=refresh_token,
                    httponly=True,
                    secure=True,  # Usa 'True' en producción
                    samesite="None",  # Asegúrate de que las cookies funcionen cross-site
                    path="/",
                )

                return res
            except Exception as e:
                return Response({"success": False, "error": str(e)}, status=500)
        
class CustomRefreshToken(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            request.data['refresh'] = refresh_token

            response = super().post(request,*args,**kwargs)

            tokens = response.data
            access_token = tokens ['access']

            res = Response()

            res.data = {'refreshed' : True}    

            res.set_cookie(
                key="access_token",
                value = access_token,
                httponly=True,
                secure =True,
                samesite ='None',
                path='/'
                )
            return res
        except:
            return Response({'refreshed': False})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def RegisterUserView(request):
    # Verificar si el usuario autenticado es admin_general
    if request.user.rol_usuario == 'Usuario':
        return response.Response({"detail": "No tienes permiso para realizar esta acción."}, status=status.HTTP_403_FORBIDDEN)
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return response.Response({"message": "Usuario registrado exitosamente!", "id":user.id}, status=status.HTTP_201_CREATED)
    return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        res = Response()
        res.data = {'success':True}
        res.delete_cookie('access_token', path='/', samesite='None')
        res.delete_cookie('refresh_token', path='/', samesite='None')

        return res

    except Exception as e:
        print(e)
        return Response({'success':False})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def is_authenticated(request):
    return Response({'Authenticated': True})



@permission_classes([IsAuthenticated])
class ObtenerRolesAPIView(APIView):
    def get(self, request, *args, **kwargs):
        roles = roles = [
            {'id': rol[0], 'nombre': rol[1], 'value': rol[0].lower().replace(' ', '_')}  
            for rol in CustomUser.ROLES
        ]
        return response.Response(roles)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_list(request , *args, **kwargs):
    try:
        user = get_user_model().objects.get(id=request.user.id)
    except get_user_model().DoesNotExist:
        return response.Response(status=404)

    serializer = AccountSerializer(user)
    return response.Response(serializer.data)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def destroy(self, request, *args, **kwargs):
        """
        Sobrescribe la función de eliminación para borrar primero los tokens antes de eliminar al usuario.
        """
        instance = self.get_object()

        # ✅ 1. Eliminar todos los tokens asociados al usuario
        try:
            if hasattr(OutstandingToken, 'objects'):  # ✅ Verifica que `objects` está disponible
                OutstandingToken.objects.filter(user_id=instance.id).delete()
        except Exception as e:
            print(f"Error eliminando tokens: {e}")

        # ✅ 2. Ahora eliminar el usuario
        instance.delete()
        
        return Response({"message": "Usuario eliminado correctamente"}, status=status.HTTP_204_NO_CONTENT)

class UsuarioSoloHorasPermission(BasePermission):
    """
    Permite acceso solo a usuarios con el rol 'Usuario' para hora_entrada y hora_salida.
    """
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True  # Superusuario tiene acceso total
        
        # ✅ Verificar si el usuario tiene el permiso correcto
        if view.basename == 'hora_entrada':
            return 'view_hora_entrada' in request.user.PERMISOS_ROLES.get(request.user.rol_usuario, [])
        elif view.basename == 'hora_salida':
            return 'view_hora_salida' in request.user.PERMISOS_ROLES.get(request.user.rol_usuario, [])
        
        return False  # Bloquea todo lo demás
    

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.prefetch_related("equipos").all()  # ✅ Optimiza carga de datos
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]

class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipo.objects.select_related("categoria").all()
    serializer_class = EquipoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = self.queryset  # Captura el queryset sin filtro

        categoria_id = self.request.query_params.get("categoria_id")
        if categoria_id:
            queryset = queryset.filter(categoria__id=categoria_id)

        print("Equipos en queryset:", queryset.count())  # Verifica la cantidad de equipos obtenidos
        return queryset
    
    
class RaspadorChancadoViewSet(viewsets.ModelViewSet):
    queryset = RaspadorChancado.objects.select_related("equipo").all()  # ✅ Relaciona con `equipo`
    serializer_class = RaspadorChancadoSerializer
    permission_classes = [IsAuthenticated]