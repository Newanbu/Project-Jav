from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser,Equipo, RaspadorChancado,Categoria
# Register your models here.


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("nombre_completo", "email", "rut", "cargo", "is_active", "is_staff")
    search_fields = ("email", "nombre_completo", "rut")
    ordering = ("nombre_completo",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Información Personal", {"fields": ("nombre_completo", "rut", "direccion", "numero_telefonico", "cargo", "contrato_asignado", "fecha_ingreso", "fecha_desvinculacion")}),
        ("Permisos", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "nombre_completo", "rut", "password1", "password2", "is_active", "is_staff"),
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(RaspadorChancado)
admin.site.register(Equipo)
admin.site.register(Categoria)
