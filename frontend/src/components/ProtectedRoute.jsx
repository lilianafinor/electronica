import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, permiso }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

  if (!usuario) {
    return <Navigate to="/login" />
  }

  if (permiso) {
    const permisos = usuario?.permisos || []
    if (!permisos.includes(permiso)) {
      return <Navigate to="/sin-acceso" />
    }
  }

  return children
}