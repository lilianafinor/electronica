from django.db import models
from .nota_ingreso import NotaIngreso
from .articulo import Producto
from .almacen import Almacen


class DetalleIngreso(models.Model):
    id_detalle_ingreso = models.AutoField(primary_key=True)
    cantidad           = models.DecimalField(max_digits=10, decimal_places=2)
    observacion        = models.TextField(blank=True, null=True)
    id_ingreso         = models.ForeignKey(
                            NotaIngreso,
                            on_delete=models.CASCADE,
                            db_column='id_ingreso',
                            related_name='detalles'
                         )
    id_producto        = models.ForeignKey(
                            Producto,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            db_column='id_producto',
                            related_name='detalles_ingreso'
                         )
    id_almacen         = models.ForeignKey(
                            Almacen,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            db_column='id_almacen',
                            related_name='detalles_ingreso'
                         )

    class Meta:
        db_table = 'detalle_ingreso'
        verbose_name = 'Detalle de Ingreso'
        verbose_name_plural = 'Detalles de Ingreso'

    def __str__(self):
        return f"Detalle ingreso #{self.id_detalle_ingreso}"
