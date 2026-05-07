import Sidebar from './Sidebar'
import { useLocation } from 'react-router-dom'

const TITLES = {
  '/dashboard':                 'Dashboard',
  '/usuarios':                  'Gestión de Usuarios',
  '/roles':                     'Gestión de Roles',
  '/permisos':                  'Gestión de Permisos',
  '/inventario/productos':      'Artículos',
  '/inventario/almacenes':      'Almacenes',
  '/inventario/ingresos':       'Ingresos',
  '/inventario/egresos':        'Egresos',
  '/inventario/traspasos':      'Traspasos',
  '/compras/proveedores':       'Proveedores',
  '/compras/catalogo':          'Catálogo de Proveedores',
  '/compras/ordenes':           'Órdenes de Compra',
  '/compras/notas':             'Notas de Compra',
  '/compras/adquisiciones':     'Adquisiciones',
  '/ventas/clientes':           'Clientes',
  '/ventas/notas':              'Notas de Venta',
  '/reparaciones/equipos':      'Recepción de Equipos',
  '/reparaciones/ordenes':      'Órdenes de Reparación',
  '/reparaciones/diagnosticos': 'Diagnósticos',
  '/reparaciones/cotizaciones': 'Cotizaciones',
}

export default function Layout({ children }) {
  const location = useLocation()
  const title    = TITLES[location.pathname] || 'Panel'
  const usuario  = JSON.parse(localStorage.getItem('usuario') || 'null')
  const now      = new Date()
  const fecha    = now.toLocaleDateString('es-BO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header style={{
          height: '64px', minHeight: '64px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          gap: '16px',
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{title}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize', marginTop: '1px' }}>{fecha}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{usuario?.nombreCompleto}</div>
              <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 500 }}>{usuario?.idRol?.nombre}</div>
            </div>
            <div style={{
              width: '36px', height: '36px', background: '#dc2626',
              borderRadius: '10px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontSize: '14px',
              fontWeight: 700, flexShrink: 0,
              boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
            }}>
              {usuario?.nombreCompleto?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main style={{ flex: 1, padding: '24px', overflowAuto: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          padding: '12px 24px',
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          fontSize: '11px',
          color: '#94a3b8',
          textAlign: 'center',
        }}>
          Electrónica PNP — Sistema de Gestión © {now.getFullYear()}
        </footer>
      </div>
    </div>
  )
}