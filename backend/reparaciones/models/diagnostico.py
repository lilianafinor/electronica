from django.db import models
from .nota_reparacion import NotaReparacion


class Diagnostico(models.Model):
    id_diagnostico     = models.AutoField(primary_key=True)
    descripcion        = models.TextField()
    causa_raiz         = models.TextField(blank=True, null=True)
    tiempo_estimado_hrs = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    fecha_diagnostico  = models.DateField(auto_now_add=True)
    id_nota_reparacion = models.OneToOneField(
                            NotaReparacion,
                            on_delete=models.CASCADE,
                            db_column='id_nota_reparacion',
                            related_name='diagnostico'
                         )

    class Meta:
        db_table = 'diagnostico'
        verbose_name = 'Diagnóstico'
        verbose_name_plural = 'Diagnósticos'

    def __str__(self):
        return f"Diagnóstico #{self.id_diagnostico}"