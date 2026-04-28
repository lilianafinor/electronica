from django.db import models
from .traspaso import Traspaso
from .articulo import Producto
from .almacen import Almacen


class DetalleTraspaso(models.Model):
    id_detalle_traspaso = models.AutoField(primary_key=True)
    cantidad            = models.DecimalField(max_digits=10, decimal_places=2)
    id_traspaso         = models.ForeignKey(
                            Traspaso,
                            on_delete=models.CASCADE,
                            db_column='id_traspaso',
                            related_name='detalles'
                          )
    id_producto         = models.ForeignKey(
                            Producto,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            db_column='id_producto',
                            related_name='detalles_traspaso'
                          )
    id_almacen          = models.ForeignKey(
                            Almacen,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            db_column='id_almacen',
                            related_name='detalles_traspaso'
                          )

    class Meta:
        db_table = 'detalle_traspaso'
        verbose_name = 'Detalle de Traspaso'
        verbose_name_plural = 'Detalles de Traspaso'

    def __str__(self):
        return f"Detalle traspaso #{self.id_detalle_traspaso}"
