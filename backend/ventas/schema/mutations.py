import graphene
from decimal import Decimal
from datetime import date
from .queries import ClienteType, NotaVentaType, DetalleVentaType
from ventas.models import Cliente, NotaVenta, DetalleVenta
from usuarios.models import Usuario
from inventario.models import (
    Producto, Almacen, ProductoAlmacen,
    NotaEgreso, DetalleEgreso,
    NotaIngreso, DetalleIngreso,
)
from ventas.libelula import registrar_deuda_venta


class CrearCliente(graphene.Mutation):
    class Arguments:
        nombre    = graphene.String(required=True)
        paterno   = graphene.String()
        materno   = graphene.String()
        telefono  = graphene.String()
        correo    = graphene.String()
        nit       = graphene.String()
        direccion = graphene.String()

    cliente = graphene.Field(ClienteType)
    ok      = graphene.Boolean()

    def mutate(root, info, nombre, paterno=None, materno=None,
               telefono=None, correo=None, nit=None, direccion=None):
        cliente = Cliente.objects.create(
            nombre=nombre, paterno=paterno, materno=materno,
            telefono=telefono, correo=correo, nit=nit, direccion=direccion
        )
        return CrearCliente(cliente=cliente, ok=True)


class ActualizarCliente(graphene.Mutation):
    class Arguments:
        id_cliente = graphene.Int(required=True)
        nombre     = graphene.String()
        paterno    = graphene.String()
        materno    = graphene.String()
        telefono   = graphene.String()
        correo     = graphene.String()
        nit        = graphene.String()
        direccion  = graphene.String()
        estado     = graphene.String()

    cliente = graphene.Field(ClienteType)
    ok      = graphene.Boolean()

    def mutate(root, info, id_cliente, **kwargs):
        try:
            cliente = Cliente.objects.get(pk=id_cliente)
            for key, value in kwargs.items():
                setattr(cliente, key, value)
            cliente.save()
            return ActualizarCliente(cliente=cliente, ok=True)
        except Cliente.DoesNotExist:
            return ActualizarCliente(cliente=None, ok=False)


class CrearNotaVenta(graphene.Mutation):
    class Arguments:
        fecha_venta = graphene.Date(required=True)
        id_cliente  = graphene.Int(required=True)
        glosa       = graphene.String()
        tipo_pago   = graphene.String()
        id_usuario  = graphene.Int()

    nota_venta = graphene.Field(NotaVentaType)
    ok         = graphene.Boolean()
    mensaje    = graphene.String()

    def mutate(root, info, fecha_venta, id_cliente,
               glosa=None, tipo_pago='contado', id_usuario=None):
        try:
            venta = NotaVenta.objects.create(
                fecha_venta=fecha_venta,
                glosa=glosa,
                tipo_pago=tipo_pago,
                id_cliente=Cliente.objects.get(pk=id_cliente),
                id_usuario=Usuario.objects.get(pk=id_usuario) if id_usuario else None
            )
            return CrearNotaVenta(nota_venta=venta, ok=True, mensaje='Venta creada')
        except Cliente.DoesNotExist:
            return CrearNotaVenta(nota_venta=None, ok=False, mensaje='Cliente no encontrado')


class AgregarDetalleVenta(graphene.Mutation):
    class Arguments:
        id_venta    = graphene.Int(required=True)
        id_producto = graphene.Int(required=True)
        id_almacen  = graphene.Int(required=True)
        cantidad    = graphene.String(required=True)
        precio_uni  = graphene.String(required=True)

    detalle_venta = graphene.Field(DetalleVentaType)
    ok            = graphene.Boolean()
    mensaje       = graphene.String()

    def mutate(root, info, id_venta, id_producto, id_almacen, cantidad, precio_uni):
        try:
            cantidad   = Decimal(cantidad)
            precio_uni = Decimal(precio_uni)
            subtotal   = cantidad * precio_uni

            prod_almacen = ProductoAlmacen.objects.get(
                id_producto=id_producto,
                id_almacen=id_almacen
            )
            if prod_almacen.stock < cantidad:
                return AgregarDetalleVenta(ok=False, mensaje='Stock insuficiente')

            venta    = NotaVenta.objects.get(pk=id_venta)
            producto = Producto.objects.get(pk=id_producto)
            almacen  = Almacen.objects.get(pk=id_almacen)

            detalle = DetalleVenta.objects.create(
                id_venta=venta,
                id_producto=producto,
                id_almacen=almacen,
                cantidad=cantidad,
                precio_uni=precio_uni,
                precio_subtotal=subtotal
            )

            # Descontar stock
            prod_almacen.stock = prod_almacen.stock - cantidad
            prod_almacen.save()

            # Actualizar monto total
            venta.monto_total = sum(d.precio_subtotal for d in venta.detalles.all())
            venta.save()

            # Egreso automático por venta
            nota_egreso = NotaEgreso.objects.create(
                fecha=date.today(),
                glosa='Egreso por venta #' + str(id_venta),
                motivo='venta',
                id_usuario=venta.id_usuario,
            )
            DetalleEgreso.objects.create(
                id_egreso=nota_egreso,
                id_producto=producto,
                id_almacen=almacen,
                cantidad=cantidad,
                observacion='Venta #' + str(id_venta),
            )

            return AgregarDetalleVenta(
                detalle_venta=detalle, ok=True,
                mensaje='Producto agregado y stock actualizado'
            )
        except ProductoAlmacen.DoesNotExist:
            return AgregarDetalleVenta(ok=False, mensaje='Producto no existe en ese almacén')
        except (NotaVenta.DoesNotExist, Producto.DoesNotExist, Almacen.DoesNotExist):
            return AgregarDetalleVenta(ok=False, mensaje='Datos no encontrados')


class EliminarDetalleVenta(graphene.Mutation):
    class Arguments:
        id_detalle_venta = graphene.Int(required=True)

    ok      = graphene.Boolean()
    mensaje = graphene.String()

    def mutate(root, info, id_detalle_venta):
        try:
            detalle = DetalleVenta.objects.get(pk=id_detalle_venta)
            venta   = detalle.id_venta

            # Restaurar stock
            prod_almacen = ProductoAlmacen.objects.get(
                id_producto=detalle.id_producto,
                id_almacen=detalle.id_almacen
            )
            prod_almacen.stock = prod_almacen.stock + detalle.cantidad
            prod_almacen.save()

            detalle.delete()

            # Recalcular monto total
            venta.monto_total = sum(d.precio_subtotal for d in venta.detalles.all())
            venta.save()

            return EliminarDetalleVenta(ok=True, mensaje='Artículo eliminado y stock restaurado')
        except DetalleVenta.DoesNotExist:
            return EliminarDetalleVenta(ok=False, mensaje='Detalle no encontrado')
        except ProductoAlmacen.DoesNotExist:
            return EliminarDetalleVenta(ok=False, mensaje='Stock no encontrado')


class CancelarVenta(graphene.Mutation):
    class Arguments:
        id_venta = graphene.Int(required=True)

    ok      = graphene.Boolean()
    mensaje = graphene.String()

    def mutate(root, info, id_venta):
        try:
            venta        = NotaVenta.objects.get(pk=id_venta)
            venta.estado = 'cancelado'
            venta.save()

            # Crear una sola nota de ingreso por devolución para toda la venta
            nota_ingreso = NotaIngreso.objects.create(
                fecha=date.today(),
                glosa='Devolución por cancelación de venta #' + str(id_venta),
                motivo='devolucion',
                id_usuario=venta.id_usuario,
            )

            for detalle in venta.detalles.all():
                # Restaurar stock
                prod_almacen = ProductoAlmacen.objects.get(
                    id_producto=detalle.id_producto,
                    id_almacen=detalle.id_almacen
                )
                prod_almacen.stock = prod_almacen.stock + detalle.cantidad
                prod_almacen.save()

                # Agregar detalle al ingreso por devolución
                DetalleIngreso.objects.create(
                    id_ingreso=nota_ingreso,
                    id_producto=detalle.id_producto,
                    id_almacen=detalle.id_almacen,
                    cantidad=detalle.cantidad,
                    observacion='Devolución — Venta #' + str(id_venta),
                )

            return CancelarVenta(ok=True, mensaje='Venta cancelada y stock restaurado')
        except NotaVenta.DoesNotExist:
            return CancelarVenta(ok=False, mensaje='Venta no encontrada')


class GenerarQrVenta(graphene.Mutation):
    class Arguments:
        id_venta = graphene.Int(required=True)

    ok             = graphene.Boolean()
    mensaje        = graphene.String()
    url_pasarela   = graphene.String()
    qr_url         = graphene.String()
    id_transaccion = graphene.String()

    def mutate(root, info, id_venta):
        try:
            venta = NotaVenta.objects.prefetch_related(
                'detalles__id_producto'
            ).select_related('id_cliente').get(pk=id_venta)

            if venta.estado == 'cancelado':
                return GenerarQrVenta(
                    ok=False,
                    mensaje='No se puede generar QR para una venta cancelada'
                )

            if venta.monto_total <= 0:
                return GenerarQrVenta(
                    ok=False,
                    mensaje='La venta no tiene artículos. Agrega artículos antes de generar el QR.'
                )

            resultado = registrar_deuda_venta(venta)

            if resultado['ok']:
                if resultado['id_transaccion']:
                    venta.glosa = (venta.glosa or '') + f" | TXN:{resultado['id_transaccion']}"
                    venta.tipo_pago = 'qr'
                    venta.save()

                return GenerarQrVenta(
                    ok=True,
                    mensaje=resultado['mensaje'],
                    url_pasarela=resultado['url_pasarela'],
                    qr_url=resultado['qr_url'],
                    id_transaccion=resultado['id_transaccion'],
                )
            else:
                return GenerarQrVenta(ok=False, mensaje=resultado['mensaje'])

        except NotaVenta.DoesNotExist:
            return GenerarQrVenta(ok=False, mensaje='Venta no encontrada')


class Mutation(graphene.ObjectType):
    crear_cliente          = CrearCliente.Field()
    actualizar_cliente     = ActualizarCliente.Field()
    crear_nota_venta       = CrearNotaVenta.Field()
    agregar_detalle_venta  = AgregarDetalleVenta.Field()
    eliminar_detalle_venta = EliminarDetalleVenta.Field()
    cancelar_venta         = CancelarVenta.Field()
    generar_qr_venta       = GenerarQrVenta.Field()