from django.db import models


class GesPrecio(models.Model):
    METODO_CHOICES = [
        ('PEPS', 'Primero en Entrar, Primero en Salir'),
        ('UEPS', 'Último en Entrar, Primero en Salir'),
        ('PROMEDIO', 'Promedio Ponderado'),
    ]
    id_ges_precio     = models.AutoField(primary_key=True)
    precio_compra     = models.DecimalField(max_digits=12, decimal_places=2)
    precio_venta      = models.DecimalField(max_digits=12, decimal_places=2)
    fecha             = models.DateField()
    metodo_inventario = models.CharField(max_length=20, choices=METODO_CHOICES, default='PROMEDIO')

    class Meta:
        db_table = 'ges_precio'
        verbose_name = 'Gestor de Precio'
        verbose_name_plural = 'Gestores de Precio'
        ordering = ['-fecha']

    def __str__(self):
        return f"Precio #{self.id_ges_precio} — {self.metodo_inventario}"