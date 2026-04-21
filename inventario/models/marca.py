from django.db import models


class Marca(models.Model):
    id_marca    = models.AutoField(primary_key=True)
    nombre      = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    estado      = models.CharField(max_length=20, default='activo')

    class Meta:
        db_table = 'marca'
        verbose_name = 'Marca'
        verbose_name_plural = 'Marcas'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre