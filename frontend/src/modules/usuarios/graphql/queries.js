import { gql } from '@apollo/client'

export const GET_USUARIOS = gql`
  query {
    usuarios {
      idUsuario
      nombreCompleto
      username
      correo
      telefono
      estado
      bloqueado
      idRol { nombre }
    }
  }
`

export const GET_ROLES = gql`
  query {
    roles {
      idRol
      nombre
      descripcion
    }
  }
`

export const GET_PERMISOS = gql`
  query {
    permisos {
      idPermiso
      nombre
      descripcion
    }
  }
`