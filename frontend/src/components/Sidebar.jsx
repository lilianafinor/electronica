import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Shield, Key,
  Package, ChevronDown, ChevronRight, LogOut
} from 'lucide-react'

const MENU = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permiso: null },
  { label: 'Usuarios',  path: '/usuarios',  icon: Users,           permiso: 'gestionar_usuarios' },
  { label: 'Roles',     path: '/roles',     icon: Shield,          permiso: 'gestionar_roles' },
  { label: 'Permisos',  path: '/permisos',  icon: Key,             permiso: 'gestionar_permisos' },
]

const INVENTARIO = [
  { label: 'Productos',  path: '/inventario/productos' },
  { label: 'Almacenes',  path: '/inventario/almacenes' },
  { label: 'Ingresos',   path: '/inventario/ingresos' },
  { label: 'Egresos',    path: '/inventario/egresos' },
  { label: 'Traspasos',  path: '/inventario/traspasos' },
]

export default function Sidebar() {
  const navigate         = useNavigate()
  const location         = useLocation()
  const usuario          = JSON.parse(localStorage.getItem('usuario') || 'null')
  const permisos = usuario?.permisos || []
  const [invOpen, setInvOpen] = useState(
    location.pathname.startsWith('/inventario')
  )

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  const tieneInventario = permisos.includes('gestionar_inventario')

  return (
    <div className="w-64 min-h-screen bg-blue-800 text-white flex flex-col">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-xl font-bold">Electrónica PNP</h1>
        <p className="text-sm text-blue-300 mt-1">{usuario?.nombreCompleto}</p>
        <p className="text-xs text-blue-400">{usuario?.idRol?.nombre}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {MENU.map((item) => {
          if (item.permiso && !permisos.includes(item.permiso)) return null
          const Icon  = item.icon
          const activo = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                activo ? 'bg-blue-600' : 'hover:bg-blue-700'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {tieneInventario && (
          <div>
            <button
              onClick={() => setInvOpen(!invOpen)}
              className="flex items-center gap-3 px-4 py-2 w-full rounded-lg hover:bg-blue-700 transition"
            >
              <Package size={18} />
              <span className="flex-1 text-left">Inventario</span>
              {invOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {invOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {INVENTARIO.map((item) => {
                  const activo = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${
                        activo ? 'bg-blue-600' : 'hover:bg-blue-700'
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg hover:bg-blue-700 transition"
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}