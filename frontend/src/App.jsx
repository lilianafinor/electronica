import { Routes, Route, Navigate } from 'react-router-dom'
import Login          from './modules/usuarios/pages/Login'
import Layout         from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard      from './pages/Dashboard'
import UsuariosPage   from './modules/usuarios/pages/UsuariosPage'
import RolesPage      from './modules/usuarios/pages/RolesPage'
import PermisosPage   from './modules/usuarios/pages/PermisosPage'
import Productos      from './modules/inventario/pages/Productos'
import Almacenes      from './modules/inventario/pages/Almacenes'
import Ingresos       from './modules/inventario/pages/Ingresos'
import Egresos        from './modules/inventario/pages/Egresos'
import Traspasos      from './modules/inventario/pages/Traspasos'

function App() {
  return (
    <Routes>
      <Route path="/"      element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
      }/>

      <Route path="/usuarios" element={
        <ProtectedRoute permiso="gestionar_usuarios"><Layout><UsuariosPage /></Layout></ProtectedRoute>
      }/>

      <Route path="/roles" element={
        <ProtectedRoute permiso="gestionar_roles"><Layout><RolesPage /></Layout></ProtectedRoute>
      }/>

      <Route path="/permisos" element={
        <ProtectedRoute permiso="gestionar_permisos"><Layout><PermisosPage /></Layout></ProtectedRoute>
      }/>

      <Route path="/inventario/productos" element={
        <ProtectedRoute permiso="gestionar_inventario"><Layout><Productos /></Layout></ProtectedRoute>
      }/>

      <Route path="/inventario/almacenes" element={
        <ProtectedRoute permiso="gestionar_inventario"><Layout><Almacenes /></Layout></ProtectedRoute>
      }/>

      <Route path="/inventario/ingresos" element={
        <ProtectedRoute permiso="gestionar_inventario"><Layout><Ingresos /></Layout></ProtectedRoute>
      }/>

      <Route path="/inventario/egresos" element={
        <ProtectedRoute permiso="gestionar_inventario"><Layout><Egresos /></Layout></ProtectedRoute>
      }/>

      <Route path="/inventario/traspasos" element={
        <ProtectedRoute permiso="gestionar_inventario"><Layout><Traspasos /></Layout></ProtectedRoute>
      }/>

      <Route path="/sin-acceso" element={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500 text-xl">No tienes permiso para acceder aquí.</p>
        </div>
      }/>
    </Routes>
  )
}

export default App