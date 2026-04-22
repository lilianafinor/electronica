import { gql } from '@apollo/client'

export const GET_PRODUCTOS = gql`
  query {
    productos {
      idProducto
      nombre
      descripcion
      precio
      estado
      idMarca { idMarca nombre }
      idCategoria { idCategoria nombre }
      idUnidad { idUnidad nombre abreviatura }
    }
  }
`

export const GET_MARCAS = gql`
  query {
    marcas { idMarca nombre estado }
  }
`

export const GET_CATEGORIAS = gql`
  query {
    categorias { idCategoria nombre estado }
  }
`

export const GET_UNIDADES = gql`
  query {
    unidadesMedida { idUnidad nombre abreviatura estado }
  }
`

export const GET_ALMACENES = gql`
  query {
    almacenes {
      idAlmacen
      nombre
      descripcion
      direccion
      cantidadMax
      estado
    }
  }
`

export const GET_PRODUCTOS_ALMACEN = gql`
  query {
    productosAlmacen {
      idProductoAlmacen
      stock
      stockMin
      stockMax
      idProducto { idProducto nombre precio }
      idAlmacen { idAlmacen nombre }
    }
  }
`

export const GET_NOTAS_INGRESO = gql`
  query {
    notasIngreso {
      idIngreso
      fecha
      glosa
      motivo
      estado
      idUsuario { username }
      detalles {
        idDetalleIngreso
        cantidad
        observacion
        idProducto { nombre }
        idAlmacen { nombre }
      }
    }
  }
`

export const GET_NOTAS_EGRESO = gql`
  query {
    notasEgreso {
      idEgreso
      fecha
      glosa
      motivo
      estado
      idUsuario { username }
      detalles {
        idDetalleEgreso
        cantidad
        observacion
        idProducto { nombre }
        idAlmacen { nombre }
      }
    }
  }
`

export const GET_TRASPASOS = gql`
  query {
    traspasos {
      idTraspaso
      tipo
      fecha
      glosa
      estado
      idUsuario { username }
      almacenOrigen { idAlmacen nombre }
      almacenDestino { idAlmacen nombre }
      detalles {
        idDetalleTraspaso
        cantidad
        idProducto { nombre }
      }
    }
  }
`