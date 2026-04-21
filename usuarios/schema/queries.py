import graphene
from graphene_django import DjangoObjectType
from usuarios.models import Rol, Permiso, RolPermiso, Usuario, PoliticaContrasena, RolPermisoUsuario


class RolType(DjangoObjectType):
    class Meta:
        model = Rol
        fields = ('id_rol', 'nombre', 'descripcion', 'estado', 'rol_permisos')


class PermisoType(DjangoObjectType):
    class Meta:
        model = Permiso
        fields = ('id_permiso', 'nombre', 'descripcion', 'estado')


class RolPermisoType(DjangoObjectType):
    class Meta:
        model = RolPermiso
        fields = ('id_rol_permiso', 'id_rol', 'id_permiso')


class PoliticaContrasenaType(DjangoObjectType):
    class Meta:
        model = PoliticaContrasena
        fields = (
            'id_politica', 'longitud_minima', 'requiere_mayuscula',
            'requiere_numero', 'requiere_especial', 'max_intentos',
            'minutos_bloqueo', 'activo'
        )


class UsuarioType(DjangoObjectType):
    nombre_completo = graphene.String()

    class Meta:
        model = Usuario
        fields = (
            'id_usuario', 'nombre', 'paterno', 'materno',
            'telefono', 'correo', 'username', 'fecha',
            'fecha_registro', 'estado', 'bloqueado',
            'intentos_fallidos', 'id_rol'
        )

    def resolve_nombre_completo(self, info):
        return self.get_nombre_completo()


class RolPermisoUsuarioType(DjangoObjectType):
    class Meta:
        model = RolPermisoUsuario
        fields = ('id_rol_permiso_usuario', 'id_usuario', 'id_rol_permiso')


class Query(graphene.ObjectType):
    roles                    = graphene.List(RolType)
    rol                      = graphene.Field(RolType, id_rol=graphene.Int(required=True))
    permisos                 = graphene.List(PermisoType)
    permiso                  = graphene.Field(PermisoType, id_permiso=graphene.Int(required=True))
    roles_permisos           = graphene.List(RolPermisoType)
    usuarios                 = graphene.List(UsuarioType)
    usuario                  = graphene.Field(UsuarioType, id_usuario=graphene.Int(required=True))
    politica_contrasena      = graphene.Field(PoliticaContrasenaType)
    roles_permisos_usuarios  = graphene.List(RolPermisoUsuarioType)

    def resolve_roles(root, info):
        return Rol.objects.filter(estado='activo')

    def resolve_rol(root, info, id_rol):
        try:
            return Rol.objects.get(pk=id_rol)
        except Rol.DoesNotExist:
            return None

    def resolve_permisos(root, info):
        return Permiso.objects.filter(estado='activo')

    def resolve_permiso(root, info, id_permiso):
        try:
            return Permiso.objects.get(pk=id_permiso)
        except Permiso.DoesNotExist:
            return None

    def resolve_roles_permisos(root, info):
        return RolPermiso.objects.select_related('id_rol', 'id_permiso').all()

    def resolve_usuarios(root, info):
        return Usuario.objects.select_related('id_rol').all()

    def resolve_usuario(root, info, id_usuario):
        try:
            return Usuario.objects.get(pk=id_usuario)
        except Usuario.DoesNotExist:
            return None

    def resolve_politica_contrasena(root, info):
        return PoliticaContrasena.objects.filter(activo=True).first()

    def resolve_roles_permisos_usuarios(root, info):
        return RolPermisoUsuario.objects.select_related(
            'id_usuario',
            'id_rol_permiso__id_rol',
            'id_rol_permiso__id_permiso'
        ).all()