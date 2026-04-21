from django.db import models


class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre       = models.CharField(max_length=100, unique=True)
    descripcion  = models.TextField(blank=True, null=True)
    estado       = models.CharField(max_length=20, default='activo')

    class Meta:
        db_table = 'categoria'
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre