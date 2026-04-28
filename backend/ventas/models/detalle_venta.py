from django.db import models
from .nota_venta import NotaVenta
from inventario.models import Producto, Almacen


class DetalleVenta(models.Model):
    id_detalle_venta = models.AutoField(primary_key=True)
    cantidad         = models.DecimalField(max_digits=10, decimal_places=2)
    precio_uni       = models.DecimalField(max_digits=12, decimal_places=2)
    precio_subtotal  = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    id_venta         = models.ForeignKey(
                            NotaVenta,
                            on_delete=models.CASCADE,
                            db_column='id_venta',
                            related_name='detalles'
                       )
    id_producto      = models.ForeignKey(
                            Producto,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            db_column='id_producto',
                            related_name='detalles_venta'
                       )
    id_almacen       = models.ForeignKey(
                            Almacen,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            db_column='id_almacen',
                            related_name='detalles_venta'
                       )

    class Meta:
        db_table = 'detalle_venta'
        verbose_name = 'Detalle de Venta'
        verbose_name_plural = 'Detalles de Venta'

    def __str__(self):
        return f"Detalle venta #{self.id_detalle_venta}"