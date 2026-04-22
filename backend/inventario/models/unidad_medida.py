from django.db import models


class UnidadMedida(models.Model):
    id_unidad   = models.AutoField(primary_key=True)
    nombre      = models.CharField(max_length=100, unique=True)
    abreviatura = models.CharField(max_length=10, blank=True, null=True)
    estado      = models.CharField(max_length=20, default='activo')

    class Meta:
        db_table = 'unidad_medida'
        verbose_name = 'Unidad de Medida'
        verbose_name_plural = 'Unidades de Medida'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre