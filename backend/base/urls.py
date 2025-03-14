from django.urls import path,include
from .views import CategoriaViewSet, EquipoViewSet, RaspadorChancadoViewSet,UsuarioViewSet,CustomTokenObtainPairView,CustomRefreshToken,logout,ObtenerRolesAPIView,user_list, is_authenticated,RegisterUserView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UsuarioViewSet, basename='users')  
router.register(r'equipos', EquipoViewSet) 
router.register(r'raspadores', RaspadorChancadoViewSet)  
router.register(r'categorias', CategoriaViewSet) 

urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomRefreshToken.as_view(), name='token_refresh'),
    path('logout/', logout),
    path('authenticated/', is_authenticated),
    path('roles/', ObtenerRolesAPIView.as_view(), name='roles'),
    path('register/', RegisterUserView, name='register'),
    path('user/', user_list),
]