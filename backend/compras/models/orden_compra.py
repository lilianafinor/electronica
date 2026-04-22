from django.db import models
from usuarios.models import Usuario
from .proveedor import Proveedor


class OrdenCompra(models.Model):
    id_orden       = models.AutoField(primary_key=True)
    fecha          = models.DateField()
    estado         = models.CharField(max_length=20, default='pendiente')
    glosa          = models.TextField(blank=True, null=True)
    total          = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    id_proveedor   = models.ForeignKey(
                        Proveedor,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_proveedor',
                        related_name='ordenes'
                     )
    id_usuario     = models.ForeignKey(
                        Usuario,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_usuario',
                        related_name='ordenes_compra'
                     )

    class Meta:
        db_table = 'orden_compra'
        verbose_name = 'Orden de Compra'
        verbose_name_plural = 'Órdenes de Compra'
        ordering = ['-fecha']

    def __str__(self):
        return f"Orden #{self.id_orden} — {self.fecha}"