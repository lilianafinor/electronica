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
      intentosFallidos
      idRol { idRol nombre }
    }
  }
`

export const GET_ROLES = gql`
  query {
    roles {
      idRol
      nombre
      descripcion
      estado
      rolPermisos {
        idRolPermiso
        idPermiso { idPermiso nombre }
      }
    }
  }
`

export const GET_PERMISOS = gql`
  query {
    permisos {
      idPermiso
      nombre
      descripcion
      estado
    }
  }
`

export const GET_ROLES_PERMISOS = gql`
  query {
    rolesPermisos {
      idRolPermiso
      idRol { idRol nombre }
      idPermiso { idPermiso nombre }
    }
  }
`

export const GET_PERMISOS_USUARIO = gql`
  query {
    rolesPermisosUsuarios {
      idRolPermisoUsuario
      idUsuario { idUsuario username }
      idRolPermiso {
        idRolPermiso
        idRol { nombre }
        idPermiso { nombre }
      }
    }
  }
`