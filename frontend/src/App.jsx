import { Routes, Route, Navigate } from 'react-router-dom'
import Login        from './modules/usuarios/pages/Login'
import Layout       from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard    from './pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/"       element={<Navigate to="/login" />} />
      <Route path="/login"  element={<Login />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
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