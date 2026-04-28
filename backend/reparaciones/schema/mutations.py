import graphene
from decimal import Decimal
from .queries import (
    TipoReparacionType, TipoDetalleType, EquipoType,
    NotaReparacionType, DiagnosticoType,
    CotizacionReparacionType, DetalleReparacionType
)
from reparaciones.models import (
    TipoReparacion, TipoDetalle, Equipo,
    NotaReparacion, Diagnostico, CotizacionReparacion, DetalleReparacion
)
from ventas.models import Cliente
from usuarios.models import Usuario
from inventario.models import Producto


class CrearTipoReparacion(graphene.Mutation):
    class Arguments:
        nombre      = graphene.String(required=True)
        descripcion = graphene.String()

    tipo_reparacion = graphene.Field(TipoReparacionType)
    ok              = graphene.Boolean()

    def mutate(root, info, nombre, descripcion=None):
        tipo = TipoReparacion.objects.create(nombre=nombre, descripcion=descripcion)
        return CrearTipoReparacion(tipo_reparacion=tipo, ok=True)


class CrearTipoDetalle(graphene.Mutation):
    class Arguments:
        nombre      = graphene.String(required=True)
        descripcion = graphene.String()

    tipo_detalle = graphene.Field(TipoDetalleType)
    ok           = graphene.Boolean()

    def mutate(root, info, nombre, descripcion=None):
        tipo = TipoDetalle.objects.create(nombre=nombre, descripcion=descripcion)
        return CrearTipoDetalle(tipo_detalle=tipo, ok=True)


class EliminarTipoDetalle(graphene.Mutation):
    class Arguments:
        id_tipo = graphene.Int(required=True)

    ok      = graphene.Boolean()
    mensaje = graphene.String()

    def mutate(root, info, id_tipo):
        try:
            TipoDetalle.objects.get(pk=id_tipo).delete()
            return EliminarTipoDetalle(ok=True, mensaje='Tipo eliminado')
        except TipoDetalle.DoesNotExist:
            return EliminarTipoDetalle(ok=False, mensaje='No encontrado')


class CrearEquipo(graphene.Mutation):
    class Arguments:
        nombre      = graphene.String(required=True)
        idCliente   = graphene.Int(required=True)
        modelo      = graphene.String()
        descripcion = graphene.String()
        tipoEquipo  = graphene.String()
        serieImei   = graphene.String()

    equipo  = graphene.Field(EquipoType)
    ok      = graphene.Boolean()
    mensaje = graphene.String()

    def mutate(root, info, nombre, idCliente, modelo=None,
               descripcion=None, tipoEquipo=None, serieImei=None):
        try:
            equipo = Equipo.objects.create(
                nombre=nombre,
                modelo=modelo,
                descripcion=descripcion,
                tipo_equipo=tipoEquipo,
                serie_imei=serieImei,
                id_cliente=Cliente.objects.get(pk=idCliente)
            )
            return CrearEquipo(equipo=equipo, ok=True, mensaje='Equipo registrado')
        except Cliente.DoesNotExist:
            return CrearEquipo(equipo=None, ok=False, mensaje='Cliente no encontrado')


class CrearNotaReparacion(graphene.Mutation):
    class Arguments:
        falla_reportada    = graphene.String(required=True)
        id_equipo          = graphene.Int(required=True)
        id_cliente         = graphene.Int(required=True)
        id_tipo_reparacion = graphene.Int()
        id_usuario         = graphene.Int()

    nota_reparacion = graphene.Field(NotaReparacionType)
    ok              = graphene.Boolean()
    mensaje         = graphene.String()

    def mutate(root, info, falla_reportada, id_equipo, id_cliente,
               id_tipo_reparacion=None, id_usuario=None):
        try:
            nota = NotaReparacion.objects.create(
                falla_reportada=falla_reportada,
                id_equipo=Equipo.objects.get(pk=id_equipo),
                id_cliente=Cliente.objects.get(pk=id_cliente),
                id_tipo_reparacion=TipoReparacion.objects.get(pk=id_tipo_reparacion) if id_tipo_reparacion else None,
                id_usuario=Usuario.objects.get(pk=id_usuario) if id_usuario else None
            )
            return CrearNotaReparacion(nota_reparacion=nota, ok=True, mensaje='Orden de reparación creada')
        except (Equipo.DoesNotExist, Cliente.DoesNotExist):
            return CrearNotaReparacion(nota_reparacion=None, ok=False, mensaje='Equipo o cliente no encontrado')


class ActualizarEstadoReparacion(graphene.Mutation):
    class Arguments:
        id_nota_reparacion = graphene.Int(required=True)
        estado             = graphene.String(required=True)
        falla_real         = graphene.String()
        fecha_entrega      = graphene.Date()

    nota_reparacion = graphene.Field(NotaReparacionType)
    ok              = graphene.Boolean()
    mensaje         = graphene.String()

    def mutate(root, info, id_nota_reparacion, estado, falla_real=None, fecha_entrega=None):
        try:
            nota        = NotaReparacion.objects.get(pk=id_nota_reparacion)
            nota.estado = estado
            if falla_real:
                nota.falla_real = falla_real
            if fecha_entrega:
                nota.fecha_entrega = fecha_entrega
            nota.save()
            return ActualizarEstadoReparacion(nota_reparacion=nota, ok=True, mensaje='Estado actualizado')
        except NotaReparacion.DoesNotExist:
            return ActualizarEstadoReparacion(nota_reparacion=None, ok=False, mensaje='Reparación no encontrada')


class CrearDiagnostico(graphene.Mutation):
    class Arguments:
        id_nota_reparacion  = graphene.Int(required=True)
        descripcion         = graphene.String(required=True)
        causa_raiz          = graphene.String()
        tiempo_estimado_hrs = graphene.String()

    diagnostico = graphene.Field(DiagnosticoType)
    ok          = graphene.Boolean()
    mensaje     = graphene.String()

    def mutate(root, info, id_nota_reparacion, descripcion,
               causa_raiz=None, tiempo_estimado_hrs=None):
        try:
            nota = NotaReparacion.objects.get(pk=id_nota_reparacion)
            diag = Diagnostico.objects.create(
                descripcion=descripcion,
                causa_raiz=causa_raiz,
                tiempo_estimado_hrs=Decimal(tiempo_estimado_hrs) if tiempo_estimado_hrs else None,
                id_nota_reparacion=nota
            )
            nota.estado = 'diagnostico'
            nota.save()
            return CrearDiagnostico(diagnostico=diag, ok=True, mensaje='Diagnóstico registrado')
        except NotaReparacion.DoesNotExist:
            return CrearDiagnostico(diagnostico=None, ok=False, mensaje='Reparación no encontrada')


class CrearCotizacion(graphene.Mutation):
    class Arguments:
        id_diagnostico = graphene.Int(required=True)
        mano_obra      = graphene.String(required=True)

    cotizacion = graphene.Field(CotizacionReparacionType)
    ok         = graphene.Boolean()
    mensaje    = graphene.String()

    def mutate(root, info, id_diagnostico, mano_obra):
        try:
            diag = Diagnostico.objects.get(pk=id_diagnostico)
            cot  = CotizacionReparacion.objects.create(
                id_diagnostico=diag,
                mano_obra=Decimal(mano_obra),
                total=Decimal(mano_obra)
            )
            diag.id_nota_reparacion.estado = 'cotizado'
            diag.id_nota_reparacion.save()
            return CrearCotizacion(cotizacion=cot, ok=True, mensaje='Cotización creada')
        except Diagnostico.DoesNotExist:
            return CrearCotizacion(cotizacion=None, ok=False, mensaje='Diagnóstico no encontrado')


class AgregarDetalleReparacion(graphene.Mutation):
    class Arguments:
        id_cotizacion   = graphene.Int(required=True)
        id_tipo_detalle = graphene.Int(required=True)
        descripcion     = graphene.String()
        cantidad        = graphene.String(required=True)
        precio_unitario = graphene.String(required=True)
        id_producto     = graphene.Int()
        observaciones   = graphene.String()

    detalle_reparacion = graphene.Field(DetalleReparacionType)
    ok                 = graphene.Boolean()
    mensaje            = graphene.String()

    def mutate(root, info, id_cotizacion, id_tipo_detalle, cantidad,
               precio_unitario, descripcion=None, id_producto=None, observaciones=None):
        try:
            cantidad        = Decimal(cantidad)
            precio_unitario = Decimal(precio_unitario)
            precio_total    = cantidad * precio_unitario

            cotizacion = CotizacionReparacion.objects.get(pk=id_cotizacion)
            tipo       = TipoDetalle.objects.get(pk=id_tipo_detalle)
            producto   = Producto.objects.get(pk=id_producto) if id_producto else None

            detalle = DetalleReparacion.objects.create(
                id_cotizacion=cotizacion,
                id_tipo_detalle=tipo,
                id_producto=producto,
                descripcion=descripcion,
                observaciones=observaciones,
                cantidad=cantidad,
                precio_unitario=precio_unitario,
                precio_total=precio_total
            )

            todos_detalles            = cotizacion.detalles.all()
            costo_repuestos           = sum(d.precio_total for d in todos_detalles)
            cotizacion.costo_repuesto = costo_repuestos
            cotizacion.total          = cotizacion.mano_obra + costo_repuestos
            cotizacion.save()

            cotizacion.id_diagnostico.id_nota_reparacion.monto = cotizacion.total
            cotizacion.id_diagnostico.id_nota_reparacion.save()

            return AgregarDetalleReparacion(detalle_reparacion=detalle, ok=True, mensaje='Detalle agregado')
        except (CotizacionReparacion.DoesNotExist, TipoDetalle.DoesNotExist):
            return AgregarDetalleReparacion(ok=False, mensaje='Datos no encontrados')


class AprobarCotizacion(graphene.Mutation):
    class Arguments:
        id_cotizacion = graphene.Int(required=True)

    cotizacion = graphene.Field(CotizacionReparacionType)
    ok         = graphene.Boolean()
    mensaje    = graphene.String()

    def mutate(root, info, id_cotizacion):
        try:
            cot        = CotizacionReparacion.objects.get(pk=id_cotizacion)
            cot.estado = 'aprobada'
            cot.save()
            cot.id_diagnostico.id_nota_reparacion.estado = 'aprobado'
            cot.id_diagnostico.id_nota_reparacion.save()
            return AprobarCotizacion(cotizacion=cot, ok=True, mensaje='Cotización aprobada')
        except CotizacionReparacion.DoesNotExist:
            return AprobarCotizacion(cotizacion=None, ok=False, mensaje='Cotización no encontrada')


class EntregarEquipo(graphene.Mutation):
    class Arguments:
        id_nota_reparacion = graphene.Int(required=True)
        fecha_entrega      = graphene.Date(required=True)

    nota_reparacion = graphene.Field(NotaReparacionType)
    ok              = graphene.Boolean()
    mensaje         = graphene.String()

    def mutate(root, info, id_nota_reparacion, fecha_entrega):
        try:
            nota               = NotaReparacion.objects.get(pk=id_nota_reparacion)
            nota.estado        = 'entregado'
            nota.fecha_entrega = fecha_entrega
            nota.save()
            return EntregarEquipo(nota_reparacion=nota, ok=True, mensaje='Equipo entregado')
        except NotaReparacion.DoesNotExist:
            return EntregarEquipo(nota_reparacion=None, ok=False, mensaje='Reparación no encontrada')


class Mutation(graphene.ObjectType):
    crear_tipo_reparacion        = CrearTipoReparacion.Field()
    crear_tipo_detalle           = CrearTipoDetalle.Field()
    eliminar_tipo_detalle        = EliminarTipoDetalle.Field()
    crear_equipo                 = CrearEquipo.Field()
    crear_nota_reparacion        = CrearNotaReparacion.Field()
    actualizar_estado_reparacion = ActualizarEstadoReparacion.Field()
    crear_diagnostico            = CrearDiagnostico.Field()
    crear_cotizacion             = CrearCotizacion.Field()
    agregar_detalle_reparacion   = AgregarDetalleReparacion.Field()
    aprobar_cotizacion           = AprobarCotizacion.Field()
    entregar_equipo              = EntregarEquipo.Field()