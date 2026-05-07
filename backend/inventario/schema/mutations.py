import graphene
from decimal import Decimal
from .queries import (
    AlmacenType, MarcaType, CategoriaType, UnidadMedidaType,
    GesPrecioType, ProductoType, ProductoAlmacenType,
    NotaIngresoType, DetalleIngresoType,
    NotaEgresoType, DetalleEgresoType,
    TraspasoType
)
from inventario.models import (
    Almacen, Marca, Categoria, UnidadMedida, GesPrecio,
    Producto, ProductoAlmacen, NotaIngreso, DetalleIngreso,
    NotaEgreso, DetalleEgreso, Traspaso, DetalleTraspaso
)
from usuarios.models import Usuario


class CrearAlmacen(graphene.Mutation):
    class Arguments:
        nombre       = graphene.String(required=True)
        descripcion  = graphene.String()
        direccion    = graphene.String()
        cantidad_max = graphene.Int()

    almacen = graphene.Field(AlmacenType)
    ok      = graphene.Boolean()

    def mutate(root, info, nombre, descripcion=None, direccion=None, cantidad_max=None):
        almacen = Almacen.objects.create(
            nombre=nombre, descripcion=descripcion,
            direccion=direccion, cantidad_max=cantidad_max
        )
        return CrearAlmacen(almacen=almacen, ok=True)


class ActualizarAlmacen(graphene.Mutation):
    class Arguments:
        id_almacen   = graphene.Int(required=True)
        nombre       = graphene.String()
        descripcion  = graphene.String()
        direccion    = graphene.String()
        cantidad_max = graphene.Int()
        estado       = graphene.String()

    almacen = graphene.Field(AlmacenType)
    ok      = graphene.Boolean()

    def mutate(root, info, id_almacen, **kwargs):
        try:
            almacen = Almacen.objects.get(pk=id_almacen)
            for key, value in kwargs.items():
                setattr(almacen, key, value)
            almacen.save()
            return ActualizarAlmacen(almacen=almacen, ok=True)
        except Almacen.DoesNotExist:
            return ActualizarAlmacen(almacen=None, ok=False)


class CrearMarca(graphene.Mutation):
    class Arguments:
        nombre      = graphene.String(required=True)
        descripcion = graphene.String()

    marca = graphene.Field(MarcaType)
    ok    = graphene.Boolean()

    def mutate(root, info, nombre, descripcion=None):
        marca = Marca.objects.create(nombre=nombre, descripcion=descripcion)
        return CrearMarca(marca=marca, ok=True)


class ActualizarMarca(graphene.Mutation):
    class Arguments:
        id_marca    = graphene.Int(required=True)
        nombre      = graphene.String()
        descripcion = graphene.String()
        estado      = graphene.String()

    marca = graphene.Field(MarcaType)
    ok    = graphene.Boolean()

    def mutate(root, info, id_marca, **kwargs):
        try:
            marca = Marca.objects.get(pk=id_marca)
            for key, value in kwargs.items():
                setattr(marca, key, value)
            marca.save()
            return ActualizarMarca(marca=marca, ok=True)
        except Marca.DoesNotExist:
            return ActualizarMarca(marca=None, ok=False)


class CrearCategoria(graphene.Mutation):
    class Arguments:
        nombre      = graphene.String(required=True)
        descripcion = graphene.String()

    categoria = graphene.Field(CategoriaType)
    ok        = graphene.Boolean()

    def mutate(root, info, nombre, descripcion=None):
        categoria = Categoria.objects.create(nombre=nombre, descripcion=descripcion)
        return CrearCategoria(categoria=categoria, ok=True)


class ActualizarCategoria(graphene.Mutation):
    class Arguments:
        id_categoria = graphene.Int(required=True)
        nombre       = graphene.String()
        descripcion  = graphene.String()
        estado       = graphene.String()

    categoria = graphene.Field(CategoriaType)
    ok        = graphene.Boolean()

    def mutate(root, info, id_categoria, **kwargs):
        try:
            categoria = Categoria.objects.get(pk=id_categoria)
            for key, value in kwargs.items():
                setattr(categoria, key, value)
            categoria.save()
            return ActualizarCategoria(categoria=categoria, ok=True)
        except Categoria.DoesNotExist:
            return ActualizarCategoria(categoria=None, ok=False)


class CrearUnidadMedida(graphene.Mutation):
    class Arguments:
        nombre      = graphene.String(required=True)
        abreviatura = graphene.String()

    unidad_medida = graphene.Field(UnidadMedidaType)
    ok            = graphene.Boolean()

    def mutate(root, info, nombre, abreviatura=None):
        unidad = UnidadMedida.objects.create(nombre=nombre, abreviatura=abreviatura)
        return CrearUnidadMedida(unidad_medida=unidad, ok=True)


class CrearGesPrecio(graphene.Mutation):
    class Arguments:
        precio_compra     = graphene.String(required=True)
        precio_venta      = graphene.String(required=True)
        fecha             = graphene.Date(required=True)
        metodo_inventario = graphene.String()

    ges_precio = graphene.Field(GesPrecioType)
    ok         = graphene.Boolean()

    def mutate(root, info, precio_compra, precio_venta, fecha, metodo_inventario='PROMEDIO'):
        ges = GesPrecio.objects.create(
            precio_compra=Decimal(precio_compra),
            precio_venta=Decimal(precio_venta),
            fecha=fecha,
            metodo_inventario=metodo_inventario
        )
        return CrearGesPrecio(ges_precio=ges, ok=True)


class CrearProducto(graphene.Mutation):
    class Arguments:
        nombre       = graphene.String(required=True)
        descripcion  = graphene.String()
        precio       = graphene.String()
        id_marca     = graphene.Int()
        id_categoria = graphene.Int()
        id_unidad    = graphene.Int()

    producto = graphene.Field(ProductoType)
    ok       = graphene.Boolean()

    def mutate(root, info, nombre, descripcion=None, precio='0',
               id_marca=None, id_categoria=None, id_unidad=None):
        producto = Producto.objects.create(
            nombre=nombre,
            descripcion=descripcion,
            precio=Decimal(precio),
            id_marca=Marca.objects.get(pk=id_marca) if id_marca else None,
            id_categoria=Categoria.objects.get(pk=id_categoria) if id_categoria else None,
            id_unidad=UnidadMedida.objects.get(pk=id_unidad) if id_unidad else None,
        )
        return CrearProducto(producto=producto, ok=True)


class ActualizarProducto(graphene.Mutation):
    class Arguments:
        id_producto  = graphene.Int(required=True)
        nombre       = graphene.String()
        descripcion  = graphene.String()
        precio       = graphene.String()
        estado       = graphene.String()
        id_marca     = graphene.Int()
        id_categoria = graphene.Int()
        id_unidad    = graphene.Int()

    producto = graphene.Field(ProductoType)
    ok       = graphene.Boolean()

    def mutate(root, info, id_producto, precio=None,
               id_marca=None, id_categoria=None, id_unidad=None, **kwargs):
        try:
            producto = Producto.objects.get(pk=id_producto)
            for key, value in kwargs.items():
                setattr(producto, key, value)
            if precio is not None:
                producto.precio = Decimal(precio)
            if id_marca:
                producto.id_marca = Marca.objects.get(pk=id_marca)
            if id_categoria:
                producto.id_categoria = Categoria.objects.get(pk=id_categoria)
            if id_unidad:
                producto.id_unidad = UnidadMedida.objects.get(pk=id_unidad)
            producto.save()
            return ActualizarProducto(producto=producto, ok=True)
        except Producto.DoesNotExist:
            return ActualizarProducto(producto=None, ok=False)


class CrearNotaIngreso(graphene.Mutation):
    class Arguments:
        fecha      = graphene.Date(required=True)
        glosa      = graphene.String()
        motivo     = graphene.String()
        id_usuario = graphene.Int()

    nota_ingreso = graphene.Field(NotaIngresoType)
    ok           = graphene.Boolean()

    def mutate(root, info, fecha, glosa=None, motivo=None, id_usuario=None):
        nota = NotaIngreso.objects.create(
            fecha=fecha, glosa=glosa, motivo=motivo,
            id_usuario=Usuario.objects.get(pk=id_usuario) if id_usuario else None
        )
        return CrearNotaIngreso(nota_ingreso=nota, ok=True)


class AgregarDetalleIngreso(graphene.Mutation):
    class Arguments:
        id_ingreso  = graphene.Int(required=True)
        id_producto = graphene.Int(required=True)
        id_almacen  = graphene.Int(required=True)
        cantidad    = graphene.String(required=True)
        observacion = graphene.String()

    detalle_ingreso = graphene.Field(DetalleIngresoType)
    ok              = graphene.Boolean()

    def mutate(root, info, id_ingreso, id_producto, id_almacen, cantidad, observacion=None):
        cantidad = Decimal(cantidad)
        detalle = DetalleIngreso.objects.create(
            id_ingreso=NotaIngreso.objects.get(pk=id_ingreso),
            id_producto=Producto.objects.get(pk=id_producto),
            id_almacen=Almacen.objects.get(pk=id_almacen),
            cantidad=cantidad,
            observacion=observacion
        )
        prod_almacen, _ = ProductoAlmacen.objects.get_or_create(
            id_producto=detalle.id_producto,
            id_almacen=detalle.id_almacen
        )
        prod_almacen.stock = prod_almacen.stock + cantidad
        prod_almacen.save()
        return AgregarDetalleIngreso(detalle_ingreso=detalle, ok=True)


class CrearNotaEgreso(graphene.Mutation):
    class Arguments:
        fecha      = graphene.Date(required=True)
        glosa      = graphene.String()
        motivo     = graphene.String()
        id_usuario = graphene.Int()

    nota_egreso = graphene.Field(NotaEgresoType)
    ok          = graphene.Boolean()

    def mutate(root, info, fecha, glosa=None, motivo=None, id_usuario=None):
        nota = NotaEgreso.objects.create(
            fecha=fecha, glosa=glosa, motivo=motivo,
            id_usuario=Usuario.objects.get(pk=id_usuario) if id_usuario else None
        )
        return CrearNotaEgreso(nota_egreso=nota, ok=True)


class AgregarDetalleEgreso(graphene.Mutation):
    class Arguments:
        id_egreso   = graphene.Int(required=True)
        id_producto = graphene.Int(required=True)
        id_almacen  = graphene.Int(required=True)
        cantidad    = graphene.String(required=True)
        observacion = graphene.String()

    detalle_egreso = graphene.Field(DetalleEgresoType)
    ok             = graphene.Boolean()
    mensaje        = graphene.String()

    def mutate(root, info, id_egreso, id_producto, id_almacen, cantidad, observacion=None):
        try:
            cantidad = Decimal(cantidad)
            prod_almacen = ProductoAlmacen.objects.get(
                id_producto=id_producto,
                id_almacen=id_almacen
            )
            if prod_almacen.stock < cantidad:
                return AgregarDetalleEgreso(ok=False, mensaje='Stock insuficiente')
            detalle = DetalleEgreso.objects.create(
                id_egreso=NotaEgreso.objects.get(pk=id_egreso),
                id_producto=Producto.objects.get(pk=id_producto),
                id_almacen=Almacen.objects.get(pk=id_almacen),
                cantidad=cantidad,
                observacion=observacion
            )
            prod_almacen.stock = prod_almacen.stock - cantidad
            prod_almacen.save()
            return AgregarDetalleEgreso(detalle_egreso=detalle, ok=True, mensaje='Egreso registrado')
        except ProductoAlmacen.DoesNotExist:
            return AgregarDetalleEgreso(ok=False, mensaje='Artículo no existe en ese almacén')


class CrearTraspaso(graphene.Mutation):
    class Arguments:
        fecha           = graphene.Date(required=True)
        tipo            = graphene.String()
        glosa           = graphene.String()
        id_usuario      = graphene.Int()
        almacen_origen  = graphene.Int(required=True)
        almacen_destino = graphene.Int(required=True)

    traspaso = graphene.Field(TraspasoType)
    ok       = graphene.Boolean()
    mensaje  = graphene.String()

    def mutate(root, info, fecha, almacen_origen, almacen_destino,
               tipo=None, glosa=None, id_usuario=None):
        try:
            traspaso = Traspaso.objects.create(
                fecha=fecha, tipo=tipo, glosa=glosa,
                id_usuario=Usuario.objects.get(pk=id_usuario) if id_usuario else None,
                almacen_origen=Almacen.objects.get(pk=almacen_origen),
                almacen_destino=Almacen.objects.get(pk=almacen_destino)
            )
            return CrearTraspaso(traspaso=traspaso, ok=True, mensaje='Traspaso creado')
        except Almacen.DoesNotExist:
            return CrearTraspaso(traspaso=None, ok=False, mensaje='Almacén no encontrado')


class AgregarDetalleTraspaso(graphene.Mutation):
    class Arguments:
        id_traspaso = graphene.Int(required=True)
        id_producto = graphene.Int(required=True)
        cantidad    = graphene.String(required=True)

    ok      = graphene.Boolean()
    mensaje = graphene.String()

    def mutate(root, info, id_traspaso, id_producto, cantidad):
        try:
            cantidad = Decimal(cantidad)
            traspaso = Traspaso.objects.get(pk=id_traspaso)
            producto = Producto.objects.get(pk=id_producto)
            origen   = traspaso.almacen_origen
            destino  = traspaso.almacen_destino

            prod_origen = ProductoAlmacen.objects.get(
                id_producto=producto,
                id_almacen=origen
            )
            if prod_origen.stock < cantidad:
                return AgregarDetalleTraspaso(ok=False, mensaje='Stock insuficiente en almacén origen')

            DetalleTraspaso.objects.create(
                id_traspaso=traspaso,
                id_producto=producto,
                id_almacen=origen,
                cantidad=cantidad
            )
            prod_origen.stock = prod_origen.stock - cantidad
            prod_origen.save()

            prod_destino, _ = ProductoAlmacen.objects.get_or_create(
                id_producto=producto,
                id_almacen=destino
            )
            prod_destino.stock = prod_destino.stock + cantidad
            prod_destino.save()

            return AgregarDetalleTraspaso(ok=True, mensaje='Traspaso registrado correctamente')
        except Traspaso.DoesNotExist:
            return AgregarDetalleTraspaso(ok=False, mensaje='Traspaso no encontrado')
        except Producto.DoesNotExist:
            return AgregarDetalleTraspaso(ok=False, mensaje='Artículo no encontrado')
        except ProductoAlmacen.DoesNotExist:
            return AgregarDetalleTraspaso(ok=False, mensaje='Artículo no existe en almacén origen')


# ── Límites de stock ──────────────────────────────────
class ActualizarLimitesStock(graphene.Mutation):
    class Arguments:
        id_producto = graphene.Int(required=True)
        id_almacen  = graphene.Int(required=True)
        stock_min   = graphene.String()
        stock_max   = graphene.String()

    ok      = graphene.Boolean()
    mensaje = graphene.String()

    def mutate(root, info, id_producto, id_almacen, stock_min=None, stock_max=None):
        try:
            pa = ProductoAlmacen.objects.get(
                id_producto=id_producto,
                id_almacen=id_almacen
            )
            if stock_min is not None:
                pa.stock_min = Decimal(stock_min)
            if stock_max is not None:
                pa.stock_max = Decimal(stock_max)
            pa.save()
            return ActualizarLimitesStock(ok=True, mensaje='Límites actualizados')
        except ProductoAlmacen.DoesNotExist:
            return ActualizarLimitesStock(ok=False, mensaje='Registro no encontrado')


class Mutation(graphene.ObjectType):
    crear_almacen              = CrearAlmacen.Field()
    actualizar_almacen         = ActualizarAlmacen.Field()
    crear_marca                = CrearMarca.Field()
    actualizar_marca           = ActualizarMarca.Field()
    crear_categoria            = CrearCategoria.Field()
    actualizar_categoria       = ActualizarCategoria.Field()
    crear_unidad_medida        = CrearUnidadMedida.Field()
    crear_ges_precio           = CrearGesPrecio.Field()
    crear_producto             = CrearProducto.Field()
    actualizar_producto        = ActualizarProducto.Field()
    crear_nota_ingreso         = CrearNotaIngreso.Field()
    agregar_detalle_ingreso    = AgregarDetalleIngreso.Field()
    crear_nota_egreso          = CrearNotaEgreso.Field()
    agregar_detalle_egreso     = AgregarDetalleEgreso.Field()
    crear_traspaso             = CrearTraspaso.Field()
    agregar_detalle_traspaso   = AgregarDetalleTraspaso.Field()
    actualizar_limites_stock   = ActualizarLimitesStock.Field()