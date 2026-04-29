import graphene
from graphene_django import DjangoObjectType
from ventas.models import Cliente, NotaVenta, DetalleVenta


class ClienteType(DjangoObjectType):
    nombre_completo = graphene.String()

    class Meta:
        model = Cliente
        fields = ('id_cliente', 'nombre', 'paterno', 'materno',
                  'telefono', 'correo', 'nit', 'direccion', 'estado')

    def resolve_nombre_completo(self, info):
        return self.get_nombre_completo()


class NotaVentaType(DjangoObjectType):
    class Meta:
        model = NotaVenta
        fields = ('id_venta', 'fecha_venta', 'monto_total', 'glosa',
                  'estado', 'tipo_pago', 'id_cliente', 'id_usuario', 'detalles')


class DetalleVentaType(DjangoObjectType):
    class Meta:
        model = DetalleVenta
        fields = ('id_detalle_venta', 'cantidad', 'precio_uni', 'precio_subtotal',
                  'id_venta', 'id_producto', 'id_almacen')


class Query(graphene.ObjectType):
    clientes             = graphene.List(ClienteType)
    cliente              = graphene.Field(ClienteType, id_cliente=graphene.Int(required=True))
    cliente_por_nit      = graphene.Field(ClienteType, nit=graphene.String(required=True))
    notas_venta          = graphene.List(NotaVentaType)
    nota_venta           = graphene.Field(NotaVentaType, id_venta=graphene.Int(required=True))

    def resolve_clientes(root, info):
        return Cliente.objects.filter(estado='activo')

    def resolve_cliente(root, info, id_cliente):
        try:
            return Cliente.objects.get(pk=id_cliente)
        except Cliente.DoesNotExist:
            return None

    def resolve_cliente_por_nit(root, info, nit):
        try:
            return Cliente.objects.get(nit=nit, estado='activo')
        except Cliente.DoesNotExist:
            return None

    def resolve_notas_venta(root, info):
        return NotaVenta.objects.select_related(
            'id_cliente', 'id_usuario'
        ).prefetch_related('detalles').all()

    def resolve_nota_venta(root, info, id_venta):
        try:
            return NotaVenta.objects.get(pk=id_venta)
        except NotaVenta.DoesNotExist:
            return None