import { gql } from '@apollo/client'

export const LOGIN_MUTATION = gql`
  mutation LoginUsuario($username: String!, $password: String!) {
    loginUsuario(username: $username, password: $password) {
      ok
      mensaje
      usuario {
        idUsuario
        nombreCompleto
        permisos
        idRol {
          nombre
        }
      }
    }
  }
`

export const CREAR_USUARIO = gql`
  mutation CrearUsuario(
    $nombre: String!
    $username: String!
    $correo: String!
    $password: String!
    $paterno: String
    $materno: String
    $telefono: String
    $idRol: Int
  ) {
    crearUsuario(
      nombre: $nombre
      username: $username
      correo: $correo
      password: $password
      paterno: $paterno
      materno: $materno
      telefono: $telefono
      idRol: $idRol
    ) {
      ok
      usuario {
        idUsuario
        nombreCompleto
        username
        idRol { nombre }
      }
    }
  }
`

export const ACTUALIZAR_USUARIO = gql`
  mutation ActualizarUsuario(
    $idUsuario: Int!
    $nombre: String
    $paterno: String
    $materno: String
    $telefono: String
    $estado: String
  ) {
    actualizarUsuario(
      idUsuario: $idUsuario
      nombre: $nombre
      paterno: $paterno
      materno: $materno
      telefono: $telefono
      estado: $estado
    ) {
      ok
      usuario {
        idUsuario
        nombreCompleto
        username
        idRol { nombre }
      }
    }
  }
`

export const ASIGNAR_ROL_A_USUARIO = gql`
  mutation AsignarRolAUsuario($idUsuario: Int!, $idRol: Int!) {
    asignarRolAUsuario(idUsuario: $idUsuario, idRol: $idRol) {
      ok
      mensaje
    }
  }
`

export const ASIGNAR_PERMISO_A_USUARIO = gql`
  mutation AsignarRolPermisoAUsuario($idUsuario: Int!, $idRolPermiso: Int!) {
    asignarRolPermisoAUsuario(idUsuario: $idUsuario, idRolPermiso: $idRolPermiso) {
      ok
      mensaje
    }
  }
`

export const ELIMINAR_PERMISO_USUARIO = gql`
  mutation EliminarRolPermisoUsuario($idRolPermisoUsuario: Int!) {
    eliminarRolPermisoUsuario(idRolPermisoUsuario: $idRolPermisoUsuario) {
      ok
      mensaje
    }
  }
`

export const CAMBIAR_PASSWORD = gql`
  mutation CambiarPassword($idUsuario: Int!, $passwordNew: String!) {
    cambiarPassword(idUsuario: $idUsuario, passwordNew: $passwordNew) {
      ok
      mensaje
    }
  }
`

export const CREAR_ROL = gql`
  mutation CrearRol($nombre: String!, $descripcion: String) {
    crearRol(nombre: $nombre, descripcion: $descripcion) {
      ok
      rol { idRol nombre }
    }
  }
`

export const ACTUALIZAR_ROL = gql`
  mutation ActualizarRol($idRol: Int!, $nombre: String, $descripcion: String, $estado: String) {
    actualizarRol(idRol: $idRol, nombre: $nombre, descripcion: $descripcion, estado: $estado) {
      ok
      rol { idRol nombre estado }
    }
  }
`

export const CREAR_PERMISO = gql`
  mutation CrearPermiso($nombre: String!, $descripcion: String) {
    crearPermiso(nombre: $nombre, descripcion: $descripcion) {
      ok
      permiso { idPermiso nombre }
    }
  }
`

export const ELIMINAR_PERMISO = gql`
  mutation EliminarPermiso($idPermiso: Int!) {
    eliminarPermiso(idPermiso: $idPermiso) {
      ok
      mensaje
    }
  }
`

export const ASIGNAR_PERMISO_A_ROL = gql`
  mutation AsignarPermisoARol($idRol: Int!, $idPermiso: Int!) {
    asignarPermisoARol(idRol: $idRol, idPermiso: $idPermiso) {
      ok
      rolPermiso { idRolPermiso }
    }
  }
`

export const ELIMINAR_ROL_PERMISO = gql`
  mutation EliminarRolPermiso($idRolPermiso: Int!) {
    eliminarRolPermiso(idRolPermiso: $idRolPermiso) {
      ok
      mensaje
    }
  }
`