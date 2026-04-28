import { gql } from '@apollo/client'

export const GET_CLIENTES = gql`
  query {
    clientes {
      idCliente
      nombreCompleto
      nombre
      paterno
      materno
      telefono
      correo
      nit
      direccion
      estado
    }
  }
`

export const GET_NOTAS_VENTA = gql`
  query {
    notasVenta {
      idVenta
      fechaVenta
      montoTotal
      glosa
      estado
      tipoPago
      idCliente { idCliente nombreCompleto }
      idUsuario { username }
      detalles {
        idDetalleVenta
        cantidad
        precioUni
        precioSubtotal
        idProducto { nombre precio }
        idAlmacen { nombre }
      }
    }
  }
`