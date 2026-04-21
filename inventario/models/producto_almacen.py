from django.db import models
from .producto import Producto
from .almacen import Almacen


class ProductoAlmacen(models.Model):
    id_producto_almacen = models.AutoField(primary_key=True)
    stock               = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_min           = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_max           = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    id_producto         = models.ForeignKey(
                            Producto,
                            on_delete=models.CASCADE,
                            db_column='id_producto',
                            related_name='almacenes'
                          )
    id_almacen          = models.ForeignKey(
                            Almacen,
                            on_delete=models.CASCADE,
                            db_column='id_almacen',
                            related_name='productos'
                          )

    class Meta:
        db_table = 'producto_almacen'
        unique_together = ('id_producto', 'id_almacen')
        verbose_name = 'Producto en Almacén'
        verbose_name_plural = 'Productos en Almacén'

    def __str__(self):
        return f"{self.id_producto.nombre} — {self.id_almacen.nombre}"