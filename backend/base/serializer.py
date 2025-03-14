from rest_framework import serializers
from .models import CustomUser, RaspadorChancado, Equipo, Categoria
from django.contrib.auth import get_user_model


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    fecha_desvinculacion = serializers.DateField(required=False, allow_null=True)
    class Meta:
        model = CustomUser
        fields = [
            "nombre_completo", "rut", "direccion", "numero_telefonico",
            "email", "cargo", "contrato_asignado","rol_usuario", "fecha_ingreso",
            "fecha_desvinculacion", "password"
        ]
    def create(self, validated_data):
        password = validated_data.pop("password")  # ✅ Remover contraseña antes de crear usuario
        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)  # ✅ Hashear la contraseña
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id','email','nombre_completo','rut','direccion','numero_telefonico','rol_usuario','cargo','contrato_asignado','fecha_ingreso','fecha_desvinculacion']

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        style={"input_type": "password"}, write_only=True)


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ("id", "nombre_completo","numero_telefonico","email", "rut", "cargo","rol_usuario","contrato_asignado","fecha_ingreso","fecha_desvinculacion")

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id", "nombre"]


class EquipoSerializer(serializers.ModelSerializer):
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())  # ✅ Se asegura de devolver el ID numérico

    class Meta:
        model = Equipo
        fields = ["id", "tag_estandar", "categoria"]

class RaspadorChancadoSerializer(serializers.ModelSerializer):
    equipo = serializers.PrimaryKeyRelatedField(queryset=Equipo.objects.all())  # ✅ Permite enviar equipo en el POST

    class Meta:
        model = RaspadorChancado
        fields = [
            "id", "raspador", "dias_vida_util_disponible", "porcentaje_vida_util_disponible",
            "accion", "estatus", "fecha_ultimo_cambio", "ciclo_hoja", "proximo_cambio", "equipo"
        ]