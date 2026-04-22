from django.db import models
from .nota_compra import NotaCompra
from inventario.models import Producto


class DetalleCompra(models.Model):
    id_detalle_compra = models.AutoField(primary_key=True)
    cantidad          = models.DecimalField(max_digits=10, decimal_places=2)
    precio_uni        = models.DecimalField(max_digits=12, decimal_places=2)
    sub_total         = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    id_compra         = models.ForeignKey(
                            NotaCompra,
                            on_delete=models.CASCADE,
                            db_column='id_compra',
                            related_name='detalles'
                        )
    id_producto       = models.ForeignKey(
                            Producto,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            db_column='id_producto',
                            related_name='detalles_compra'
                        )

    class Meta:
        db_table = 'detalle_compra'
        verbose_name = 'Detalle de Compra'
        verbose_name_plural = 'Detalles de Compra'

    def __str__(self):
        return f"Detalle compra #{self.id_detalle_compra}"