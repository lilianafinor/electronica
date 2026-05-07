import { useQuery, useMutation } from '@apollo/client'
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GET_NOTAS_COMPRA, GET_PROVEEDORES_POR_ARTICULO } from '../graphql/queries'
import { GET_PRODUCTOS, GET_ALMACENES } from '../../inventario/graphql/queries'
import {
  CREAR_NOTA_COMPRA,
  AGREGAR_DETALLE_NOTA_COMPRA,
  ACTUALIZAR_ESTADO_ORDEN,
  CREAR_ADQUISICION,
  AGREGAR_DETALLE_ADQUISICION,
} from '../graphql/mutations'
import {
  CREAR_NOTA_INGRESO,
  AGREGAR_DETALLE_INGRESO,
} from '../../inventario/graphql/mutations'

export default function NotasCompra() {
  const location = useLocation()
  const navigate = useNavigate()

  const ordenDesdeAdq = location.state?.orden || null

  const { data, loading, refetch } = useQuery(GET_NOTAS_COMPRA, { fetchPolicy: 'network-only' })
  const { data: dataProductos }    = useQuery(GET_PRODUCTOS, { fetchPolicy: 'network-only' })
  const { data: dataAlmacenes }    = useQuery(GET_ALMACENES, { fetchPolicy: 'network-only' })

  const [crearNota]             = useMutation(CREAR_NOTA_COMPRA)
  const [agregarDetalle]        = useMutation(AGREGAR_DETALLE_NOTA_COMPRA)
  const [actualizarEstadoOrden] = useMutation(ACTUALIZAR_ESTADO_ORDEN)
  const [crearAdq]              = useMutation(CREAR_ADQUISICION)
  const [agregarDetAdq]         = useMutation(AGREGAR_DETALLE_ADQUISICION)
  const [crearNotaIngreso]      = useMutation(CREAR_NOTA_INGRESO)
  const [agregarDetIngreso]     = useMutation(AGREGAR_DETALLE_INGRESO)

  const [modo, setModo]             = useState('lista')
  const [mensaje, setMensaje]       = useState('')
  const [procesando, setProcesando] = useState(false)

  const [formOrden, setFormOrden] = useState({
    nroTransaccion: '',
    tipoPago:       'contado',
    idAlmacen:      '',
    glosa:          '',
  })

  // Estado para nota manual
  const [notaSel, setNotaSel]                 = useState(null)
  const [detallesLocales, setDetallesLocales] = useState([])
  const [totalLocal, setTotalLocal]           = useState(0)
  const [busquedaArticulo, setBusquedaArticulo] = useState('')
  const [articuloSel, setArticuloSel]         = useState(null)
  const [proveedorSel, setProveedorSel]       = useState(null)
  const [cantidad, setCantidad]               = useState('')
  const [formNota, setFormNota]               = useState({
    fechaCompra: new Date().toISOString().split('T')[0],
    nroTransaccion: '', glosa: '', tipoPago: 'contado',
  })

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
  const hoy     = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (ordenDesdeAdq) setModo('desde-orden')
  }, [ordenDesdeAdq])

  const articulosFiltrados = busquedaArticulo.trim().length >= 2
    ? (dataProductos?.productos || []).filter((p) =>
        p.nombre.toLowerCase().includes(busquedaArticulo.toLowerCase())
      )
    : []

  // ── Confirmar nota desde orden ────────────────────────────────────────────
  const handleConfirmarDesdeOrden = async () => {
    if (!formOrden.idAlmacen) { setMensaje('Debes seleccionar un almacén destino'); return }
    setProcesando(true)
    setMensaje('')
    try {
      const orden = ordenDesdeAdq

      // 1. Crear nota de compra
      const { data: resNota } = await crearNota({
        variables: {
          fechaCompra: hoy,
          idProveedor: parseInt(orden.idProveedor.idProveedor),
          nroFactura:  formOrden.nroTransaccion || null,
          glosa:       formOrden.glosa || ('Nota de compra — Orden #' + orden.idOrden),
          tipoPago:    formOrden.tipoPago,
          idUsuario:   parseInt(usuario?.idUsuario),
        }
      })
      if (!resNota.crearNotaCompra.ok) {
        setMensaje('Error al crear nota de compra'); setProcesando(false); return
      }
      const idCompra = resNota.crearNotaCompra.notaCompra.idCompra

      // 2. Agregar detalles a la nota de compra
      for (const detalle of orden.detalles) {
        await agregarDetalle({
          variables: {
            idCompra:   parseInt(idCompra),
            idProducto: parseInt(detalle.idProducto.idProducto),
            cantidad:   String(detalle.cantidad),
            precioUni:  String(detalle.precioUni),
          }
        })
      }

      // 3. Crear adquisición vinculada a la orden
      const { data: resAdq } = await crearAdq({
        variables: {
          fecha:       hoy,
          idProveedor: parseInt(orden.idProveedor.idProveedor),
          idOrden:     parseInt(orden.idOrden),
          glosa:       'Recepción automática — Nota #' + idCompra,
          idUsuario:   parseInt(usuario?.idUsuario),
        }
      })
      if (!resAdq.crearAdquisicion.ok) {
        setMensaje('Nota creada pero error al registrar adquisición'); setProcesando(false); return
      }
      const idAdquisicion = resAdq.crearAdquisicion.adquisicion.idAdquisicion

      // 4. Agregar detalles a la adquisición (actualiza stock en ProductoAlmacen)
      for (const detalle of orden.detalles) {
        await agregarDetAdq({
          variables: {
            idAdquisicion: parseInt(idAdquisicion),
            idProducto:    parseInt(detalle.idProducto.idProducto),
            idAlmacen:     parseInt(formOrden.idAlmacen),
            cantidad:      String(detalle.cantidad),
            precioUni:     String(detalle.precioUni),
          }
        })
      }

      // 5. Crear nota de ingreso por motivo compra
      const { data: resIngreso } = await crearNotaIngreso({
        variables: {
          fecha:     hoy,
          glosa:     'Ingreso por compra — Nota #' + idCompra + ' / Orden #' + orden.idOrden,
          motivo:    'compra',
          idUsuario: parseInt(usuario?.idUsuario),
        }
      })

      if (resIngreso.crearNotaIngreso.ok) {
        const idIngreso = resIngreso.crearNotaIngreso.notaIngreso.idIngreso

        // 6. Agregar detalles al ingreso (uno por cada artículo)
        for (const detalle of orden.detalles) {
          await agregarDetIngreso({
            variables: {
              idIngreso:   parseInt(idIngreso),
              idProducto:  parseInt(detalle.idProducto.idProducto),
              idAlmacen:   parseInt(formOrden.idAlmacen),
              cantidad:    String(detalle.cantidad),
              observacion: 'Ingreso por compra — Orden #' + orden.idOrden,
            }
          })
        }
      }

      // 7. Marcar orden como recibida
      await actualizarEstadoOrden({
        variables: { idOrden: parseInt(orden.idOrden), estado: 'recibido' }
      })

      setMensaje('✓ Nota de compra generada, ingreso registrado y stock actualizado.')
      refetch()

      setTimeout(() => {
        navigate('/compras/notas', { replace: true, state: {} })
        setModo('lista')
        setMensaje('')
      }, 2000)

    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
    setProcesando(false)
  }

  // ── Crear nota manual ─────────────────────────────────────────────────────
  const handleCrearNotaManual = async () => {
    if (!proveedorSel) { setMensaje('Debes seleccionar un proveedor'); return }
    try {
      const { data: res } = await crearNota({
        variables: {
          fechaCompra: formNota.fechaCompra,
          idProveedor: parseInt(proveedorSel.idProveedor.idProveedor),
          nroFactura:  formNota.nroTransaccion || null,
          glosa:       formNota.glosa || null,
          tipoPago:    formNota.tipoPago,
          idUsuario:   parseInt(usuario?.idUsuario),
        }
      })
      if (res.crearNotaCompra.ok) {
        setNotaSel(res.crearNotaCompra.notaCompra)
        setModo('detalle-manual')
        setMensaje('')
        refetch()
      } else { setMensaje('Error al crear nota') }
    } catch (err) { setMensaje('Error: ' + err.message) }
  }

  const handleAgregarDetalleManual = async () => {
    if (!articuloSel || !proveedorSel || !cantidad) {
      setMensaje('Selecciona artículo, proveedor y cantidad'); return
    }
    try {
      const { data: res } = await agregarDetalle({
        variables: {
          idCompra:   parseInt(notaSel.idCompra),
          idProducto: parseInt(articuloSel.idProducto),
          cantidad:   String(cantidad),
          precioUni:  String(proveedorSel.precioUnitario),
        }
      })
      if (res.agregarDetalleNotaCompra.ok) {
        const cant   = parseFloat(cantidad)
        const precio = parseFloat(proveedorSel.precioUnitario)
        setDetallesLocales((prev) => [...prev, {
          id: Date.now(), nombreProducto: articuloSel.nombre,
          nombreProveedor: proveedorSel.idProveedor?.nombre,
          cantidad: cant, precioUni: precio, subtotal: cant * precio,
        }])
        setTotalLocal((prev) => prev + cant * precio)
        setBusquedaArticulo(''); setArticuloSel(null)
        setProveedorSel(null); setCantidad('')
        setMensaje('Artículo agregado correctamente')
        refetch()
      } else { setMensaje('Error al agregar artículo') }
    } catch (err) { setMensaje('Error: ' + err.message) }
  }

  const resetManual = () => {
    setModo('lista'); setNotaSel(null); setDetallesLocales([]); setTotalLocal(0)
    setBusquedaArticulo(''); setArticuloSel(null)
    setProveedorSel(null); setCantidad(''); setMensaje('')
    setFormNota({ fechaCompra: hoy, nroTransaccion: '', glosa: '', tipoPago: 'contado' })
  }

  if (loading) return <div className="p-4">Cargando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Notas de Compra</h2>
        {modo === 'lista' ? (
          <button onClick={() => setModo('nuevo-manual')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Nueva Nota
          </button>
        ) : (
          <button onClick={() => { resetManual(); navigate('/compras/notas', { replace: true, state: {} }) }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
            Ver lista
          </button>
        )}
      </div>

      {/* ── MODO: desde orden ─────────────────────────────────────────────── */}
      {modo === 'desde-orden' && ordenDesdeAdq && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="font-semibold text-blue-800 mb-1">
              {'Generando nota de compra para Orden #' + ordenDesdeAdq.idOrden}
            </div>
            <div className="text-sm text-blue-600">
              {'Proveedor: ' + ordenDesdeAdq.idProveedor?.nombre +
               ' · Total: Bs. ' + parseFloat(ordenDesdeAdq.total || 0).toFixed(2)}
            </div>
          </div>

          {/* Artículos (solo lectura) */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Artículos a recibir</div>
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Artículo</th>
                  <th className="px-3 py-2 text-center">Cantidad</th>
                  <th className="px-3 py-2 text-right">Precio unit.</th>
                  <th className="px-3 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordenDesdeAdq.detalles.map((d) => (
                  <tr key={d.idDetalleOrden}>
                    <td className="px-3 py-2">{d.idProducto.nombre}</td>
                    <td className="px-3 py-2 text-center">{d.cantidad}</td>
                    <td className="px-3 py-2 text-right">{'Bs. ' + parseFloat(d.precioUni).toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-medium text-green-700">{'Bs. ' + parseFloat(d.subTotal).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan="3" className="px-3 py-2 text-right font-semibold text-gray-700">Total:</td>
                  <td className="px-3 py-2 text-right font-bold text-green-700">
                    {'Bs. ' + parseFloat(ordenDesdeAdq.total || 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Formulario */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Nro. de transacción</div>
              <input type="text"
                value={formOrden.nroTransaccion}
                onChange={(e) => setFormOrden({ ...formOrden, nroTransaccion: e.target.value })}
                placeholder="Opcional"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Tipo de pago</div>
              <select
                value={formOrden.tipoPago}
                onChange={(e) => setFormOrden({ ...formOrden, tipoPago: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="contado">Contado</option>
                <option value="credito">Crédito</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Almacén destino</div>
              <select
                value={formOrden.idAlmacen}
                onChange={(e) => setFormOrden({ ...formOrden, idAlmacen: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Selecciona almacén --</option>
                {dataAlmacenes?.almacenes.map((a) => (
                  <option key={a.idAlmacen} value={a.idAlmacen}>{a.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Glosa</div>
              <input type="text"
                value={formOrden.glosa}
                onChange={(e) => setFormOrden({ ...formOrden, glosa: e.target.value })}
                placeholder="Opcional"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {mensaje && (
            <div className={mensaje.includes('Error') ? 'text-sm mb-3 text-red-500' : 'text-sm mb-3 text-green-600'}>
              {mensaje}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleConfirmarDesdeOrden}
              disabled={procesando || !formOrden.idAlmacen}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
              {procesando ? 'Procesando...' : 'Confirmar compra y agregar stock'}
            </button>
            <button
              onClick={() => navigate('/compras/adquisiciones')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── MODO: nueva nota manual ───────────────────────────────────────── */}
      {(modo === 'nuevo-manual' || modo === 'detalle-manual') && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="font-semibold text-gray-700 mb-4">Nueva Nota de Compra</div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Fecha</div>
              <input type="date" value={formNota.fechaCompra}
                onChange={(e) => setFormNota({ ...formNota, fechaCompra: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Nro. de transacción</div>
              <input type="text" value={formNota.nroTransaccion}
                onChange={(e) => setFormNota({ ...formNota, nroTransaccion: e.target.value })}
                placeholder="Opcional"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Tipo de Pago</div>
              <select value={formNota.tipoPago}
                onChange={(e) => setFormNota({ ...formNota, tipoPago: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="contado">Contado</option>
                <option value="credito">Crédito</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Glosa</div>
              <input type="text" value={formNota.glosa}
                onChange={(e) => setFormNota({ ...formNota, glosa: e.target.value })}
                placeholder="Opcional"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="font-medium text-gray-700 mb-3">Buscar artículo a comprar</div>
            <div className="relative">
              <input type="text" value={busquedaArticulo}
                onChange={(e) => { setBusquedaArticulo(e.target.value); setArticuloSel(null); setProveedorSel(null) }}
                placeholder="Escribe el nombre del artículo..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {articulosFiltrados.length > 0 && !articuloSel && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {articulosFiltrados.map((p) => (
                    <button key={p.idProducto}
                      onClick={() => { setArticuloSel(p); setBusquedaArticulo(p.nombre); setProveedorSel(null) }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0">
                      <div className="font-medium text-gray-800">{p.nombre}</div>
                      <div className="text-xs text-gray-500">{(p.idMarca?.nombre || '') + ' · ' + (p.idCategoria?.nombre || '')}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {articuloSel && proveedorSel && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-green-800">{'Proveedor: ' + proveedorSel.idProveedor?.nombre}</div>
                    <div className="text-xs text-green-600">{'Precio: Bs. ' + parseFloat(proveedorSel.precioUnitario).toFixed(2)}</div>
                  </div>
                  <button onClick={() => setProveedorSel(null)} className="text-xs text-red-400 hover:text-red-600">Cambiar</button>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Cantidad</div>
                    <input type="number" value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      min="1" placeholder="0"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Precio unitario</div>
                    <input type="text" readOnly
                      value={'Bs. ' + parseFloat(proveedorSel.precioUnitario).toFixed(2)}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" />
                  </div>
                  {cantidad && (
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">Subtotal</div>
                      <input type="text" readOnly
                        value={'Bs. ' + (parseFloat(cantidad) * parseFloat(proveedorSel.precioUnitario)).toFixed(2)}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {detallesLocales.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Artículos en esta nota:</div>
              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Artículo</th>
                    <th className="px-3 py-2 text-left">Proveedor</th>
                    <th className="px-3 py-2 text-center">Cant.</th>
                    <th className="px-3 py-2 text-right">P. Unit.</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detallesLocales.map((d) => (
                    <tr key={d.id}>
                      <td className="px-3 py-2">{d.nombreProducto}</td>
                      <td className="px-3 py-2 text-gray-500">{d.nombreProveedor}</td>
                      <td className="px-3 py-2 text-center">{d.cantidad}</td>
                      <td className="px-3 py-2 text-right">{'Bs. ' + d.precioUni.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-medium text-green-700">{'Bs. ' + d.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan="4" className="px-3 py-2 text-right font-semibold text-gray-700">Total:</td>
                    <td className="px-3 py-2 text-right font-bold text-green-700">{'Bs. ' + totalLocal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {mensaje && (
            <div className={mensaje.includes('Error') ? 'text-sm mt-3 text-red-500' : 'text-sm mt-3 text-green-600'}>
              {mensaje}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {modo === 'nuevo-manual' && proveedorSel && cantidad && (
              <button onClick={handleCrearNotaManual}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Crear Nota y Agregar Artículo
              </button>
            )}
            {modo === 'detalle-manual' && proveedorSel && cantidad && (
              <button onClick={handleAgregarDetalleManual}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                + Agregar artículo
              </button>
            )}
            {notaSel && (
              <button onClick={resetManual}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
                Finalizar nota
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Lista de notas ────────────────────────────────────────────────── */}
      {modo === 'lista' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Proveedor</th>
                <th className="px-4 py-3 text-left">Nro. Transacción</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Tipo Pago</th>
                <th className="px-4 py-3 text-left">Artículos</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.notasCompra.map((n) => (
                <tr key={n.idCompra} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{n.idCompra}</td>
                  <td className="px-4 py-3">{n.fechaCompra}</td>
                  <td className="px-4 py-3">{n.idProveedor?.nombre || '—'}</td>
                  <td className="px-4 py-3">{n.nroFactura || '—'}</td>
                  <td className="px-4 py-3 font-medium text-green-700">{'Bs. ' + parseFloat(n.totalCompra).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{n.tipoPago}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {n.detalles.map((d) => (
                        <span key={d.idDetalleCompra} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          {d.idProducto.nombre + ' (' + d.cantidad + ')'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={n.estado === 'activo'
                      ? 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'
                      : 'px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'
                    }>{n.estado}</span>
                  </td>
                </tr>
              ))}
              {(!data?.notasCompra || data.notasCompra.length === 0) && (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-400 text-sm">
                    No hay notas de compra registradas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}