from django.db import models
from usuarios.models import Usuario
from .proveedor import Proveedor


class NotaCompra(models.Model):
    TIPO_PAGO_CHOICES = [
        ('contado', 'Contado'),
        ('credito', 'Crédito'),
        ('transferencia', 'Transferencia'),
    ]
    id_compra     = models.AutoField(primary_key=True)
    fecha_compra  = models.DateField()
    total_compra  = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    nro_factura   = models.CharField(max_length=50, blank=True, null=True)
    estado        = models.CharField(max_length=20, default='activo')
    glosa         = models.TextField(blank=True, null=True)
    tipo_pago     = models.CharField(max_length=20, choices=TIPO_PAGO_CHOICES, default='contado')
    id_proveedor  = models.ForeignKey(
                        Proveedor,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_proveedor',
                        related_name='notas_compra'
                    )
    id_usuario    = models.ForeignKey(
                        Usuario,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_usuario',
                        related_name='notas_compra'
                    )

    class Meta:
        db_table = 'nota_compra'
        verbose_name = 'Nota de Compra'
        verbose_name_plural = 'Notas de Compra'
        ordering = ['-fecha_compra']

    def __str__(self):
        return f"Compra #{self.id_compra} — {self.fecha_compra}"