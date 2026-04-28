from django.db import models


class TipoDetalle(models.Model):
    id_tipo     = models.AutoField(primary_key=True)
    nombre      = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'tipo_detalle'
        verbose_name = 'Tipo de Detalle'
        verbose_name_plural = 'Tipos de Detalle'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre