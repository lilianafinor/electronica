import graphene
from usuarios.models import Rol, Permiso, RolPermiso, Usuario, RolPermisoUsuario
from .queries import RolType, PermisoType, RolPermisoType, UsuarioType


class CrearRol(graphene.Mutation):
    class Arguments:
        nombre      = graphene.String(required=True)
        descripcion = graphene.String()

    rol = graphene.Field(RolType)
    ok  = graphene.Boolean()

    def mutate(root, info, nombre, descripcion=None):
        rol = Rol.objects.create(nombre=nombre, descripcion=descripcion)
        return CrearRol(rol=rol, ok=True)


class ActualizarRol(graphene.Mutation):
    class Arguments:
        id_rol      = graphene.Int(required=True)
        nombre      = graphene.String()
        descripcion = graphene.String()
        estado      = graphene.String()

    rol = graphene.Field(RolType)
    ok  = graphene.Boolean()

    def mutate(root, info, id_rol, **kwargs):
        try:
            rol = Rol.objects.get(pk=id_rol)
            for key, value in kwargs.items():
                setattr(rol, key, value)
            rol.save()
            return ActualizarRol(rol=rol, ok=True)
        except Rol.DoesNotExist:
            return ActualizarRol(rol=None, ok=False)


class CrearPermiso(graphene.Mutation):
    class Arguments:
        nombre      = graphene.String(required=True)
        descripcion = graphene.String()

    permiso = graphene.Field(PermisoType)
    ok      = graphene.Boolean()

    def mutate(root, info, nombre, descripcion=None):
        permiso = Permiso.objects.create(nombre=nombre, descripcion=descripcion)
        return CrearPermiso(permiso=permiso, ok=True)


class AsignarPermisoARol(graphene.Mutation):
    class Arguments:
        id_rol     = graphene.Int(required=True)
        id_permiso = graphene.Int(required=True)

    rol_permiso = graphene.Field(RolPermisoType)
    ok          = graphene.Boolean()

    def mutate(root, info, id_rol, id_permiso):
        try:
            rol     = Rol.objects.get(pk=id_rol)
            permiso = Permiso.objects.get(pk=id_permiso)
            rp, _   = RolPermiso.objects.get_or_create(id_rol=rol, id_permiso=permiso)
            return AsignarPermisoARol(rol_permiso=rp, ok=True)
        except (Rol.DoesNotExist, Permiso.DoesNotExist):
            return AsignarPermisoARol(rol_permiso=None, ok=False)


class CrearUsuario(graphene.Mutation):
    class Arguments:
        nombre   = graphene.String(required=True)
        username = graphene.String(required=True)
        correo   = graphene.String(required=True)
        password = graphene.String(required=True)
        paterno  = graphene.String()
        materno  = graphene.String()
        telefono = graphene.String()
        fecha    = graphene.Date()
        id_rol   = graphene.Int()

    usuario = graphene.Field(UsuarioType)
    ok      = graphene.Boolean()

    def mutate(root, info, nombre, username, correo, password,
               paterno=None, materno=None, telefono=None, fecha=None, id_rol=None):
        rol = Rol.objects.get(pk=id_rol) if id_rol else None
        usuario = Usuario(
            nombre=nombre, username=username, correo=correo,
            paterno=paterno, materno=materno, telefono=telefono,
            fecha=fecha, id_rol=rol
        )
        usuario.set_password(password)
        usuario.save()
        return CrearUsuario(usuario=usuario, ok=True)


class ActualizarUsuario(graphene.Mutation):
    class Arguments:
        id_usuario = graphene.Int(required=True)
        nombre     = graphene.String()
        paterno    = graphene.String()
        materno    = graphene.String()
        telefono   = graphene.String()
        estado     = graphene.String()
        id_rol     = graphene.Int()

    usuario = graphene.Field(UsuarioType)
    ok      = graphene.Boolean()

    def mutate(root, info, id_usuario, id_rol=None, **kwargs):
        try:
            usuario = Usuario.objects.get(pk=id_usuario)
            for key, value in kwargs.items():
                setattr(usuario, key, value)
            if id_rol is not None:
                usuario.id_rol = Rol.objects.get(pk=id_rol)
            usuario.save()
            return ActualizarUsuario(usuario=usuario, ok=True)
        except Usuario.DoesNotExist:
            return ActualizarUsuario(usuario=None, ok=False)


class CambiarPassword(graphene.Mutation):
    class Arguments:
        id_usuario   = graphene.Int(required=True)
        password_new = graphene.String(required=True)

    ok      = graphene.Boolean()
    mensaje = graphene.String()

    def mutate(root, info, id_usuario, password_new):
        try:
            usuario = Usuario.objects.get(pk=id_usuario)
            usuario.set_password(password_new)
            usuario.save()
            return CambiarPassword(ok=True, mensaje='Contraseña actualizada')
        except Usuario.DoesNotExist:
            return CambiarPassword(ok=False, mensaje='Usuario no encontrado')


class LoginUsuario(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)

    usuario = graphene.Field(UsuarioType)
    ok      = graphene.Boolean()
    mensaje = graphene.String()

    def mutate(root, info, username, password):
        try:
            usuario = Usuario.objects.get(username=username)
            if usuario.esta_bloqueado():
                return LoginUsuario(ok=False, mensaje='Usuario bloqueado temporalmente')
            if usuario.check_password(password):
                usuario.resetear_intentos()
                return LoginUsuario(usuario=usuario, ok=True, mensaje='Login exitoso')
            else:
                usuario.registrar_intento_fallido()
                return LoginUsuario(ok=False, mensaje='Credenciales incorrectas')
        except Usuario.DoesNotExist:
            return LoginUsuario(ok=False, mensaje='Usuario no encontrado')


class AsignarRolPermisoAUsuario(graphene.Mutation):
    class Arguments:
        id_usuario     = graphene.Int(required=True)
        id_rol_permiso = graphene.Int(required=True)

    ok      = graphene.Boolean()
    mensaje = graphene.String()

    def mutate(root, info, id_usuario, id_rol_permiso):
        try:
            usuario     = Usuario.objects.get(pk=id_usuario)
            rol_permiso = RolPermiso.objects.get(pk=id_rol_permiso)
            RolPermisoUsuario.objects.get_or_create(
                id_usuario=usuario,
                id_rol_permiso=rol_permiso
            )
            return AsignarRolPermisoAUsuario(ok=True, mensaje='Asignado correctamente')
        except (Usuario.DoesNotExist, RolPermiso.DoesNotExist):
            return AsignarRolPermisoAUsuario(ok=False, mensaje='Usuario o RolPermiso no encontrado')


class Mutation(graphene.ObjectType):
    crear_rol                    = CrearRol.Field()
    actualizar_rol               = ActualizarRol.Field()
    crear_permiso                = CrearPermiso.Field()
    asignar_permiso_a_rol        = AsignarPermisoARol.Field()
    crear_usuario                = CrearUsuario.Field()
    actualizar_usuario           = ActualizarUsuario.Field()
    cambiar_password             = CambiarPassword.Field()
    login_usuario                = LoginUsuario.Field()
    asignar_rol_permiso_a_usuario = AsignarRolPermisoAUsuario.Field()