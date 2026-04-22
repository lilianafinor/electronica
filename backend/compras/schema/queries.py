import graphene
from graphene_django import DjangoObjectType
from compras.models import (
    Proveedor, OrdenCompra, DetalleOrdenCompra,
    NotaCompra, DetalleCompra, Adquisicion, DetalleAdquisicion
)


class ProveedorType(DjangoObjectType):
    class Meta:
        model = Proveedor
        fields = ('id_proveedor', 'nombre', 'telefono', 'email',
                  'direccion', 'nit', 'contacto', 'fecha_registro', 'estado')


class OrdenCompraType(DjangoObjectType):
    class Meta:
        model = OrdenCompra
        fields = ('id_orden', 'fecha', 'estado', 'glosa', 'total',
                  'id_proveedor', 'id_usuario', 'detalles')


class DetalleOrdenCompraType(DjangoObjectType):
    class Meta:
        model = DetalleOrdenCompra
        fields = ('id_detalle_orden', 'cantidad', 'precio_uni', 'sub_total',
                  'id_orden', 'id_producto')


class NotaCompraType(DjangoObjectType):
    class Meta:
        model = NotaCompra
        fields = ('id_compra', 'fecha_compra', 'total_compra', 'nro_factura',
                  'estado', 'glosa', 'tipo_pago', 'id_proveedor', 'id_usuario', 'detalles')


class DetalleCompraType(DjangoObjectType):
    class Meta:
        model = DetalleCompra
        fields = ('id_detalle_compra', 'cantidad', 'precio_uni', 'sub_total',
                  'id_compra', 'id_producto')


class AdquisicionType(DjangoObjectType):
    class Meta:
        model = Adquisicion
        fields = ('id_adquisicion', 'fecha', 'estado', 'glosa',
                  'id_orden', 'id_proveedor', 'id_usuario', 'detalles')


class DetalleAdquisicionType(DjangoObjectType):
    class Meta:
        model = DetalleAdquisicion
        fields = ('id_detalle_adq', 'cantidad', 'precio_uni', 'sub_total',
                  'id_adquisicion', 'id_producto', 'id_almacen')


class Query(graphene.ObjectType):
    proveedores    = graphene.List(ProveedorType)
    proveedor      = graphene.Field(ProveedorType, id_proveedor=graphene.Int(required=True))
    ordenes_compra = graphene.List(OrdenCompraType)
    orden_compra   = graphene.Field(OrdenCompraType, id_orden=graphene.Int(required=True))
    notas_compra   = graphene.List(NotaCompraType)
    nota_compra    = graphene.Field(NotaCompraType, id_compra=graphene.Int(required=True))
    adquisiciones  = graphene.List(AdquisicionType)
    adquisicion    = graphene.Field(AdquisicionType, id_adquisicion=graphene.Int(required=True))

    def resolve_proveedores(root, info):
        return Proveedor.objects.filter(estado='activo')

    def resolve_proveedor(root, info, id_proveedor):
        try:
            return Proveedor.objects.get(pk=id_proveedor)
        except Proveedor.DoesNotExist:
            return None

    def resolve_ordenes_compra(root, info):
        return OrdenCompra.objects.select_related('id_proveedor', 'id_usuario').prefetch_related('detalles').all()

    def resolve_orden_compra(root, info, id_orden):
        try:
            return OrdenCompra.objects.get(pk=id_orden)
        except OrdenCompra.DoesNotExist:
            return None

    def resolve_notas_compra(root, info):
        return NotaCompra.objects.select_related('id_proveedor', 'id_usuario').prefetch_related('detalles').all()

    def resolve_nota_compra(root, info, id_compra):
        try:
            return NotaCompra.objects.get(pk=id_compra)
        except NotaCompra.DoesNotExist:
            return None

    def resolve_adquisiciones(root, info):
        return Adquisicion.objects.select_related(
            'id_proveedor', 'id_usuario', 'id_orden'
        ).prefetch_related('detalles').all()

    def resolve_adquisicion(root, info, id_adquisicion):
        try:
            return Adquisicion.objects.get(pk=id_adquisicion)
        except Adquisicion.DoesNotExist:
            return None