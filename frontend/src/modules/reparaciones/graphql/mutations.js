import { gql } from '@apollo/client'

export const CREAR_TIPO_REPARACION = gql`
  mutation CrearTipoReparacion($nombre: String!, $descripcion: String) {
    crearTipoReparacion(nombre: $nombre, descripcion: $descripcion) {
      ok
      tipoReparacion { idTipoReparacion nombre }
    }
  }
`

export const CREAR_TIPO_DETALLE = gql`
  mutation CrearTipoDetalle($nombre: String!, $descripcion: String) {
    crearTipoDetalle(nombre: $nombre, descripcion: $descripcion) {
      ok
      tipoDetalle { idTipo nombre }
    }
  }
`

export const CREAR_EQUIPO = gql`
  mutation CrearEquipo(
    $nombre: String!
    $idCliente: Int!
    $modelo: String
    $descripcion: String
    $tipoEquipo: String
    $serieImei: String
  ) {
    crearEquipo(
      nombre: $nombre
      idCliente: $idCliente
      modelo: $modelo
      descripcion: $descripcion
      tipoEquipo: $tipoEquipo
      serieImei: $serieImei
    ) {
      ok
      mensaje
      equipo { idEquipo nombre modelo }
    }
  }
`

export const CREAR_NOTA_REPARACION = gql`
  mutation CrearNotaReparacion(
    $fallaReportada: String!
    $idEquipo: Int!
    $idCliente: Int!
    $idTipoReparacion: Int
    $idUsuario: Int
  ) {
    crearNotaReparacion(
      fallaReportada: $fallaReportada
      idEquipo: $idEquipo
      idCliente: $idCliente
      idTipoReparacion: $idTipoReparacion
      idUsuario: $idUsuario
    ) {
      ok
      mensaje
      notaReparacion { idNotaReparacion fecha estado }
    }
  }
`

export const ACTUALIZAR_ESTADO_REPARACION = gql`
  mutation ActualizarEstadoReparacion(
    $idNotaReparacion: Int!
    $estado: String!
    $fallaReal: String
    $fechaEntrega: Date
  ) {
    actualizarEstadoReparacion(
      idNotaReparacion: $idNotaReparacion
      estado: $estado
      fallaReal: $fallaReal
      fechaEntrega: $fechaEntrega
    ) {
      ok
      mensaje
      notaReparacion { idNotaReparacion estado }
    }
  }
`

export const CREAR_DIAGNOSTICO = gql`
  mutation CrearDiagnostico(
    $idNotaReparacion: Int!
    $descripcion: String!
    $causaRaiz: String
    $tiempoEstimadoHrs: String
  ) {
    crearDiagnostico(
      idNotaReparacion: $idNotaReparacion
      descripcion: $descripcion
      causaRaiz: $causaRaiz
      tiempoEstimadoHrs: $tiempoEstimadoHrs
    ) {
      ok
      mensaje
      diagnostico { idDiagnostico descripcion }
    }
  }
`

export const CREAR_COTIZACION = gql`
  mutation CrearCotizacion($idDiagnostico: Int!, $manoObra: String!) {
    crearCotizacion(idDiagnostico: $idDiagnostico, manoObra: $manoObra) {
      ok
      mensaje
      cotizacion { idCotizacion manoObra total estado }
    }
  }
`

export const AGREGAR_DETALLE_REPARACION = gql`
  mutation AgregarDetalleReparacion(
    $idCotizacion: Int!
    $idTipoDetalle: Int!
    $cantidad: String!
    $precioUnitario: String!
    $descripcion: String
    $idProducto: Int
    $observaciones: String
  ) {
    agregarDetalleReparacion(
      idCotizacion: $idCotizacion
      idTipoDetalle: $idTipoDetalle
      cantidad: $cantidad
      precioUnitario: $precioUnitario
      descripcion: $descripcion
      idProducto: $idProducto
      observaciones: $observaciones
    ) {
      ok
      mensaje
      detalleReparacion {
        idDetalleReparacion
        cantidad
        precioUnitario
        precioTotal
        idTipoDetalle { nombre }
      }
    }
  }
`

export const APROBAR_COTIZACION = gql`
  mutation AprobarCotizacion($idCotizacion: Int!) {
    aprobarCotizacion(idCotizacion: $idCotizacion) {
      ok
      mensaje
      cotizacion { idCotizacion estado }
    }
  }
`

export const ENTREGAR_EQUIPO = gql`
  mutation EntregarEquipo($idNotaReparacion: Int!, $fechaEntrega: Date!) {
    entregarEquipo(idNotaReparacion: $idNotaReparacion, fechaEntrega: $fechaEntrega) {
      ok
      mensaje
      notaReparacion { idNotaReparacion estado fechaEntrega }
    }
  }
`