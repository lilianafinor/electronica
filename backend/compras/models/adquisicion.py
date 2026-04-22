from django.db import models
from usuarios.models import Usuario
from .proveedor import Proveedor
from .orden_compra import OrdenCompra


class Adquisicion(models.Model):
    id_adquisicion = models.AutoField(primary_key=True)
    fecha          = models.DateField()
    estado         = models.CharField(max_length=20, default='activo')
    glosa          = models.TextField(blank=True, null=True)
    id_orden       = models.ForeignKey(
                        OrdenCompra,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_orden',
                        related_name='adquisiciones'
                     )
    id_proveedor   = models.ForeignKey(
                        Proveedor,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_proveedor',
                        related_name='adquisiciones'
                     )
    id_usuario     = models.ForeignKey(
                        Usuario,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_usuario',
                        related_name='adquisiciones'
                     )

    class Meta:
        db_table = 'adquisicion'
        verbose_name = 'Adquisición'
        verbose_name_plural = 'Adquisiciones'
        ordering = ['-fecha']

    def __str__(self):
        return f"Adquisición #{self.id_adquisicion} — {self.fecha}"