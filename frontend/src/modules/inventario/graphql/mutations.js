import { gql } from '@apollo/client'

export const CREAR_PRODUCTO = gql`
  mutation CrearProducto(
    $nombre: String!
    $descripcion: String
    $precio: String
    $idMarca: Int
    $idCategoria: Int
    $idUnidad: Int
  ) {
    crearProducto(
      nombre: $nombre
      descripcion: $descripcion
      precio: $precio
      idMarca: $idMarca
      idCategoria: $idCategoria
      idUnidad: $idUnidad
    ) {
      ok
      producto { idProducto nombre precio }
    }
  }
`

export const ACTUALIZAR_PRODUCTO = gql`
  mutation ActualizarProducto(
    $idProducto: Int!
    $nombre: String
    $descripcion: String
    $precio: String
    $estado: String
    $idMarca: Int
    $idCategoria: Int
    $idUnidad: Int
  ) {
    actualizarProducto(
      idProducto: $idProducto
      nombre: $nombre
      descripcion: $descripcion
      precio: $precio
      estado: $estado
      idMarca: $idMarca
      idCategoria: $idCategoria
      idUnidad: $idUnidad
    ) {
      ok
      producto { idProducto nombre precio }
    }
  }
`

export const CREAR_ALMACEN = gql`
  mutation CrearAlmacen(
    $nombre: String!
    $descripcion: String
    $direccion: String
    $cantidadMax: Int
  ) {
    crearAlmacen(
      nombre: $nombre
      descripcion: $descripcion
      direccion: $direccion
      cantidadMax: $cantidadMax
    ) {
      ok
      almacen { idAlmacen nombre }
    }
  }
`

export const ACTUALIZAR_ALMACEN = gql`
  mutation ActualizarAlmacen(
    $idAlmacen: Int!
    $nombre: String
    $descripcion: String
    $direccion: String
    $cantidadMax: Int
    $estado: String
  ) {
    actualizarAlmacen(
      idAlmacen: $idAlmacen
      nombre: $nombre
      descripcion: $descripcion
      direccion: $direccion
      cantidadMax: $cantidadMax
      estado: $estado
    ) {
      ok
      almacen { idAlmacen nombre }
    }
  }
`

export const CREAR_NOTA_INGRESO = gql`
  mutation CrearNotaIngreso(
    $fecha: Date!
    $glosa: String
    $motivo: String
    $idUsuario: Int
  ) {
    crearNotaIngreso(
      fecha: $fecha
      glosa: $glosa
      motivo: $motivo
      idUsuario: $idUsuario
    ) {
      ok
      notaIngreso { idIngreso fecha }
    }
  }
`

export const AGREGAR_DETALLE_INGRESO = gql`
  mutation AgregarDetalleIngreso(
    $idIngreso: Int!
    $idProducto: Int!
    $idAlmacen: Int!
    $cantidad: String!
    $observacion: String
  ) {
    agregarDetalleIngreso(
      idIngreso: $idIngreso
      idProducto: $idProducto
      idAlmacen: $idAlmacen
      cantidad: $cantidad
      observacion: $observacion
    ) {
      ok
      detalleIngreso {
        idDetalleIngreso
        cantidad
        idProducto { nombre }
        idAlmacen { nombre }
      }
    }
  }
`

export const CREAR_NOTA_EGRESO = gql`
  mutation CrearNotaEgreso(
    $fecha: Date!
    $glosa: String
    $motivo: String
    $idUsuario: Int
  ) {
    crearNotaEgreso(
      fecha: $fecha
      glosa: $glosa
      motivo: $motivo
      idUsuario: $idUsuario
    ) {
      ok
      notaEgreso { idEgreso fecha }
    }
  }
`

export const AGREGAR_DETALLE_EGRESO = gql`
  mutation AgregarDetalleEgreso(
    $idEgreso: Int!
    $idProducto: Int!
    $idAlmacen: Int!
    $cantidad: String!
    $observacion: String
  ) {
    agregarDetalleEgreso(
      idEgreso: $idEgreso
      idProducto: $idProducto
      idAlmacen: $idAlmacen
      cantidad: $cantidad
      observacion: $observacion
    ) {
      ok
      mensaje
    }
  }
`

export const CREAR_TRASPASO = gql`
  mutation CrearTraspaso(
    $fecha: Date!
    $tipo: String
    $glosa: String
    $idUsuario: Int
    $almacenOrigen: Int!
    $almacenDestino: Int!
  ) {
    crearTraspaso(
      fecha: $fecha
      tipo: $tipo
      glosa: $glosa
      idUsuario: $idUsuario
      almacenOrigen: $almacenOrigen
      almacenDestino: $almacenDestino
    ) {
      ok
      mensaje
      traspaso { idTraspaso fecha }
    }
  }
`

export const AGREGAR_DETALLE_TRASPASO = gql`
  mutation AgregarDetalleTraspaso(
    $idTraspaso: Int!
    $idProducto: Int!
    $cantidad: String!
  ) {
    agregarDetalleTraspaso(
      idTraspaso: $idTraspaso
      idProducto: $idProducto
      cantidad: $cantidad
    ) {
      ok
      mensaje
    }
  }
`

export const ACTUALIZAR_LIMITES_STOCK = gql`
  mutation ActualizarLimitesStock(
    $idProducto: Int!
    $idAlmacen: Int!
    $stockMin: String
    $stockMax: String
  ) {
    actualizarLimitesStock(
      idProducto: $idProducto
      idAlmacen: $idAlmacen
      stockMin: $stockMin
      stockMax: $stockMax
    ) {
      ok
      mensaje
    }
  }
`