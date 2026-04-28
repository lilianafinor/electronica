from django.db import models
from usuarios.models import Usuario
from ventas.models import Cliente
from .equipo import Equipo
from .tipo_reparacion import TipoReparacion


class NotaReparacion(models.Model):
    TIPO_PAGO_CHOICES = [
        ('qr', 'QR'),
        ('contado', 'Contado'),
        ('transferencia', 'Transferencia'),
    ]
    ESTADO_CHOICES = [
        ('recibido',    'Recibido'),
        ('diagnostico', 'En Diagnóstico'),
        ('cotizado',    'Cotizado'),
        ('aprobado',    'Aprobado'),
        ('en_reparacion', 'En Reparación'),
        ('listo',       'Listo'),
        ('entregado',   'Entregado'),
        ('cancelado',   'Cancelado'),
    ]
    id_nota_reparacion = models.AutoField(primary_key=True)
    fecha              = models.DateField(auto_now_add=True)
    falla_reportada    = models.TextField()
    falla_real         = models.TextField(blank=True, null=True)
    fecha_entrega      = models.DateField(blank=True, null=True)
    monto              = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tipo_pago          = models.CharField(max_length=20, choices=TIPO_PAGO_CHOICES, default='qr')
    estado             = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='recibido')
    id_equipo          = models.ForeignKey(
                            Equipo,
                            on_delete=models.CASCADE,
                            db_column='id_equipo',
                            related_name='reparaciones'
                         )
    id_cliente         = models.ForeignKey(
                            Cliente,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            db_column='id_cliente',
                            related_name='reparaciones'
                         )
    id_usuario         = models.ForeignKey(
                            Usuario,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            db_column='id_usuario',
                            related_name='reparaciones'
                         )
    id_tipo_reparacion = models.ForeignKey(
                            TipoReparacion,
                            on_delete=models.SET_NULL,
                            null=True, blank=True,
                            db_column='id_tipo_reparacion',
                            related_name='reparaciones'
                         )

    class Meta:
        db_table = 'nota_reparacion'
        verbose_name = 'Nota de Reparación'
        verbose_name_plural = 'Notas de Reparación'
        ordering = ['-fecha']

    def __str__(self):
        return f"Reparación #{self.id_nota_reparacion} — {self.estado}"