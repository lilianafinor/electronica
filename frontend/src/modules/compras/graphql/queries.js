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

export const GET_CATALOGO_PROVEEDOR = gql`
  query {
    catalogoProveedor {
      idCatalogo
      precioUnitario
      stockDisponible
      estado
      idProveedor { idProveedor nombre }
      idProducto { idProducto nombre precio idMarca { nombre } idCategoria { nombre } idUnidad { nombre } }
    }
  }
`

export const GET_CATALOGO_POR_PROVEEDOR = gql`
  query CatalogoPorProveedor($idProveedor: Int!) {
    catalogoPorProveedor(idProveedor: $idProveedor) {
      idCatalogo
      precioUnitario
      stockDisponible
      estado
      idProducto { idProducto nombre precio idMarca { nombre } idCategoria { nombre } idUnidad { nombre } }
    }
  }
`

export const GET_PROVEEDORES_POR_ARTICULO = gql`
  query ProveedoresPorArticulo($idProducto: Int!) {
    proveedoresPorArticulo(idProducto: $idProducto) {
      idCatalogo
      precioUnitario
      stockDisponible
      estado
      idProveedor { idProveedor nombre telefono email }
      idProducto { idProducto nombre precio idMarca { nombre } idCategoria { nombre } }
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