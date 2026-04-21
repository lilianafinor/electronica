from django.db import models
from .usuario import Usuario
from .rol_permiso import RolPermiso


class RolPermisoUsuario(models.Model):
    id_rol_permiso_usuario = models.AutoField(primary_key=True)
    id_usuario             = models.ForeignKey(
                                Usuario,
                                on_delete=models.CASCADE,
                                db_column='id_usuario',
                                related_name='rol_permisos'
                             )
    id_rol_permiso         = models.ForeignKey(
                                RolPermiso,
                                on_delete=models.CASCADE,
                                db_column='id_rol_permiso',
                                related_name='usuarios'
                             )

    class Meta:
        db_table = 'rol_permiso_usuario'
        unique_together = ('id_usuario', 'id_rol_permiso')
        verbose_name = 'Rol-Permiso de Usuario'
        verbose_name_plural = 'Roles-Permisos de Usuarios'

    def __str__(self):
        return f"{self.id_usuario} → {self.id_rol_permiso}"