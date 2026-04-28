import { gql } from '@apollo/client'

export const GET_TIPOS_REPARACION = gql`
  query {
    tiposReparacion {
      idTipoReparacion
      nombre
      descripcion
      estado
    }
  }
`

export const GET_TIPOS_DETALLE = gql`
  query {
    tiposDetalle {
      idTipo
      nombre
      descripcion
    }
  }
`

export const GET_EQUIPOS = gql`
  query {
    equipos {
      idEquipo
      nombre
      modelo
      descripcion
      tipoEquipo
      serieImei
      fechaIngreso
      estado
      idCliente { idCliente nombreCompleto }
    }
  }
`

export const GET_NOTAS_REPARACION = gql`
  query {
    notasReparacion {
      idNotaReparacion
      fecha
      fallaReportada
      fallaReal
      fechaEntrega
      monto
      tipoPago
      estado
      idEquipo { idEquipo nombre modelo }
      idCliente { idCliente nombreCompleto }
      idUsuario { username }
      idTipoReparacion { nombre }
    }
  }
`

export const GET_DIAGNOSTICOS = gql`
  query {
    diagnosticos {
      idDiagnostico
      descripcion
      causaRaiz
      tiempoEstimadoHrs
      fechaDiagnostico
      idNotaReparacion {
        idNotaReparacion
        estado
        idEquipo { nombre modelo }
        idCliente { nombreCompleto }
      }
    }
  }
`

export const GET_COTIZACIONES = gql`
  query {
    cotizaciones {
      idCotizacion
      costoRepuesto
      manoObra
      total
      estado
      idDiagnostico {
        idDiagnostico
        idNotaReparacion {
          idNotaReparacion
          idEquipo { nombre modelo }
          idCliente { nombreCompleto }
        }
      }
      detalles {
        idDetalleReparacion
        descripcion
        cantidad
        precioUnitario
        precioTotal
        idTipoDetalle { nombre }
        idProducto { nombre }
      }
    }
  }
`