from django.db import models
from .adquisicion import Adquisicion
from inventario.models import Producto, Almacen


class DetalleAdquisicion(models.Model):
    id_detalle_adq = models.AutoField(primary_key=True)
    cantidad       = models.DecimalField(max_digits=10, decimal_places=2)
    precio_uni     = models.DecimalField(max_digits=12, decimal_places=2)
    sub_total      = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    id_adquisicion = models.ForeignKey(
                        Adquisicion,
                        on_delete=models.CASCADE,
                        db_column='id_adquisicion',
                        related_name='detalles'
                     )
    id_producto    = models.ForeignKey(
                        Producto,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_producto',
                        related_name='detalles_adquisicion'
                     )
    id_almacen     = models.ForeignKey(
                        Almacen,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_almacen',
                        related_name='detalles_adquisicion'
                     )

    class Meta:
        db_table = 'detalle_adquisicion'
        verbose_name = 'Detalle de Adquisición'
        verbose_name_plural = 'Detalles de Adquisición'

    def __str__(self):
        return f"Detalle adquisición #{self.id_detalle_adq}"