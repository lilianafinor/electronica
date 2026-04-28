from django.db import models
from decimal import Decimal
from .cotizacion_reparacion import CotizacionReparacion
from .tipo_detalle import TipoDetalle
from inventario.models import Producto


class DetalleReparacion(models.Model):
    id_detalle_reparacion = models.AutoField(primary_key=True)
    descripcion           = models.TextField(blank=True, null=True)
    observaciones         = models.TextField(blank=True, null=True)
    cantidad              = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    precio_unitario       = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    precio_total          = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    id_cotizacion         = models.ForeignKey(
                                CotizacionReparacion,
                                on_delete=models.CASCADE,
                                db_column='id_cotizacion',
                                related_name='detalles'
                            )
    id_tipo_detalle       = models.ForeignKey(
                                TipoDetalle,
                                on_delete=models.SET_NULL,
                                null=True, blank=True,
                                db_column='id_tipo_detalle',
                                related_name='detalles'
                            )
    id_producto           = models.ForeignKey(
                                Producto,
                                on_delete=models.SET_NULL,
                                null=True, blank=True,
                                db_column='id_producto',
                                related_name='detalles_reparacion'
                            )

    class Meta:
        db_table = 'detalle_reparacion'
        verbose_name = 'Detalle de Reparación'
        verbose_name_plural = 'Detalles de Reparación'

    def __str__(self):
        return f"Detalle #{self.id_detalle_reparacion}"