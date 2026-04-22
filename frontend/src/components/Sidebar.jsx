import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Shield, Key,
  Package, ShoppingCart, ChevronDown, ChevronRight, LogOut
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

const COMPRAS = [
  { label: 'Proveedores',     path: '/compras/proveedores' },
  { label: 'Órdenes Compra',  path: '/compras/ordenes' },
  { label: 'Notas Compra',    path: '/compras/notas' },
  { label: 'Adquisiciones',   path: '/compras/adquisiciones' },
]

export default function Sidebar() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const usuario    = JSON.parse(localStorage.getItem('usuario') || 'null')
  const permisos   = usuario?.permisos || []
  const [invOpen, setInvOpen]   = useState(location.pathname.startsWith('/inventario'))
  const [compOpen, setCompOpen] = useState(location.pathname.startsWith('/compras'))

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <div className="w-64 min-h-screen bg-blue-800 text-white flex flex-col">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-xl font-bold">Electrónica PNP</h1>
        <p className="text-sm text-blue-300 mt-1">{usuario?.nombreCompleto}</p>
        <p className="text-xs text-blue-400">{usuario?.idRol?.nombre}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {MENU.map((item) => {
          if (item.permiso && !permisos.includes(item.permiso)) return null
          const Icon  = item.icon
          const activo = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${activo ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {permisos.includes('gestionar_inventario') && (
          <div>
            <button onClick={() => setInvOpen(!invOpen)}
              className="flex items-center gap-3 px-4 py-2 w-full rounded-lg hover:bg-blue-700 transition">
              <Package size={18} />
              <span className="flex-1 text-left">Inventario</span>
              {invOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {invOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {INVENTARIO.map((item) => (
                  <Link key={item.path} to={item.path}
                    className={`flex items-center px-4 py-2 rounded-lg transition text-sm ${location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {permisos.includes('gestionar_compras') && (
          <div>
            <button onClick={() => setCompOpen(!compOpen)}
              className="flex items-center gap-3 px-4 py-2 w-full rounded-lg hover:bg-blue-700 transition">
              <ShoppingCart size={18} />
              <span className="flex-1 text-left">Compras</span>
              {compOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {compOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {COMPRAS.map((item) => (
                  <Link key={item.path} to={item.path}
                    className={`flex items-center px-4 py-2 rounded-lg transition text-sm ${location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-blue-700">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg hover:bg-blue-700 transition">
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}