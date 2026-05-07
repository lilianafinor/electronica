import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { useState } from 'react'
import { GET_NOTAS_VENTA, GET_CLIENTE_POR_NIT } from '../graphql/queries'
import { GET_PRODUCTOS, GET_PRODUCTOS_ALMACEN } from '../../inventario/graphql/queries'
import {
  CREAR_NOTA_VENTA,
  AGREGAR_DETALLE_VENTA,
  ELIMINAR_DETALLE_VENTA,
  CANCELAR_VENTA,
  CREAR_CLIENTE,
  GENERAR_QR_VENTA,
} from '../graphql/mutations'

// Fecha local Bolivia (UTC-4) sin desfase
const fechaLocal = () => {
  const now = new Date()
  const y   = now.getFullYear()
  const m   = String(now.getMonth() + 1).padStart(2, '0')
  const d   = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function ModalQR({ qrUrl, urlPasarela, idTransaccion, montoTotal, onCerrar }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div style={{background:'#fff',borderRadius:12,padding:24,width:380,maxWidth:'90vw'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <span style={{fontSize:18,fontWeight:700,color:'#1f2937'}}>Pago con QR</span>
          <button onClick={onCerrar} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#9ca3af'}}>X</button>
        </div>
        <div style={{textAlign:'center',marginBottom:16}}>
          <div style={{fontSize:24,fontWeight:700,color:'#059669'}}>{'Bs. ' + parseFloat(montoTotal).toFixed(2)}</div>
          <div style={{fontSize:13,color:'#6b7280',marginTop:4}}>Escanea el QR para pagar</div>
        </div>
        {qrUrl
          ? <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
              <img src={qrUrl} alt="QR" style={{width:220,height:220,border:'2px solid #e5e7eb',borderRadius:8}} />
            </div>
          : <div style={{display:'flex',justifyContent:'center',alignItems:'center',width:220,height:220,margin:'0 auto 16px',background:'#f3f4f6',borderRadius:8,border:'2px dashed #d1d5db'}}>
              <div style={{fontSize:13,color:'#9ca3af',textAlign:'center',padding:'0 16px'}}>QR no disponible en modo simulado</div>
            </div>
        }
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {urlPasarela && (
            <a href={urlPasarela} target="_blank" rel="noreferrer"
              style={{display:'block',textAlign:'center',background:'#2563eb',color:'#fff',padding:'8px 0',borderRadius:8,textDecoration:'none',fontSize:14}}>
              Abrir pasarela de pago
            </a>
          )}
          <div style={{fontSize:11,color:'#9ca3af',textAlign:'center'}}>{'ID: ' + idTransaccion}</div>
          <button onClick={onCerrar}
            style={{background:'#f3f4f6',border:'none',borderRadius:8,padding:'8px 0',cursor:'pointer',fontSize:14,color:'#374151'}}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NotasVenta() {
  const { data, loading, refetch }                 = useQuery(GET_NOTAS_VENTA, { fetchPolicy: 'network-only' })
  const { data: dataProductos }                    = useQuery(GET_PRODUCTOS, { fetchPolicy: 'network-only' })
  const { data: dataStock, refetch: refetchStock } = useQuery(GET_PRODUCTOS_ALMACEN, { fetchPolicy: 'network-only' })

  const [crearVenta]           = useMutation(CREAR_NOTA_VENTA)
  const [agregarDetalle]       = useMutation(AGREGAR_DETALLE_VENTA)
  const [eliminarDetalle]      = useMutation(ELIMINAR_DETALLE_VENTA)
  const [cancelarVenta]        = useMutation(CANCELAR_VENTA)
  const [crearCliente]         = useMutation(CREAR_CLIENTE)
  const [generarQr]            = useMutation(GENERAR_QR_VENTA)
  const [buscarClientePorNit]  = useLazyQuery(GET_CLIENTE_POR_NIT, { fetchPolicy: 'network-only' })

  const [modo, setModo]                           = useState('lista')
  const [ventaId, setVentaId]                     = useState(null)
  const [detallesLocales, setDetallesLocales]     = useState([])
  const [montoLocal, setMontoLocal]               = useState(0)
  const [mensaje, setMensaje]                     = useState('')
  const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false)
  const [modalQR, setModalQR]                     = useState(null)
  const [nitBusqueda, setNitBusqueda]             = useState('')
  const [clienteEncontrado, setClienteEncontrado] = useState(null)
  const [buscando, setBuscando]                   = useState(false)
  const [tipoPagoActual, setTipoPagoActual]       = useState('contado')

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
  const hoy     = fechaLocal()

  const [formVenta, setFormVenta] = useState({
    fechaVenta: hoy, idCliente: '', glosa: '', tipoPago: 'contado'
  })
  const [formDetalle, setFormDetalle] = useState({
    idProducto: '', idAlmacen: '', cantidad: '', precioUni: '',
    unidad: '', esEntero: true, stockDisponible: 0,
    nombreProducto: '', nombreAlmacen: ''
  })
  const [formCliente, setFormCliente] = useState({
    nombre: '', paterno: '', materno: '', telefono: '', correo: '', nit: ''
  })

  const getAlmacenesConStock = (idProducto) => {
    if (!idProducto || !dataStock?.productosAlmacen) return []
    return dataStock.productosAlmacen.filter(
      (pa) => String(pa.idProducto?.idProducto) === String(idProducto) && parseFloat(pa.stock) > 0
    )
  }

  const resetModo = () => {
    setModo('lista'); setVentaId(null); setDetallesLocales([]); setMontoLocal(0)
    setMensaje(''); setClienteEncontrado(null); setNitBusqueda('')
    setMostrarNuevoCliente(false); setTipoPagoActual('contado')
    setFormVenta({ fechaVenta: hoy, idCliente: '', glosa: '', tipoPago: 'contado' })
  }

  const handleBuscarNit = async () => {
    if (!nitBusqueda.trim()) return
    setBuscando(true); setClienteEncontrado(null)
    try {
      const { data: res } = await buscarClientePorNit({ variables: { nit: nitBusqueda.trim() } })
      if (res?.clientePorNit) {
        setClienteEncontrado(res.clientePorNit)
        setFormVenta((p) => ({ ...p, idCliente: res.clientePorNit.idCliente }))
        setMensaje('')
      } else {
        setFormVenta((p) => ({ ...p, idCliente: '' }))
        setMensaje('Cliente no encontrado. Puedes registrarlo abajo.')
      }
    } catch (err) { setMensaje('Error: ' + err.message) }
    setBuscando(false)
  }

  const handleProductoChange = (idProducto) => {
    if (!idProducto) {
      setFormDetalle({ idProducto: '', idAlmacen: '', cantidad: '', precioUni: '', unidad: '', esEntero: true, stockDisponible: 0, nombreProducto: '', nombreAlmacen: '' })
      return
    }
    const producto  = dataProductos?.productos.find((p) => String(p.idProducto) === String(idProducto))
    const unidad    = producto?.idUnidad?.nombre || ''
    const esEntero  = !['kg', 'litro', 'metro', 'lt', 'l'].includes(unidad.toLowerCase())
    const almacenes = getAlmacenesConStock(idProducto)
    const primero   = almacenes[0]
    setFormDetalle({
      idProducto,
      nombreProducto:  producto?.nombre || '',
      idAlmacen:       primero?.idAlmacen?.idAlmacen || '',
      nombreAlmacen:   primero?.idAlmacen?.nombre || '',
      cantidad:        '',
      precioUni:       producto?.precio ? String(producto.precio) : '',
      unidad,
      esEntero,
      stockDisponible: primero ? parseFloat(primero.stock) : 0,
    })
  }

  const handleAlmacenChange = (idAlmacen) => {
    const pa = dataStock?.productosAlmacen.find(
      (x) => String(x.idProducto?.idProducto) === String(formDetalle.idProducto) &&
              String(x.idAlmacen?.idAlmacen) === String(idAlmacen)
    )
    setFormDetalle((p) => ({
      ...p, idAlmacen,
      nombreAlmacen:   pa?.idAlmacen?.nombre || '',
      stockDisponible: pa ? parseFloat(pa.stock) : 0
    }))
  }

  const handleCrearVenta = async () => {
    if (!formVenta.idCliente) { setMensaje('Debes seleccionar un cliente'); return }
    try {
      const { data: res } = await crearVenta({
        variables: {
          fechaVenta: formVenta.fechaVenta,
          idCliente:  parseInt(formVenta.idCliente),
          glosa:      formVenta.glosa || null,
          tipoPago:   formVenta.tipoPago,
          idUsuario:  parseInt(usuario?.idUsuario),
        }
      })
      if (res.crearNotaVenta.ok) {
        setVentaId(String(res.crearNotaVenta.notaVenta.idVenta))
        setTipoPagoActual(formVenta.tipoPago)
        setDetallesLocales([]); setMontoLocal(0)
        setModo('detalle'); setMensaje('')
        refetch(); refetchStock()
      } else { setMensaje(res.crearNotaVenta.mensaje) }
    } catch (err) { setMensaje('Error: ' + err.message) }
  }

  const handleAgregarDetalle = async () => {
    if (!formDetalle.idProducto || !formDetalle.idAlmacen || !formDetalle.cantidad) {
      setMensaje('Completa todos los campos'); return
    }
    try {
      const { data: res } = await agregarDetalle({
        variables: {
          idVenta:    parseInt(ventaId),
          idProducto: parseInt(formDetalle.idProducto),
          idAlmacen:  parseInt(formDetalle.idAlmacen),
          cantidad:   String(formDetalle.cantidad),
          precioUni:  String(formDetalle.precioUni),
        }
      })
      if (res.agregarDetalleVenta.ok) {
        const cant   = parseFloat(formDetalle.cantidad)
        const precio = parseFloat(formDetalle.precioUni)
        const idDet  = res.agregarDetalleVenta.detalleVenta.idDetalleVenta
        setDetallesLocales((prev) => [...prev, {
          id:             idDet,
          idDetalleVenta: idDet,
          nombreProducto: formDetalle.nombreProducto,
          nombreAlmacen:  formDetalle.nombreAlmacen,
          idProducto:     formDetalle.idProducto,
          idAlmacen:      formDetalle.idAlmacen,
          cantidad:       cant,
          precioUni:      precio,
          subtotal:       cant * precio,
        }])
        setMontoLocal((prev) => prev + cant * precio)
        setFormDetalle({ idProducto: '', idAlmacen: '', cantidad: '', precioUni: '', unidad: '', esEntero: true, stockDisponible: 0, nombreProducto: '', nombreAlmacen: '' })
        setMensaje('Artículo agregado correctamente')
        refetchStock()
      } else { setMensaje(res.agregarDetalleVenta.mensaje) }
    } catch (err) { setMensaje('Error: ' + err.message) }
  }

  const handleEliminarDetalle = async (detalle) => {
    if (!confirm('¿Eliminar este artículo del detalle? Se restaurará el stock.')) return
    try {
      const { data: res } = await eliminarDetalle({
        variables: { idDetalleVenta: parseInt(detalle.idDetalleVenta) }
      })
      if (res.eliminarDetalleVenta.ok) {
        setDetallesLocales((prev) => prev.filter((d) => d.idDetalleVenta !== detalle.idDetalleVenta))
        setMontoLocal((prev) => prev - detalle.subtotal)
        setMensaje('Artículo eliminado y stock restaurado')
        refetchStock()
      } else { setMensaje(res.eliminarDetalleVenta.mensaje) }
    } catch (err) { setMensaje('Error: ' + err.message) }
  }

  const handleGenerarQR = async () => {
    if (!ventaId) return
    setMensaje('')
    try {
      const { data: res } = await generarQr({ variables: { idVenta: parseInt(ventaId) } })
      if (res.generarQrVenta.ok) {
        setModalQR({ qrUrl: res.generarQrVenta.qrUrl, urlPasarela: res.generarQrVenta.urlPasarela, idTransaccion: res.generarQrVenta.idTransaccion, montoTotal: montoLocal })
      } else { setMensaje(res.generarQrVenta.mensaje) }
    } catch (err) { setMensaje('Error: ' + err.message) }
  }

  const handleConfirmarContado = () => {
    setMensaje('Venta al contado confirmada correctamente.')
    setTimeout(() => { resetModo(); refetch() }, 1500)
  }

  const handleCrearCliente = async () => {
    if (!formCliente.nombre) { setMensaje('El nombre es requerido'); return }
    try {
      const { data: res } = await crearCliente({
        variables: {
          nombre:   formCliente.nombre,
          paterno:  formCliente.paterno  || null,
          materno:  formCliente.materno  || null,
          telefono: formCliente.telefono || null,
          correo:   formCliente.correo   || null,
          nit:      formCliente.nit      || null,
        }
      })
      if (res.crearCliente.ok) {
        const nuevo = res.crearCliente.cliente
        setClienteEncontrado(nuevo)
        setFormVenta((p) => ({ ...p, idCliente: nuevo.idCliente }))
        setNitBusqueda(formCliente.nit || '')
        setFormCliente({ nombre: '', paterno: '', materno: '', telefono: '', correo: '', nit: '' })
        setMostrarNuevoCliente(false)
        setMensaje('Cliente creado y seleccionado')
      }
    } catch (err) { setMensaje('Error: ' + err.message) }
  }

  const handleCancelar = async (idVenta) => {
    if (!confirm('¿Cancelar esta venta? Se restaurará el stock.')) return
    try {
      const { data: res } = await cancelarVenta({ variables: { idVenta: parseInt(idVenta) } })
      setMensaje(res.cancelarVenta.mensaje); refetch(); refetchStock()
    } catch (err) { setMensaje('Error: ' + err.message) }
  }

  const almacenesActuales = getAlmacenesConStock(formDetalle.idProducto)
  const etiquetaCantidad  = formDetalle.unidad ? ('Cantidad (' + formDetalle.unidad + ')') : 'Cantidad'

  if (loading) return <div className="p-4">Cargando...</div>

  return (
    <div>
      {modalQR && (
        <ModalQR
          qrUrl={modalQR.qrUrl}
          urlPasarela={modalQR.urlPasarela}
          idTransaccion={modalQR.idTransaccion}
          montoTotal={modalQR.montoTotal}
          onCerrar={() => { setModalQR(null); resetModo(); refetch() }}
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Notas de Venta</h2>
        <button
          onClick={() => { if (modo === 'nuevo' || modo === 'detalle') { resetModo() } else { setModo('nuevo'); setMensaje('') } }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' || modo === 'detalle' ? 'Ver lista' : '+ Nueva Venta'}
        </button>
      </div>

      {/* ── Nueva venta ───────────────────────────────────────────────────── */}
      {modo === 'nuevo' && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="text-base font-semibold text-gray-700 mb-4">Nueva Venta</div>

          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-1">Buscar cliente por CI / NIT</div>
            <div className="flex gap-2">
              <input type="text" value={nitBusqueda}
                onChange={(e) => setNitBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBuscarNit()}
                placeholder="Ingresa el CI o NIT..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleBuscarNit} disabled={buscando}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                {buscando ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {clienteEncontrado && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-green-800">{clienteEncontrado.nombreCompleto}</div>
                <div className="text-xs text-green-600">{'NIT: ' + (clienteEncontrado.nit || '—') + ' | Tel: ' + (clienteEncontrado.telefono || '—')}</div>
              </div>
              <button onClick={() => { setClienteEncontrado(null); setFormVenta((p) => ({ ...p, idCliente: '' })); setNitBusqueda('') }}
                className="text-xs text-red-400 hover:text-red-600">Cambiar</button>
            </div>
          )}

          {!clienteEncontrado && (
            <button onClick={() => setMostrarNuevoCliente(!mostrarNuevoCliente)}
              className="text-blue-600 text-xs hover:underline mb-4 block">
              {mostrarNuevoCliente ? 'Cancelar' : '+ Registrar nuevo cliente'}
            </button>
          )}

          {mostrarNuevoCliente && !clienteEncontrado && (
            <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="font-semibold text-blue-700 mb-3">Registrar Nuevo Cliente</div>
              <div className="grid grid-cols-3 gap-3">
                {[['Nombre','nombre'],['Paterno','paterno'],['Materno','materno'],['CI / NIT','nit'],['Teléfono','telefono'],['Correo','correo']].map(([lbl, key]) => (
                  <div key={key}>
                    <div className="text-sm text-gray-600 mb-1">{lbl}</div>
                    <input type="text" value={formCliente[key]}
                      onChange={(e) => setFormCliente({ ...formCliente, [key]: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
              </div>
              <button onClick={handleCrearCliente}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Guardar Cliente
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mt-2">
            <div>
              <div className="text-sm text-gray-600 mb-1">Fecha</div>
              <input type="date" value={formVenta.fechaVenta} readOnly
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Tipo de Pago</div>
              <select value={formVenta.tipoPago}
                onChange={(e) => setFormVenta({ ...formVenta, tipoPago: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="contado">Contado (efectivo)</option>
                <option value="qr">QR</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Glosa</div>
              <input type="text" value={formVenta.glosa}
                onChange={(e) => setFormVenta({ ...formVenta, glosa: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {mensaje && <div className="text-sm mt-3 text-red-500">{mensaje}</div>}

          <button onClick={handleCrearVenta} disabled={!formVenta.idCliente}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Crear Venta
          </button>
        </div>
      )}

      {/* ── Agregar artículos ──────────────────────────────────────────────── */}
      {modo === 'detalle' && ventaId && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-gray-700">{'Agregar artículos — Venta #' + ventaId}</div>
            <span className={
              tipoPagoActual === 'qr'
                ? 'text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold'
                : 'text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold'
            }>
              {tipoPagoActual === 'qr' ? 'Pago: QR' : 'Pago: Contado (efectivo)'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Artículo</div>
              <select value={formDetalle.idProducto} onChange={(e) => handleProductoChange(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Selecciona --</option>
                {dataProductos?.productos.map((p) => (
                  <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Almacén</div>
              {almacenesActuales.length > 1 ? (
                <select value={formDetalle.idAlmacen} onChange={(e) => handleAlmacenChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {almacenesActuales.map((pa) => (
                    <option key={pa.idAlmacen.idAlmacen} value={pa.idAlmacen.idAlmacen}>
                      {pa.idAlmacen.nombre + ' (stock: ' + parseFloat(pa.stock) + ')'}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="text" readOnly
                  value={almacenesActuales[0]?.idAlmacen?.nombre || (formDetalle.idProducto ? 'Sin stock' : '---')}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" />
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-gray-600">{etiquetaCantidad}</div>
                {formDetalle.idProducto && (
                  <div className={formDetalle.stockDisponible <= 5 ? 'text-xs font-semibold text-red-500' : 'text-xs font-semibold text-green-600'}>
                    {'Stock: ' + formDetalle.stockDisponible}
                  </div>
                )}
              </div>
              <input type="number" value={formDetalle.cantidad}
                onChange={(e) => setFormDetalle({ ...formDetalle, cantidad: e.target.value })}
                step={formDetalle.esEntero ? '1' : '0.01'} min="1"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Precio unitario</div>
              <input type="text" readOnly
                value={formDetalle.precioUni ? ('Bs. ' + parseFloat(formDetalle.precioUni).toFixed(2)) : '---'}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" />
            </div>
          </div>

          {formDetalle.idProducto && formDetalle.cantidad && formDetalle.precioUni && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700 font-medium">
                {'Subtotal: Bs. ' + (parseFloat(formDetalle.cantidad) * parseFloat(formDetalle.precioUni)).toFixed(2)}
              </div>
            </div>
          )}

          {/* Tabla de artículos agregados con botón eliminar */}
          {detallesLocales.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Artículos agregados:</div>
              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Artículo</th>
                    <th className="px-3 py-2 text-left">Almacén</th>
                    <th className="px-3 py-2 text-center">Cant.</th>
                    <th className="px-3 py-2 text-right">P.Unit.</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                    <th className="px-3 py-2 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detallesLocales.map((d) => (
                    <tr key={d.id}>
                      <td className="px-3 py-2">{d.nombreProducto}</td>
                      <td className="px-3 py-2 text-gray-500">{d.nombreAlmacen}</td>
                      <td className="px-3 py-2 text-center">{d.cantidad}</td>
                      <td className="px-3 py-2 text-right">{'Bs. ' + d.precioUni.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-medium text-green-700">{'Bs. ' + d.subtotal.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleEliminarDetalle(d)}
                          className="text-red-500 hover:text-red-700 text-xs">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan="4" className="px-3 py-2 text-right font-semibold text-gray-700">Total:</td>
                    <td className="px-3 py-2 text-right font-bold text-green-700">{'Bs. ' + montoLocal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {mensaje && (
            <div className={mensaje.includes('Error') || mensaje.includes('insuficiente') ? 'text-sm mt-3 text-red-500' : 'text-sm mt-3 text-green-600'}>
              {mensaje}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={handleAgregarDetalle}
              disabled={!formDetalle.idProducto || !formDetalle.cantidad || !formDetalle.idAlmacen}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
              + Agregar artículo
            </button>

            {tipoPagoActual === 'qr' ? (
              <button onClick={handleGenerarQR}
                disabled={detallesLocales.length === 0}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
                Generar QR y Pagar
              </button>
            ) : (
              <button onClick={handleConfirmarContado}
                disabled={detallesLocales.length === 0}
                className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50">
                Confirmar venta al contado
              </button>
            )}

            <button onClick={() => { resetModo(); refetch() }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
              Guardar y salir
            </button>
          </div>
        </div>
      )}

      {/* ── Lista de ventas ────────────────────────────────────────────────── */}
      {modo === 'lista' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Pago</th>
                <th className="px-4 py-3 text-left">Artículos</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.notasVenta.map((v) => (
                <tr key={v.idVenta} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{v.idVenta}</td>
                  <td className="px-4 py-3">{v.fechaVenta}</td>
                  <td className="px-4 py-3">{v.idCliente?.nombreCompleto || '---'}</td>
                  <td className="px-4 py-3 font-medium text-green-700">{'Bs. ' + parseFloat(v.montoTotal).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={
                      v.tipoPago === 'qr'
                        ? 'bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full'
                        : 'bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full'
                    }>
                      {v.tipoPago === 'contado' ? 'Contado' : v.tipoPago === 'qr' ? 'QR' : v.tipoPago}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {v.detalles.map((d) => (
                        <span key={d.idDetalleVenta} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          {d.idProducto?.nombre + ' x' + d.cantidad}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={
                      v.estado === 'activo'    ? 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700' :
                      v.estado === 'cancelado' ? 'px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700' :
                                                 'px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'
                    }>{v.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    {v.estado === 'activo' && (
                      <button onClick={() => handleCancelar(v.idVenta)}
                        className="text-red-500 hover:text-red-700 text-xs">
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}