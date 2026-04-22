from django.db import models


class Proveedor(models.Model):
    id_proveedor   = models.AutoField(primary_key=True)
    nombre         = models.CharField(max_length=150)
    telefono       = models.CharField(max_length=20, blank=True, null=True)
    email          = models.EmailField(max_length=150, blank=True, null=True)
    direccion      = models.CharField(max_length=200, blank=True, null=True)
    nit            = models.CharField(max_length=20, blank=True, null=True)
    contacto       = models.CharField(max_length=100, blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    estado         = models.CharField(max_length=20, default='activo')

    class Meta:
        db_table = 'proveedor'
        verbose_name = 'Proveedor'
        verbose_name_plural = 'Proveedores'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre