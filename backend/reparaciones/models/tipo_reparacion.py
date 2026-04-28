from django.db import models


class TipoReparacion(models.Model):
    id_tipo_reparacion = models.AutoField(primary_key=True)
    nombre             = models.CharField(max_length=100)
    descripcion        = models.TextField(blank=True, null=True)
    estado             = models.CharField(max_length=20, default='activo')

    class Meta:
        db_table = 'tipo_reparacion'
        verbose_name = 'Tipo de Reparación'
        verbose_name_plural = 'Tipos de Reparación'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre