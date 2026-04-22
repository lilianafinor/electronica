import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, permiso }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

  if (!usuario) {
    return <Navigate to="/login" />
  }

  if (permiso) {
    const permisos = usuario.idRol?.rolPermisos?.map(
      (rp) => rp.idPermiso.nombre
    ) || []

    if (!permisos.includes(permiso)) {
      return <Navigate to="/sin-acceso" />
    }
  }

  return children
}