import { gql } from '@apollo/client'

export const CREAR_CLIENTE = gql`
  mutation CrearCliente(
    $nombre: String!
    $paterno: String
    $materno: String
    $telefono: String
    $correo: String
    $nit: String
    $direccion: String
  ) {
    crearCliente(
      nombre: $nombre
      paterno: $paterno
      materno: $materno
      telefono: $telefono
      correo: $correo
      nit: $nit
      direccion: $direccion
    ) {
      ok
      cliente { idCliente nombreCompleto }
    }
  }
`

export const ACTUALIZAR_CLIENTE = gql`
  mutation ActualizarCliente(
    $idCliente: Int!
    $nombre: String
    $paterno: String
    $materno: String
    $telefono: String
    $correo: String
    $nit: String
    $direccion: String
    $estado: String
  ) {
    actualizarCliente(
      idCliente: $idCliente
      nombre: $nombre
      paterno: $paterno
      materno: $materno
      telefono: $telefono
      correo: $correo
      nit: $nit
      direccion: $direccion
      estado: $estado
    ) {
      ok
      cliente { idCliente nombreCompleto estado }
    }
  }
`

export const CREAR_NOTA_VENTA = gql`
  mutation CrearNotaVenta(
    $fechaVenta: Date!
    $idCliente: Int!
    $glosa: String
    $tipoPago: String
    $idUsuario: Int
  ) {
    crearNotaVenta(
      fechaVenta: $fechaVenta
      idCliente: $idCliente
      glosa: $glosa
      tipoPago: $tipoPago
      idUsuario: $idUsuario
    ) {
      ok
      mensaje
      notaVenta { idVenta fechaVenta }
    }
  }
`

export const AGREGAR_DETALLE_VENTA = gql`
  mutation AgregarDetalleVenta(
    $idVenta: Int!
    $idProducto: Int!
    $idAlmacen: Int!
    $cantidad: String!
    $precioUni: String!
  ) {
    agregarDetalleVenta(
      idVenta: $idVenta
      idProducto: $idProducto
      idAlmacen: $idAlmacen
      cantidad: $cantidad
      precioUni: $precioUni
    ) {
      ok
      mensaje
      detalleVenta {
        idDetalleVenta
        cantidad
        precioUni
        precioSubtotal
        idProducto { nombre }
        idAlmacen { nombre }
      }
    }
  }
`

export const ELIMINAR_DETALLE_VENTA = gql`
  mutation EliminarDetalleVenta($idDetalleVenta: Int!) {
    eliminarDetalleVenta(idDetalleVenta: $idDetalleVenta) {
      ok
      mensaje
    }
  }
`

export const CANCELAR_VENTA = gql`
  mutation CancelarVenta($idVenta: Int!) {
    cancelarVenta(idVenta: $idVenta) {
      ok
      mensaje
    }
  }
`

export const GENERAR_QR_VENTA = gql`
  mutation GenerarQrVenta($idVenta: Int!) {
    generarQrVenta(idVenta: $idVenta) {
      ok
      mensaje
      qrUrl
      urlPasarela
      idTransaccion
    }
  }
`