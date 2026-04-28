from django.db import models


class Cliente(models.Model):
    id_cliente = models.AutoField(primary_key=True)
    nombre     = models.CharField(max_length=100)
    paterno    = models.CharField(max_length=100, blank=True, null=True)
    materno    = models.CharField(max_length=100, blank=True, null=True)
    telefono   = models.CharField(max_length=20, blank=True, null=True)
    correo     = models.EmailField(max_length=150, blank=True, null=True)
    nit        = models.CharField(max_length=20, blank=True, null=True)
    direccion  = models.CharField(max_length=200, blank=True, null=True)
    estado     = models.CharField(max_length=20, default='activo')

    class Meta:
        db_table = 'cliente'
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['paterno', 'nombre']

    def __str__(self):
        return f"{self.nombre} {self.paterno or ''}"

    def get_nombre_completo(self):
        return f"{self.nombre} {self.paterno or ''} {self.materno or ''}".strip()