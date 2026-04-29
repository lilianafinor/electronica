from django.db import models
from usuarios.models import Usuario
from .cliente import Cliente


class NotaVenta(models.Model):
    TIPO_PAGO_CHOICES = [
        ('contado', 'Contado'),
        ('credito', 'Crédito'),
        ('transferencia', 'Transferencia'),
        ('qr', 'QR'),
    ]
    id_venta    = models.AutoField(primary_key=True)
    fecha_venta = models.DateField()
    monto_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    glosa       = models.TextField(blank=True, null=True)
    estado      = models.CharField(max_length=20, default='activo')
    tipo_pago   = models.CharField(max_length=20, choices=TIPO_PAGO_CHOICES, default='contado')
    id_cliente  = models.ForeignKey(
                    Cliente,
                    on_delete=models.SET_NULL,
                    null=True, blank=True,
                    db_column='id_cliente',
                    related_name='ventas'
                  )
    id_usuario  = models.ForeignKey(
                    Usuario,
                    on_delete=models.SET_NULL,
                    null=True, blank=True,
                    db_column='id_usuario',
                    related_name='ventas'
                  )

    class Meta:
        db_table = 'nota_venta'
        verbose_name = 'Nota de Venta'
        verbose_name_plural = 'Notas de Venta'
        ordering = ['-fecha_venta']

    def __str__(self):
        return f"Venta #{self.id_venta} — {self.fecha_venta}"