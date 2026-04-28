from django.db import models
from .marca import Marca
from .categoria import Categoria
from .unidad_medida import UnidadMedida


class Producto(models.Model):
    id_producto  = models.AutoField(primary_key=True)
    nombre       = models.CharField(max_length=150)
    descripcion  = models.TextField(blank=True, null=True)
    precio       = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estado       = models.CharField(max_length=20, default='activo')
    id_marca     = models.ForeignKey(
                        Marca,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_marca',
                        related_name='productos'
                   )
    id_categoria = models.ForeignKey(
                        Categoria,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_categoria',
                        related_name='productos'
                   )
    id_unidad    = models.ForeignKey(
                        UnidadMedida,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_unidad',
                        related_name='productos'
                   )

    class Meta:
        db_table     = 'producto'
        verbose_name = 'Artículo'
        verbose_name_plural = 'Artículos'
        ordering     = ['nombre']

    def __str__(self):
        return self.nombre