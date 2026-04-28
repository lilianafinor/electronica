from django.db import models
from ventas.models import Cliente


class Equipo(models.Model):
    id_equipo    = models.AutoField(primary_key=True)
    nombre       = models.CharField(max_length=150)
    modelo       = models.CharField(max_length=100, blank=True, null=True)
    descripcion  = models.TextField(blank=True, null=True)
    tipo_equipo  = models.CharField(max_length=100, blank=True, null=True)
    serie_imei   = models.CharField(max_length=100, blank=True, null=True)
    fecha_ingreso = models.DateField(auto_now_add=True)
    estado       = models.CharField(max_length=20, default='activo')
    id_cliente   = models.ForeignKey(
                        Cliente,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_cliente',
                        related_name='equipos'
                   )

    class Meta:
        db_table = 'equipo'
        verbose_name = 'Equipo'
        verbose_name_plural = 'Equipos'
        ordering = ['-fecha_ingreso']

    def __str__(self):
        return f"{self.nombre} — {self.modelo or ''}"