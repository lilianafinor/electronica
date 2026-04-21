from django.db import models
from usuarios.models import Usuario
from .almacen import Almacen


class Traspaso(models.Model):
    id_traspaso     = models.AutoField(primary_key=True)
    tipo            = models.CharField(max_length=50, blank=True, null=True)
    fecha           = models.DateField()
    glosa           = models.TextField(blank=True, null=True)
    estado          = models.CharField(max_length=20, default='activo')
    id_usuario      = models.ForeignKey(
                        Usuario,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='id_usuario',
                        related_name='traspasos'
                      )
    almacen_origen  = models.ForeignKey(
                        Almacen,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='almacen_origen',
                        related_name='traspasos_origen'
                      )
    almacen_destino = models.ForeignKey(
                        Almacen,
                        on_delete=models.SET_NULL,
                        null=True, blank=True,
                        db_column='almacen_destino',
                        related_name='traspasos_destino'
                      )

    class Meta:
        db_table = 'traspaso'
        verbose_name = 'Traspaso'
        verbose_name_plural = 'Traspasos'
        ordering = ['-fecha']

    def __str__(self):
        return f"Traspaso #{self.id_traspaso} — {self.fecha}"