import { gql } from '@apollo/client'

export const CREAR_PROVEEDOR = gql`
  mutation CrearProveedor(
    $nombre: String!
    $telefono: String
    $email: String
    $direccion: String
    $nit: String
    $contacto: String
  ) {
    crearProveedor(
      nombre: $nombre
      telefono: $telefono
      email: $email
      direccion: $direccion
      nit: $nit
      contacto: $contacto
    ) {
      ok
      proveedor { idProveedor nombre }
    }
  }
`

export const ACTUALIZAR_PROVEEDOR = gql`
  mutation ActualizarProveedor(
    $idProveedor: Int!
    $nombre: String
    $telefono: String
    $email: String
    $direccion: String
    $nit: String
    $contacto: String
    $estado: String
  ) {
    actualizarProveedor(
      idProveedor: $idProveedor
      nombre: $nombre
      telefono: $telefono
      email: $email
      direccion: $direccion
      nit: $nit
      contacto: $contacto
      estado: $estado
    ) {
      ok
      proveedor { idProveedor nombre estado }
    }
  }
`

export const CREAR_ORDEN_COMPRA = gql`
  mutation CrearOrdenCompra(
    $fecha: Date!
    $idProveedor: Int!
    $glosa: String
    $idUsuario: Int
  ) {
    crearOrdenCompra(
      fecha: $fecha
      idProveedor: $idProveedor
      glosa: $glosa
      idUsuario: $idUsuario
    ) {
      ok
      ordenCompra { idOrden fecha estado }
    }
  }
`

export const AGREGAR_DETALLE_ORDEN = gql`
  mutation AgregarDetalleOrden(
    $idOrden: Int!
    $idProducto: Int!
    $cantidad: String!
    $precioUni: String!
  ) {
    agregarDetalleOrden(
      idOrden: $idOrden
      idProducto: $idProducto
      cantidad: $cantidad
      precioUni: $precioUni
    ) {
      ok
      detalleOrden {
        idDetalleOrden
        cantidad
        precioUni
        subTotal
        idProducto { nombre }
      }
    }
  }
`

export const ACTUALIZAR_ESTADO_ORDEN = gql`
  mutation ActualizarEstadoOrden($idOrden: Int!, $estado: String!) {
    actualizarEstadoOrden(idOrden: $idOrden, estado: $estado) {
      ok
      ordenCompra { idOrden estado }
    }
  }
`

export const CREAR_NOTA_COMPRA = gql`
  mutation CrearNotaCompra(
    $fechaCompra: Date!
    $idProveedor: Int!
    $nroFactura: String
    $glosa: String
    $tipoPago: String
    $idUsuario: Int
  ) {
    crearNotaCompra(
      fechaCompra: $fechaCompra
      idProveedor: $idProveedor
      nroFactura: $nroFactura
      glosa: $glosa
      tipoPago: $tipoPago
      idUsuario: $idUsuario
    ) {
      ok
      notaCompra { idCompra fechaCompra }
    }
  }
`

export const AGREGAR_DETALLE_NOTA_COMPRA = gql`
  mutation AgregarDetalleNotaCompra(
    $idCompra: Int!
    $idProducto: Int!
    $cantidad: String!
    $precioUni: String!
  ) {
    agregarDetalleNotaCompra(
      idCompra: $idCompra
      idProducto: $idProducto
      cantidad: $cantidad
      precioUni: $precioUni
    ) {
      ok
      detalleCompra {
        idDetalleCompra
        cantidad
        precioUni
        subTotal
        idProducto { nombre }
      }
    }
  }
`

export const CREAR_ADQUISICION = gql`
  mutation CrearAdquisicion(
    $fecha: Date!
    $idProveedor: Int!
    $idOrden: Int
    $glosa: String
    $idUsuario: Int
  ) {
    crearAdquisicion(
      fecha: $fecha
      idProveedor: $idProveedor
      idOrden: $idOrden
      glosa: $glosa
      idUsuario: $idUsuario
    ) {
      ok
      adquisicion { idAdquisicion fecha }
    }
  }
`

export const AGREGAR_DETALLE_ADQUISICION = gql`
  mutation AgregarDetalleAdquisicion(
    $idAdquisicion: Int!
    $idProducto: Int!
    $idAlmacen: Int!
    $cantidad: String!
    $precioUni: String!
  ) {
    agregarDetalleAdquisicion(
      idAdquisicion: $idAdquisicion
      idProducto: $idProducto
      idAlmacen: $idAlmacen
      cantidad: $cantidad
      precioUni: $precioUni
    ) {
      ok
      mensaje
    }
  }
`