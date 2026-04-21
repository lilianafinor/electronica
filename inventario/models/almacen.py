from django.db import models


class Almacen(models.Model):
    id_almacen   = models.AutoField(primary_key=True)
    nombre       = models.CharField(max_length=100)
    descripcion  = models.TextField(blank=True, null=True)
    direccion    = models.CharField(max_length=200, blank=True, null=True)
    cantidad_max = models.IntegerField(blank=True, null=True)
    estado       = models.CharField(max_length=20, default='activo')

    class Meta:
        db_table = 'almacen'
        verbose_name = 'Almacén'
        verbose_name_plural = 'Almacenes'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre