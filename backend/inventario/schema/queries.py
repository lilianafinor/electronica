import graphene
from graphene_django import DjangoObjectType
from inventario.models import (
    Almacen, Marca, Categoria, UnidadMedida, GesPrecio,
    Producto, ProductoAlmacen, NotaIngreso, DetalleIngreso,
    NotaEgreso, DetalleEgreso, Traspaso, DetalleTraspaso
)


class AlmacenType(DjangoObjectType):
    class Meta:
        model = Almacen
        fields = ('id_almacen', 'nombre', 'descripcion', 'direccion', 'cantidad_max', 'estado')


class MarcaType(DjangoObjectType):
    class Meta:
        model = Marca
        fields = ('id_marca', 'nombre', 'descripcion', 'estado')


class CategoriaType(DjangoObjectType):
    class Meta:
        model = Categoria
        fields = ('id_categoria', 'nombre', 'descripcion', 'estado')


class UnidadMedidaType(DjangoObjectType):
    class Meta:
        model = UnidadMedida
        fields = ('id_unidad', 'nombre', 'abreviatura', 'estado')


class GesPrecioType(DjangoObjectType):
    class Meta:
        model = GesPrecio
        fields = ('id_ges_precio', 'precio_compra', 'precio_venta', 'fecha', 'metodo_inventario')


class ProductoType(DjangoObjectType):
    class Meta:
        model = Producto
        fields = ('id_producto', 'nombre', 'descripcion', 'precio', 'estado',
                  'id_marca', 'id_categoria', 'id_unidad')


class ProductoAlmacenType(DjangoObjectType):
    class Meta:
        model = ProductoAlmacen
        fields = ('id_producto_almacen', 'stock', 'stock_min', 'stock_max',
                  'id_producto', 'id_almacen')


class NotaIngresoType(DjangoObjectType):
    class Meta:
        model = NotaIngreso
        fields = ('id_ingreso', 'fecha', 'glosa', 'motivo', 'estado', 'id_usuario', 'detalles')


class DetalleIngresoType(DjangoObjectType):
    class Meta:
        model = DetalleIngreso
        fields = ('id_detalle_ingreso', 'cantidad', 'observacion',
                  'id_ingreso', 'id_producto', 'id_almacen')


class NotaEgresoType(DjangoObjectType):
    class Meta:
        model = NotaEgreso
        fields = ('id_egreso', 'fecha', 'glosa', 'motivo', 'estado', 'id_usuario', 'detalles')


class DetalleEgresoType(DjangoObjectType):
    class Meta:
        model = DetalleEgreso
        fields = ('id_detalle_egreso', 'cantidad', 'observacion',
                  'id_egreso', 'id_producto', 'id_almacen')


class TraspasoType(DjangoObjectType):
    class Meta:
        model = Traspaso
        fields = ('id_traspaso', 'tipo', 'fecha', 'glosa', 'estado',
                  'id_usuario', 'almacen_origen', 'almacen_destino', 'detalles')


class DetalleTraspasoType(DjangoObjectType):
    class Meta:
        model = DetalleTraspaso
        fields = ('id_detalle_traspaso', 'cantidad', 'id_traspaso', 'id_producto', 'id_almacen')


class Query(graphene.ObjectType):
    almacenes         = graphene.List(AlmacenType)
    almacen           = graphene.Field(AlmacenType, id_almacen=graphene.Int(required=True))
    marcas            = graphene.List(MarcaType)
    marca             = graphene.Field(MarcaType, id_marca=graphene.Int(required=True))
    categorias        = graphene.List(CategoriaType)
    categoria         = graphene.Field(CategoriaType, id_categoria=graphene.Int(required=True))
    unidades_medida   = graphene.List(UnidadMedidaType)
    unidad_medida     = graphene.Field(UnidadMedidaType, id_unidad=graphene.Int(required=True))
    ges_precios       = graphene.List(GesPrecioType)
    articulos         = graphene.List(ProductoType)
    articulo          = graphene.Field(ProductoType, id_producto=graphene.Int(required=True))
    productos         = graphene.List(ProductoType)
    producto          = graphene.Field(ProductoType, id_producto=graphene.Int(required=True))
    productos_almacen = graphene.List(ProductoAlmacenType)
    notas_ingreso     = graphene.List(NotaIngresoType)
    nota_ingreso      = graphene.Field(NotaIngresoType, id_ingreso=graphene.Int(required=True))
    notas_egreso      = graphene.List(NotaEgresoType)
    nota_egreso       = graphene.Field(NotaEgresoType, id_egreso=graphene.Int(required=True))
    traspasos         = graphene.List(TraspasoType)
    traspaso          = graphene.Field(TraspasoType, id_traspaso=graphene.Int(required=True))

    def resolve_almacenes(root, info):
        return Almacen.objects.filter(estado='activo')

    def resolve_almacen(root, info, id_almacen):
        try:
            return Almacen.objects.get(pk=id_almacen)
        except Almacen.DoesNotExist:
            return None

    def resolve_marcas(root, info):
        return Marca.objects.filter(estado='activo')

    def resolve_marca(root, info, id_marca):
        try:
            return Marca.objects.get(pk=id_marca)
        except Marca.DoesNotExist:
            return None

    def resolve_categorias(root, info):
        return Categoria.objects.filter(estado='activo')

    def resolve_categoria(root, info, id_categoria):
        try:
            return Categoria.objects.get(pk=id_categoria)
        except Categoria.DoesNotExist:
            return None

    def resolve_unidades_medida(root, info):
        return UnidadMedida.objects.filter(estado='activo')

    def resolve_unidad_medida(root, info, id_unidad):
        try:
            return UnidadMedida.objects.get(pk=id_unidad)
        except UnidadMedida.DoesNotExist:
            return None

    def resolve_ges_precios(root, info):
        return GesPrecio.objects.all()

    def resolve_articulos(root, info):
        return Producto.objects.select_related(
            'id_marca', 'id_categoria', 'id_unidad'
        ).filter(estado='activo')

    def resolve_articulo(root, info, id_producto):
        try:
            return Producto.objects.get(pk=id_producto)
        except Producto.DoesNotExist:
            return None

    def resolve_productos(root, info):
        return Producto.objects.select_related(
            'id_marca', 'id_categoria', 'id_unidad'
        ).filter(estado='activo')

    def resolve_producto(root, info, id_producto):
        try:
            return Producto.objects.get(pk=id_producto)
        except Producto.DoesNotExist:
            return None

    def resolve_productos_almacen(root, info):
        return ProductoAlmacen.objects.select_related('id_producto', 'id_almacen').all()

    def resolve_notas_ingreso(root, info):
        return NotaIngreso.objects.select_related('id_usuario').prefetch_related('detalles').all()

    def resolve_nota_ingreso(root, info, id_ingreso):
        try:
            return NotaIngreso.objects.get(pk=id_ingreso)
        except NotaIngreso.DoesNotExist:
            return None

    def resolve_notas_egreso(root, info):
        return NotaEgreso.objects.select_related('id_usuario').prefetch_related('detalles').all()

    def resolve_nota_egreso(root, info, id_egreso):
        try:
            return NotaEgreso.objects.get(pk=id_egreso)
        except NotaEgreso.DoesNotExist:
            return None

    def resolve_traspasos(root, info):
        return Traspaso.objects.select_related(
            'id_usuario', 'almacen_origen', 'almacen_destino'
        ).prefetch_related('detalles').all()

    def resolve_traspaso(root, info, id_traspaso):
        try:
            return Traspaso.objects.get(pk=id_traspaso)
        except Traspaso.DoesNotExist:
            return None