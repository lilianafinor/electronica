from django.db import models
from .rol import Rol
from .permiso import Permiso


class RolPermiso(models.Model):
    id_rol_permiso = models.AutoField(primary_key=True)
    id_rol         = models.ForeignKey(
                        Rol,
                        on_delete=models.CASCADE,
                        db_column='id_rol',
                        related_name='rol_permisos'
                     )
    id_permiso     = models.ForeignKey(
                        Permiso,
                        on_delete=models.CASCADE,
                        db_column='id_permiso',
                        related_name='rol_permisos'
                     )

    class Meta:
        db_table = 'rol_permiso'
        unique_together = ('id_rol', 'id_permiso')
        verbose_name = 'Rol - Permiso'
        verbose_name_plural = 'Roles - Permisos'

    def __str__(self):
        return f"{self.id_rol.nombre} → {self.id_permiso.nombre}"