from django.db import models
from .diagnostico import Diagnostico


class CotizacionReparacion(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobada',  'Aprobada'),
        ('rechazada', 'Rechazada'),
    ]
    id_cotizacion  = models.AutoField(primary_key=True)
    costo_repuesto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    mano_obra      = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total          = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estado         = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    id_diagnostico = models.OneToOneField(
                        Diagnostico,
                        on_delete=models.CASCADE,
                        db_column='id_diagnostico',
                        related_name='cotizacion'
                     )

    class Meta:
        db_table = 'cotizacion_reparacion'
        verbose_name = 'Cotización de Reparación'
        verbose_name_plural = 'Cotizaciones de Reparación'

    def __str__(self):
        return f"Cotización #{self.id_cotizacion} — {self.estado}"