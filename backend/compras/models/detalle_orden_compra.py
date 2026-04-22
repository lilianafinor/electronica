from django.db import models
from .orden_compra import OrdenCompra
from inventario.models import Producto


class DetalleOrdenCompra(models.Model):
    id_detalle_orden = models.AutoField(primary_key=True)
    cantidad         = models.DecimalField(max_digits=10, decimal_places=2)
    precio_uni       = models.DecimalField(max_digits=12, decimal_places=2)
    sub_total        = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    id_orden         = models.ForeignKey(
                            OrdenCompra,
                            on_delete=models.CASCADE,
                            db_column='id_orden',
                            related_name='detalles'
                       )
    id_producto      = models.ForeignKey(
                            Producto,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            db_column='id_producto',
                            related_name='detalles_orden'
                       )

    class Meta:
        db_table = 'detalle_orden_compra'
        verbose_name = 'Detalle de Orden de Compra'
        verbose_name_plural = 'Detalles de Orden de Compra'

    def __str__(self):
        return f"Detalle orden #{self.id_detalle_orden}"