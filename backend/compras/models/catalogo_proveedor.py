from django.db import models
from .proveedor import Proveedor
from inventario.models import Producto


class CatalogoProveedor(models.Model):
    id_catalogo      = models.AutoField(primary_key=True)
    precio_unitario  = models.DecimalField(max_digits=12, decimal_places=2)
    stock_disponible = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    estado           = models.CharField(max_length=20, default='activo')
    id_proveedor     = models.ForeignKey(
                            Proveedor,
                            on_delete=models.CASCADE,
                            db_column='id_proveedor',
                            related_name='catalogo'
                       )
    id_producto      = models.ForeignKey(
                            Producto,
                            on_delete=models.CASCADE,
                            db_column='id_producto',
                            related_name='catalogos'
                       )

    class Meta:
        db_table        = 'catalogo_proveedor'
        unique_together = ('id_proveedor', 'id_producto')
        verbose_name        = 'Catálogo de Proveedor'
        verbose_name_plural = 'Catálogos de Proveedores'

    def __str__(self):
        return f"{self.id_proveedor.nombre} — {self.id_producto.nombre}"