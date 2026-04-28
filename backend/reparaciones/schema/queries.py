import graphene
from graphene_django import DjangoObjectType
from reparaciones.models import (
    TipoReparacion, TipoDetalle, Equipo,
    NotaReparacion, Diagnostico, CotizacionReparacion, DetalleReparacion
)


class TipoReparacionType(DjangoObjectType):
    class Meta:
        model = TipoReparacion
        fields = ('id_tipo_reparacion', 'nombre', 'descripcion', 'estado')


class TipoDetalleType(DjangoObjectType):
    class Meta:
        model = TipoDetalle
        fields = ('id_tipo', 'nombre', 'descripcion')


class EquipoType(DjangoObjectType):
    class Meta:
        model = Equipo
        fields = ('id_equipo', 'nombre', 'modelo', 'descripcion',
                  'tipo_equipo', 'serie_imei', 'fecha_ingreso', 'estado', 'id_cliente')


class NotaReparacionType(DjangoObjectType):
    class Meta:
        model = NotaReparacion
        fields = ('id_nota_reparacion', 'fecha', 'falla_reportada', 'falla_real',
                  'fecha_entrega', 'monto', 'tipo_pago', 'estado',
                  'id_equipo', 'id_cliente', 'id_usuario', 'id_tipo_reparacion')


class DiagnosticoType(DjangoObjectType):
    class Meta:
        model = Diagnostico
        fields = ('id_diagnostico', 'descripcion', 'causa_raiz',
                  'tiempo_estimado_hrs', 'fecha_diagnostico', 'id_nota_reparacion')


class CotizacionReparacionType(DjangoObjectType):
    class Meta:
        model = CotizacionReparacion
        fields = ('id_cotizacion', 'costo_repuesto', 'mano_obra', 'total',
                  'estado', 'id_diagnostico', 'detalles')


class DetalleReparacionType(DjangoObjectType):
    class Meta:
        model = DetalleReparacion
        fields = ('id_detalle_reparacion', 'descripcion', 'observaciones',
                  'cantidad', 'precio_unitario', 'precio_total',
                  'id_cotizacion', 'id_tipo_detalle', 'id_producto')


class Query(graphene.ObjectType):
    tipos_reparacion    = graphene.List(TipoReparacionType)
    tipos_detalle       = graphene.List(TipoDetalleType)
    equipos             = graphene.List(EquipoType)
    equipo              = graphene.Field(EquipoType, id_equipo=graphene.Int(required=True))
    notas_reparacion    = graphene.List(NotaReparacionType)
    nota_reparacion     = graphene.Field(NotaReparacionType, id_nota_reparacion=graphene.Int(required=True))
    diagnosticos        = graphene.List(DiagnosticoType)
    cotizaciones        = graphene.List(CotizacionReparacionType)
    cotizacion          = graphene.Field(CotizacionReparacionType, id_cotizacion=graphene.Int(required=True))

    def resolve_tipos_reparacion(root, info):
        return TipoReparacion.objects.filter(estado='activo')

    def resolve_tipos_detalle(root, info):
        return TipoDetalle.objects.all()

    def resolve_equipos(root, info):
        return Equipo.objects.select_related('id_cliente').all()

    def resolve_equipo(root, info, id_equipo):
        try:
            return Equipo.objects.get(pk=id_equipo)
        except Equipo.DoesNotExist:
            return None

    def resolve_notas_reparacion(root, info):
        return NotaReparacion.objects.select_related(
            'id_equipo', 'id_cliente', 'id_usuario', 'id_tipo_reparacion'
        ).all()

    def resolve_nota_reparacion(root, info, id_nota_reparacion):
        try:
            return NotaReparacion.objects.get(pk=id_nota_reparacion)
        except NotaReparacion.DoesNotExist:
            return None

    def resolve_diagnosticos(root, info):
        return Diagnostico.objects.select_related('id_nota_reparacion').all()

    def resolve_cotizaciones(root, info):
        return CotizacionReparacion.objects.select_related('id_diagnostico').prefetch_related('detalles').all()

    def resolve_cotizacion(root, info, id_cotizacion):
        try:
            return CotizacionReparacion.objects.get(pk=id_cotizacion)
        except CotizacionReparacion.DoesNotExist:
            return None