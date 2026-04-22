from django.db import models
from usuarios.models import Usuario


class NotaIngreso(models.Model):
    id_ingreso = models.AutoField(primary_key=True)
    fecha      = models.DateField()
    glosa      = models.TextField(blank=True, null=True)
    motivo     = models.CharField(max_length=200, blank=True, null=True)
    estado     = models.CharField(max_length=20, default='activo')
    id_usuario = models.ForeignKey(
                    Usuario,
                    on_delete=models.SET_NULL,
                    null=True, blank=True,
                    db_column='id_usuario',
                    related_name='ingresos'
                 )

    class Meta:
        db_table = 'nota_ingreso'
        verbose_name = 'Nota de Ingreso'
        verbose_name_plural = 'Notas de Ingreso'
        ordering = ['-fecha']

    def __str__(self):
        return f"Ingreso #{self.id_ingreso} — {self.fecha}"