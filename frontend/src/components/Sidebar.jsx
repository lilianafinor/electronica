import { Link, useNavigate } from 'react-router-dom'
import {
  Users, Package, Warehouse, ArrowDownCircle,
  ArrowUpCircle, ArrowLeftRight, LogOut, LayoutDashboard
} from 'lucide-react'

const MENU = [
  { label: 'Dashboard',  path: '/dashboard',           icon: LayoutDashboard,  permiso: null },
  { label: 'Usuarios',   path: '/usuarios',             icon: Users,            permiso: 'gestionar_usuarios' },
  { label: 'Productos',  path: '/inventario/productos', icon: Package,          permiso: 'gestionar_inventario' },
  { label: 'Almacenes',  path: '/inventario/almacenes', icon: Warehouse,        permiso: 'gestionar_inventario' },
  { label: 'Ingresos',   path: '/inventario/ingresos',  icon: ArrowDownCircle,  permiso: 'gestionar_inventario' },
  { label: 'Egresos',    path: '/inventario/egresos',   icon: ArrowUpCircle,    permiso: 'gestionar_inventario' },
  { label: 'Traspasos',  path: '/inventario/traspasos', icon: ArrowLeftRight,   permiso: 'gestionar_inventario' },
]

export default function Sidebar() {
  const navigate  = useNavigate()
  const usuario   = JSON.parse(localStorage.getItem('usuario') || 'null')
  const permisos  = usuario?.idRol?.rolPermisos?.map((rp) => rp.idPermiso.nombre) || []

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

      <nav className="flex-1 p-4 space-y-1">
        {MENU.map((item) => {
          if (item.permiso && !permisos.includes(item.permiso)) return null
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
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