import { gql } from '@apollo/client'

export const GET_PROVEEDORES = gql`
  query {
    proveedores {
      idProveedor
      nombre
      telefono
      email
      direccion
      nit
      contacto
      estado
    }
  }
`

export const GET_ORDENES_COMPRA = gql`
  query {
    ordenesCompra {
      idOrden
      fecha
      estado
      glosa
      total
      idProveedor { idProveedor nombre }
      idUsuario { username }
      detalles {
        idDetalleOrden
        cantidad
        precioUni
        subTotal
        idProducto { nombre }
      }
    }
  }
`

export const GET_NOTAS_COMPRA = gql`
  query {
    notasCompra {
      idCompra
      fechaCompra
      totalCompra
      nroFactura
      estado
      glosa
      tipoPago
      idProveedor { idProveedor nombre }
      idUsuario { username }
      detalles {
        idDetalleCompra
        cantidad
        precioUni
        subTotal
        idProducto { nombre }
      }
    }
  }
`

export const GET_ADQUISICIONES = gql`
  query {
    adquisiciones {
      idAdquisicion
      fecha
      estado
      glosa
      idProveedor { idProveedor nombre }
      idOrden { idOrden fecha }
      idUsuario { username }
      detalles {
        idDetalleAdq
        cantidad
        precioUni
        subTotal
        idProducto { nombre }
        idAlmacen { nombre }
      }
    }
  }
`