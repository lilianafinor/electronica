from django.db import models
from .nota_egreso import NotaEgreso
from .producto import Producto
from .almacen import Almacen


class DetalleEgreso(models.Model):
    id_detalle_egreso = models.AutoField(primary_key=True)
    cantidad          = models.DecimalField(max_digits=10, decimal_places=2)
    observacion       = models.TextField(blank=True, null=True)
    id_egreso         = models.ForeignKey(
                            NotaEgreso,
                            on_delete=models.CASCADE,
                            db_column='id_egreso',
                            related_name='detalles'
                         )
    id_producto       = models.ForeignKey(
                            Producto,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            db_column='id_producto',
                            related_name='detalles_egreso'
                         )
    id_almacen        = models.ForeignKey(
                            Almacen,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            db_column='id_almacen',
                            related_name='detalles_egreso'
                         )

    class Meta:
        db_table = 'detalle_egreso'
        verbose_name = 'Detalle de Egreso'
        verbose_name_plural = 'Detalles de Egreso'

    def __str__(self):
        return f"Detalle egreso #{self.id_detalle_egreso}"