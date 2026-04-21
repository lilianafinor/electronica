from django.db import models
from usuarios.models import Usuario


class NotaEgreso(models.Model):
    id_egreso  = models.AutoField(primary_key=True)
    fecha      = models.DateField()
    glosa      = models.TextField(blank=True, null=True)
    motivo     = models.CharField(max_length=200, blank=True, null=True)
    estado     = models.CharField(max_length=20, default='activo')
    id_usuario = models.ForeignKey(
                    Usuario,
                    on_delete=models.SET_NULL,
                    null=True, blank=True,
                    db_column='id_usuario',
                    related_name='egresos'
                 )

    class Meta:
        db_table = 'nota_egreso'
        verbose_name = 'Nota de Egreso'
        verbose_name_plural = 'Notas de Egreso'
        ordering = ['-fecha']

    def __str__(self):
        return f"Egreso #{self.id_egreso} — {self.fecha}"