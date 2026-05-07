import graphene
from decimal import Decimal
from .queries import (
    ProveedorType, CatalogoProveedorType, OrdenCompraType, DetalleOrdenCompraType,
    NotaCompraType, DetalleCompraType, AdquisicionType, DetalleAdquisicionType
)
from compras.models import (
    Proveedor, CatalogoProveedor, OrdenCompra, DetalleOrdenCompra,
    NotaCompra, DetalleCompra, Adquisicion, DetalleAdquisicion
)
from usuarios.models import Usuario
from inventario.models import Producto, Almacen, ProductoAlmacen


# ── Proveedor ─────────────────────────────────────────
class CrearProveedor(graphene.Mutation):
    class Arguments:
        nombre    = graphene.String(required=True)
        telefono  = graphene.String()
        email     = graphene.String()
        direccion = graphene.String()
        nit       = graphene.String()
        contacto  = graphene.String()

    proveedor = graphene.Field(ProveedorType)
    ok        = graphene.Boolean()

    def mutate(root, info, nombre, telefono=None, email=None,
               direccion=None, nit=None, contacto=None):
        proveedor = Proveedor.objects.create(
            nombre=nombre, telefono=telefono, email=email,
            direccion=direccion, nit=nit, contacto=contacto
        )
        return CrearProveedor(proveedor=proveedor, ok=True)


class ActualizarProveedor(graphene.Mutation):
    class Arguments:
        id_proveedor = graphene.Int(required=True)
        nombre       = graphene.String()
        telefono     = graphene.String()
        email        = graphene.String()
        direccion    = graphene.String()
        nit          = graphene.String()
        contacto     = graphene.String()
        estado       = graphene.String()

    proveedor = graphene.Field(ProveedorType)
    ok        = graphene.Boolean()

    def mutate(root, info, id_proveedor, **kwargs):
        try:
            proveedor = Proveedor.objects.get(pk=id_proveedor)
            for key, value in kwargs.items():
                setattr(proveedor, key, value)
            proveedor.save()
            return ActualizarProveedor(proveedor=proveedor, ok=True)
        except Proveedor.DoesNotExist:
            return ActualizarProveedor(proveedor=None, ok=False)


# ── CatalogoProveedor ─────────────────────────────────
class AgregarArticuloCatalogo(graphene.Mutation):
    class Arguments:
        id_proveedor     = graphene.Int(required=True)
        id_producto      = graphene.Int(required=True)
        precio_unitario  = graphene.String(required=True)
        stock_disponible = graphene.String(required=True)

    catalogo = graphene.Field(CatalogoProveedorType)
    ok       = graphene.Boolean()
    mensaje  = graphene.String()

    def mutate(root, info, id_proveedor, id_producto, precio_unitario, stock_disponible):
        try:
            catalogo, creado = CatalogoProveedor.objects.get_or_create(
                id_proveedor=Proveedor.objects.get(pk=id_proveedor),
                id_producto=Producto.objects.get(pk=id_producto),
                defaults={
                    'precio_unitario':  Decimal(precio_unitario),
                    'stock_disponible': Decimal(stock_disponible),
                }
            )
            if not creado:
                catalogo.precio_unitario  = Decimal(precio_unitario)
                catalogo.stock_disponible = Decimal(stock_disponible)
                catalogo.save()
            return AgregarArticuloCatalogo(
                catalogo=catalogo, ok=True,
                mensaje='Artículo agregado al catálogo'
            )
        except (Proveedor.DoesNotExist, Producto.DoesNotExist):
            return AgregarArticuloCatalogo(ok=False, mensaje='Proveedor o artículo no encontrado')


class ActualizarCatalogo(graphene.Mutation):
    class Arguments:
        id_catalogo      = graphene.Int(required=True)
        precio_unitario  = graphene.String()
        stock_disponible = graphene.String()
        estado           = graphene.String()

    catalogo = graphene.Field(CatalogoProveedorType)
    ok       = graphene.Boolean()
    mensaje  = graphene.String()

    def mutate(root, info, id_catalogo, precio_unitario=None,
               stock_disponible=None, estado=None):
        try:
            catalogo = CatalogoProveedor.objects.get(pk=id_catalogo)
            if precio_unitario:
                catalogo.precio_unitario = Decimal(precio_unitario)
            if stock_disponible:
                catalogo.stock_disponible = Decimal(stock_disponible)
            if estado:
                catalogo.estado = estado
            catalogo.save()
            return ActualizarCatalogo(catalogo=catalogo, ok=True, mensaje='Catálogo actualizado')
        except CatalogoProveedor.DoesNotExist:
            return ActualizarCatalogo(catalogo=None, ok=False, mensaje='No encontrado')


class EliminarArticuloCatalogo(graphene.Mutation):
    class Arguments:
        id_catalogo = graphene.Int(required=True)

    ok      = graphene.Boolean()
    mensaje = graphene.String()

    def mutate(root, info, id_catalogo):
        try:
            CatalogoProveedor.objects.get(pk=id_catalogo).delete()
            return EliminarArticuloCatalogo(ok=True, mensaje='Artículo eliminado del catálogo')
        except CatalogoProveedor.DoesNotExist:
            return EliminarArticuloCatalogo(ok=False, mensaje='No encontrado')


# ── OrdenCompra ───────────────────────────────────────
class CrearOrdenCompra(graphene.Mutation):
    class Arguments:
        fecha        = graphene.Date(required=True)
        glosa        = graphene.String()
        id_proveedor = graphene.Int(required=True)
        id_usuario   = graphene.Int()

    orden_compra = graphene.Field(OrdenCompraType)
    ok           = graphene.Boolean()

    def mutate(root, info, fecha, id_proveedor, glosa=None, id_usuario=None):
        try:
            orden = OrdenCompra.objects.create(
                fecha=fecha,
                glosa=glosa,
                id_proveedor=Proveedor.objects.get(pk=id_proveedor),
                id_usuario=Usuario.objects.get(pk=id_usuario) if id_usuario else None
            )
            return CrearOrdenCompra(orden_compra=orden, ok=True)
        except Proveedor.DoesNotExist:
            return CrearOrdenCompra(orden_compra=None, ok=False)


class AgregarDetalleOrden(graphene.Mutation):
    class Arguments:
        id_orden    = graphene.Int(required=True)
        id_producto = graphene.Int(required=True)
        cantidad    = graphene.String(required=True)
        precio_uni  = graphene.String(required=True)

    detalle_orden = graphene.Field(DetalleOrdenCompraType)
    ok            = graphene.Boolean()

    def mutate(root, info, id_orden, id_producto, cantidad, precio_uni):
        try:
            cantidad   = Decimal(cantidad)
            precio_uni = Decimal(precio_uni)
            sub_total  = cantidad * precio_uni
            detalle = DetalleOrdenCompra.objects.create(
                id_orden=OrdenCompra.objects.get(pk=id_orden),
                id_producto=Producto.objects.get(pk=id_producto),
                cantidad=cantidad,
                precio_uni=precio_uni,
                sub_total=sub_total
            )
            orden = detalle.id_orden
            orden.total = sum(d.sub_total for d in orden.detalles.all())
            orden.save()
            return AgregarDetalleOrden(detalle_orden=detalle, ok=True)
        except (OrdenCompra.DoesNotExist, Producto.DoesNotExist):
            return AgregarDetalleOrden(detalle_orden=None, ok=False)


class EliminarDetalleOrden(graphene.Mutation):
    class Arguments:
        id_detalle_orden = graphene.Int(required=True)

    ok      = graphene.Boolean()
    mensaje = graphene.String()

    def mutate(root, info, id_detalle_orden):
        try:
            detalle = DetalleOrdenCompra.objects.get(pk=id_detalle_orden)
            orden   = detalle.id_orden
            detalle.delete()
            orden.total = sum(d.sub_total for d in orden.detalles.all())
            orden.save()
            return EliminarDetalleOrden(ok=True, mensaje='Artículo eliminado de la orden')
        except DetalleOrdenCompra.DoesNotExist:
            return EliminarDetalleOrden(ok=False, mensaje='Detalle no encontrado')


class ActualizarEstadoOrden(graphene.Mutation):
    class Arguments:
        id_orden = graphene.Int(required=True)
        estado   = graphene.String(required=True)

    orden_compra = graphene.Field(OrdenCompraType)
    ok           = graphene.Boolean()

    def mutate(root, info, id_orden, estado):
        try:
            orden        = OrdenCompra.objects.get(pk=id_orden)
            orden.estado = estado
            orden.save()
            return ActualizarEstadoOrden(orden_compra=orden, ok=True)
        except OrdenCompra.DoesNotExist:
            return ActualizarEstadoOrden(orden_compra=None, ok=False)


# ── NotaCompra ────────────────────────────────────────
class CrearNotaCompra(graphene.Mutation):
    class Arguments:
        fecha_compra = graphene.Date(required=True)
        id_proveedor = graphene.Int(required=True)
        nro_factura  = graphene.String()
        glosa        = graphene.String()
        tipo_pago    = graphene.String()
        id_usuario   = graphene.Int()

    nota_compra = graphene.Field(NotaCompraType)
    ok          = graphene.Boolean()

    def mutate(root, info, fecha_compra, id_proveedor,
               nro_factura=None, glosa=None, tipo_pago='contado', id_usuario=None):
        try:
            nota = NotaCompra.objects.create(
                fecha_compra=fecha_compra,
                nro_factura=nro_factura,
                glosa=glosa,
                tipo_pago=tipo_pago,
                id_proveedor=Proveedor.objects.get(pk=id_proveedor),
                id_usuario=Usuario.objects.get(pk=id_usuario) if id_usuario else None
            )
            return CrearNotaCompra(nota_compra=nota, ok=True)
        except Proveedor.DoesNotExist:
            return CrearNotaCompra(nota_compra=None, ok=False)


class AgregarDetalleNotaCompra(graphene.Mutation):
    class Arguments:
        id_compra   = graphene.Int(required=True)
        id_producto = graphene.Int(required=True)
        cantidad    = graphene.String(required=True)
        precio_uni  = graphene.String(required=True)

    detalle_compra = graphene.Field(DetalleCompraType)
    ok             = graphene.Boolean()

    def mutate(root, info, id_compra, id_producto, cantidad, precio_uni):
        try:
            cantidad   = Decimal(cantidad)
            precio_uni = Decimal(precio_uni)
            sub_total  = cantidad * precio_uni
            detalle = DetalleCompra.objects.create(
                id_compra=NotaCompra.objects.get(pk=id_compra),
                id_producto=Producto.objects.get(pk=id_producto),
                cantidad=cantidad,
                precio_uni=precio_uni,
                sub_total=sub_total
            )
            nota = detalle.id_compra
            nota.total_compra = sum(d.sub_total for d in nota.detalles.all())
            nota.save()
            return AgregarDetalleNotaCompra(detalle_compra=detalle, ok=True)
        except (NotaCompra.DoesNotExist, Producto.DoesNotExist):
            return AgregarDetalleNotaCompra(detalle_compra=None, ok=False)


# ── Adquisicion ───────────────────────────────────────
class CrearAdquisicion(graphene.Mutation):
    class Arguments:
        fecha        = graphene.Date(required=True)
        id_proveedor = graphene.Int(required=True)
        id_orden     = graphene.Int()
        glosa        = graphene.String()
        id_usuario   = graphene.Int()

    adquisicion = graphene.Field(AdquisicionType)
    ok          = graphene.Boolean()

    def mutate(root, info, fecha, id_proveedor,
               id_orden=None, glosa=None, id_usuario=None):
        try:
            adq = Adquisicion.objects.create(
                fecha=fecha,
                glosa=glosa,
                id_proveedor=Proveedor.objects.get(pk=id_proveedor),
                id_orden=OrdenCompra.objects.get(pk=id_orden) if id_orden else None,
                id_usuario=Usuario.objects.get(pk=id_usuario) if id_usuario else None
            )
            return CrearAdquisicion(adquisicion=adq, ok=True)
        except Proveedor.DoesNotExist:
            return CrearAdquisicion(adquisicion=None, ok=False)


class AgregarDetalleAdquisicion(graphene.Mutation):
    class Arguments:
        id_adquisicion = graphene.Int(required=True)
        id_producto    = graphene.Int(required=True)
        id_almacen     = graphene.Int(required=True)
        cantidad       = graphene.String(required=True)
        precio_uni     = graphene.String(required=True)

    detalle_adquisicion = graphene.Field(DetalleAdquisicionType)
    ok                  = graphene.Boolean()
    mensaje             = graphene.String()

    def mutate(root, info, id_adquisicion, id_producto, id_almacen, cantidad, precio_uni):
        try:
            cantidad   = Decimal(cantidad)
            precio_uni = Decimal(precio_uni)
            sub_total  = cantidad * precio_uni
            producto   = Producto.objects.get(pk=id_producto)
            almacen    = Almacen.objects.get(pk=id_almacen)

            detalle = DetalleAdquisicion.objects.create(
                id_adquisicion=Adquisicion.objects.get(pk=id_adquisicion),
                id_producto=producto,
                id_almacen=almacen,
                cantidad=cantidad,
                precio_uni=precio_uni,
                sub_total=sub_total
            )
            prod_almacen, _ = ProductoAlmacen.objects.get_or_create(
                id_producto=producto,
                id_almacen=almacen
            )
            prod_almacen.stock = prod_almacen.stock + cantidad
            prod_almacen.save()

            return AgregarDetalleAdquisicion(
                detalle_adquisicion=detalle, ok=True,
                mensaje='Artículo recibido y stock actualizado'
            )
        except (Adquisicion.DoesNotExist, Producto.DoesNotExist, Almacen.DoesNotExist):
            return AgregarDetalleAdquisicion(ok=False, mensaje='Datos no encontrados')


class Mutation(graphene.ObjectType):
    crear_proveedor              = CrearProveedor.Field()
    actualizar_proveedor         = ActualizarProveedor.Field()
    agregar_articulo_catalogo    = AgregarArticuloCatalogo.Field()
    actualizar_catalogo          = ActualizarCatalogo.Field()
    eliminar_articulo_catalogo   = EliminarArticuloCatalogo.Field()
    crear_orden_compra           = CrearOrdenCompra.Field()
    agregar_detalle_orden        = AgregarDetalleOrden.Field()
    eliminar_detalle_orden       = EliminarDetalleOrden.Field()
    actualizar_estado_orden      = ActualizarEstadoOrden.Field()
    crear_nota_compra            = CrearNotaCompra.Field()
    agregar_detalle_nota_compra  = AgregarDetalleNotaCompra.Field()
    crear_adquisicion            = CrearAdquisicion.Field()
    agregar_detalle_adquisicion  = AgregarDetalleAdquisicion.Field()