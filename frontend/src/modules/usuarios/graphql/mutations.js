import { gql } from '@apollo/client'

export const LOGIN_MUTATION = gql`
  mutation LoginUsuario($username: String!, $password: String!) {
    loginUsuario(username: $username, password: $password) {
      ok
      mensaje
      usuario {
        idUsuario
        nombreCompleto
        idRol {
          nombre
          rolPermisos {
            idPermiso {
              nombre
            }
          }
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
      }
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