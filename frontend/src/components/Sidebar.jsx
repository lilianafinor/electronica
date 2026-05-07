import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Shield, Key,
  Package, ShoppingCart, ShoppingBag, Wrench,
  ChevronDown, ChevronRight, LogOut, Zap
} from 'lucide-react'

const MENU = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permiso: null },
  { label: 'Usuarios',  path: '/usuarios',  icon: Users,           permiso: 'gestionar_usuarios' },
  { label: 'Roles',     path: '/roles',     icon: Shield,          permiso: 'gestionar_roles' },
  { label: 'Permisos',  path: '/permisos',  icon: Key,             permiso: 'gestionar_permisos' },
]

const INVENTARIO   = [
  { label: 'Artículos', path: '/inventario/productos' },
  { label: 'Almacenes', path: '/inventario/almacenes' },
  { label: 'Ingresos',  path: '/inventario/ingresos' },
  { label: 'Egresos',   path: '/inventario/egresos' },
  { label: 'Traspasos', path: '/inventario/traspasos' },
]
const COMPRAS = [
  { label: 'Proveedores',    path: '/compras/proveedores' },
  { label: 'Catálogo',       path: '/compras/catalogo' },
  { label: 'Órdenes Compra', path: '/compras/ordenes' },
  { label: 'Notas Compra',   path: '/compras/notas' },
  { label: 'Adquisiciones',  path: '/compras/adquisiciones' },
]
const VENTAS = [
  { label: 'Clientes',    path: '/ventas/clientes' },
  { label: 'Notas Venta', path: '/ventas/notas' },
]
const REPARACIONES = [
  { label: 'Recepción Equipos', path: '/reparaciones/equipos' },
  { label: 'Órdenes',           path: '/reparaciones/ordenes' },
  { label: 'Diagnósticos',      path: '/reparaciones/diagnosticos' },
  { label: 'Cotizaciones',      path: '/reparaciones/cotizaciones' },
]

const S = {
  sidebar: {
    width: '240px', minWidth: '240px', minHeight: '100vh',
    background: '#0f172a', display: 'flex', flexDirection: 'column',
    fontFamily: 'inherit',
  },
  logo: {
    padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '10px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  logoIcon: {
    width: '36px', height: '36px', background: '#dc2626', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    boxShadow: '0 4px 12px rgba(220,38,38,0.4)',
  },
  logoText: { lineHeight: 1 },
  logoTitle: { color: 'white', fontWeight: 800, fontSize: '13px', letterSpacing: '1px' },
  logoSub: { color: '#dc2626', fontWeight: 700, fontSize: '11px', letterSpacing: '2px', marginTop: '2px' },
  userBox: {
    margin: '12px', padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
  },
  avatar: {
    width: '32px', height: '32px', background: '#dc2626', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: '13px', fontWeight: 700, flexShrink: 0,
  },
  userName: { color: 'white', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { color: '#64748b', fontSize: '11px', marginTop: '1px' },
  nav: { flex: 1, padding: '8px', overflowY: 'auto' },
  sectionLabel: {
    color: '#334155', fontSize: '10px', fontWeight: 700,
    letterSpacing: '1.5px', textTransform: 'uppercase',
    padding: '12px 10px 6px',
  },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 12px', borderRadius: '9px', cursor: 'pointer',
    textDecoration: 'none', fontSize: '13px', fontWeight: 500,
    marginBottom: '2px', transition: 'all 0.15s',
    background: active ? '#dc2626' : 'transparent',
    color: active ? 'white' : '#94a3b8',
  }),
  groupBtn: (active) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 12px', borderRadius: '9px', cursor: 'pointer',
    border: 'none', background: active ? 'rgba(220,38,38,0.12)' : 'transparent',
    color: active ? '#fca5a5' : '#94a3b8',
    fontSize: '13px', fontWeight: 500, width: '100%',
    marginBottom: '2px', transition: 'all 0.15s',
  }),
  subNav: {
    marginLeft: '12px', paddingLeft: '12px',
    borderLeft: '1px solid rgba(255,255,255,0.07)',
    marginBottom: '4px',
  },
  subItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '7px 10px', borderRadius: '8px', cursor: 'pointer',
    textDecoration: 'none', fontSize: '12px', fontWeight: 500,
    marginBottom: '1px', transition: 'all 0.15s',
    background: active ? '#dc2626' : 'transparent',
    color: active ? 'white' : '#64748b',
  }),
  dot: (active) => ({
    width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
    background: active ? 'white' : '#334155',
  }),
  footer: {
    padding: '8px', borderTop: '1px solid rgba(255,255,255,0.07)',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 12px', borderRadius: '9px', cursor: 'pointer',
    border: 'none', background: 'transparent',
    color: '#475569', fontSize: '13px', fontWeight: 500, width: '100%',
    transition: 'all 0.15s',
  },
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const usuario  = JSON.parse(localStorage.getItem('usuario') || 'null')
  const permisos = usuario?.permisos || []

  const [invOpen,  setInvOpen]  = useState(location.pathname.startsWith('/inventario'))
  const [compOpen, setCompOpen] = useState(location.pathname.startsWith('/compras'))
  const [ventOpen, setVentOpen] = useState(location.pathname.startsWith('/ventas'))
  const [repOpen,  setRepOpen]  = useState(location.pathname.startsWith('/reparaciones'))

  const isActive      = (path)   => location.pathname === path
  const isGroupActive = (prefix) => location.pathname.startsWith(prefix)

  const handleLogout = () => { localStorage.removeItem('usuario'); navigate('/login') }

  const renderGroup = (label, Icon, items, isOpen, setOpen, permiso, prefix) => {
    if (permiso && !permisos.includes(permiso)) return null
    const gActive = isGroupActive(prefix)
    return (
      <div>
        <button
          style={S.groupBtn(gActive)}
          onClick={() => setOpen(!isOpen)}
          onMouseEnter={(e) => { if (!gActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
          onMouseLeave={(e) => { if (!gActive) e.currentTarget.style.background = 'transparent' }}
        >
          <Icon size={16} />
          <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        {isOpen && (
          <div style={S.subNav}>
            {items.map((item) => {
              const active = isActive(item.path)
              return (
                <Link key={item.path} to={item.path} style={S.subItem(active)}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(220,38,38,0.1)'; e.currentTarget.style.color = '#fca5a5' } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' } }}
                >
                  <span style={S.dot(active)}></span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={S.sidebar}>
      {/* Logo */}
      <div style={S.logo}>
        <div style={S.logoIcon}><Zap size={17} color="white" fill="white" /></div>
        <div style={S.logoText}>
          <div style={S.logoTitle}>ELECTRÓNICA</div>
          <div style={S.logoSub}>PNP</div>
        </div>
      </div>

      {/* Usuario */}
      <div style={S.userBox}>
        <div style={S.avatar}>{usuario?.nombreCompleto?.charAt(0)?.toUpperCase() || 'U'}</div>
        <div style={{ minWidth: 0 }}>
          <div style={S.userName}>{usuario?.nombreCompleto}</div>
          <div style={S.userRole}>{usuario?.idRol?.nombre}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.sectionLabel}>General</div>
        {MENU.map((item) => {
          if (item.permiso && !permisos.includes(item.permiso)) return null
          const Icon   = item.icon
          const active = isActive(item.path)
          return (
            <Link key={item.path} to={item.path} style={S.navItem(active)}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e2e8f0' } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' } }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <div style={S.sectionLabel}>Módulos</div>
        {renderGroup('Inventario',   Package,      INVENTARIO,   invOpen,  setInvOpen,  'gestionar_inventario',   '/inventario')}
        {renderGroup('Compras',      ShoppingCart, COMPRAS,      compOpen, setCompOpen, 'gestionar_compras',      '/compras')}
        {renderGroup('Ventas',       ShoppingBag,  VENTAS,       ventOpen, setVentOpen, 'gestionar_ventas',       '/ventas')}
        {renderGroup('Reparaciones', Wrench,       REPARACIONES, repOpen,  setRepOpen,  'gestionar_reparaciones', '/reparaciones')}
      </nav>

      {/* Logout */}
      <div style={S.footer}>
        <button style={S.logoutBtn} onClick={handleLogout}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.1)'; e.currentTarget.style.color = '#fca5a5' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569' }}
        >
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}