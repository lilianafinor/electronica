import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_ADQUISICIONES, GET_ORDENES_COMPRA } from '../graphql/queries'
import { GET_ALMACENES } from '../../inventario/graphql/queries'
import { CREAR_ADQUISICION, AGREGAR_DETALLE_ADQUISICION } from '../graphql/mutations'

export default function Adquisiciones() {
  const { data, loading, refetch }  = useQuery(GET_ADQUISICIONES, { fetchPolicy: 'network-only' })
  const { data: dataOrdenes, refetch: refetchOrdenes } = useQuery(GET_ORDENES_COMPRA, { fetchPolicy: 'network-only' })
  const { data: dataAlmacenes }     = useQuery(GET_ALMACENES, { fetchPolicy: 'network-only' })
  const [crearAdq]                  = useMutation(CREAR_ADQUISICION)
  const [agregarDetalle]            = useMutation(AGREGAR_DETALLE_ADQUISICION)

  const [modo, setModo]             = useState('lista')
  const [ordenActual, setOrdenActual] = useState(null)
  const [adqCreada, setAdqCreada]   = useState(null)
  const [idAlmacen, setIdAlmacen]   = useState('')
  const [mensaje, setMensaje]       = useState('')
  const [procesando, setProcesando] = useState(false)
  const [detallesRecibidos, setDetallesRecibidos] = useState([])

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
  const hoy     = new Date().toISOString().split('T')[0]

  // Órdenes aprobadas que aún no tienen adquisición
  const ordenesAprobadas = (dataOrdenes?.ordenesCompra || []).filter(
    (o) => o.estado === 'aprobado'
  )

  // ── Iniciar recepción desde una orden aprobada ────────────────────────────
  const handleIniciarRecepcion = (orden) => {
    setOrdenActual(orden)
    setAdqCreada(null)
    setIdAlmacen('')
    setMensaje('')
    setDetallesRecibidos([])
    setModo('recibir')
  }

  // ── Confirmar recepción → crear adquisición y agregar detalles ────────────
  const handleConfirmarRecepcion = async () => {
    if (!idAlmacen) { setMensaje('Debes seleccionar un almacén destino'); return }
    setProcesando(true)
    setMensaje('')
    try {
      // 1. Crear la adquisición
      const { data: resAdq } = await crearAdq({
        variables: {
          fecha:       hoy,
          idProveedor: parseInt(ordenActual.idProveedor.idProveedor),
          idOrden:     parseInt(ordenActual.idOrden),
          glosa:       'Recepción de Orden #' + ordenActual.idOrden,
          idUsuario:   parseInt(usuario?.idUsuario),
        }
      })

      if (!resAdq.crearAdquisicion.ok) {
        setMensaje('Error al crear adquisición')
        setProcesando(false)
        return
      }

      const adq = resAdq.crearAdquisicion.adquisicion
      setAdqCreada(adq)

      // 2. Agregar cada detalle de la orden
      const recibidos = []
      for (const detalle of ordenActual.detalles) {
        const { data: resDet } = await agregarDetalle({
          variables: {
            idAdquisicion: parseInt(adq.idAdquisicion),
            idProducto:    parseInt(detalle.idProducto.idProducto || detalle.idProducto),
            idAlmacen:     parseInt(idAlmacen),
            cantidad:      String(detalle.cantidad),
            precioUni:     String(detalle.precioUni),
          }
        })
        recibidos.push({
          nombre:    detalle.idProducto.nombre,
          cantidad:  detalle.cantidad,
          precioUni: detalle.precioUni,
          subtotal:  detalle.subTotal,
          ok:        resDet.agregarDetalleAdquisicion.ok,
          mensaje:   resDet.agregarDetalleAdquisicion.mensaje,
        })
      }

      setDetallesRecibidos(recibidos)
      const todoOk = recibidos.every((d) => d.ok)
      setMensaje(todoOk
        ? 'Recepcion completada. Stock actualizado correctamente.'
        : 'Algunos articulos tuvieron problemas. Revisa el detalle.'
      )
      refetch()
      refetchOrdenes()
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
    setProcesando(false)
  }

  if (loading) return <div className="p-4">Cargando...</div>

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Adquisiciones</h2>
        {modo !== 'lista' && (
          <button
            onClick={() => { setModo('lista'); setOrdenActual(null); setAdqCreada(null); setMensaje('') }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
          >
            Ver lista
          </button>
        )}
      </div>

      {/* ── Órdenes aprobadas pendientes de recibir ────────────────────────── */}
      {modo === 'lista' && ordenesAprobadas.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="font-semibold text-yellow-800 mb-3">
            {'Ordenes aprobadas pendientes de recibir (' + ordenesAprobadas.length + ')'}
          </div>
          <table className="w-full text-sm">
            <thead className="text-gray-600 text-xs uppercase border-b border-yellow-200">
              <tr>
                <th className="pb-2 text-left">Orden</th>
                <th className="pb-2 text-left">Proveedor</th>
                <th className="pb-2 text-left">Fecha</th>
                <th className="pb-2 text-left">Artículos</th>
                <th className="pb-2 text-right">Total</th>
                <th className="pb-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-100">
              {ordenesAprobadas.map((o) => (
                <tr key={o.idOrden}>
                  <td className="py-2 font-medium">{'#' + o.idOrden}</td>
                  <td className="py-2">{o.idProveedor?.nombre}</td>
                  <td className="py-2">{o.fecha}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {o.detalles.map((d) => (
                        <span key={d.idDetalleOrden} className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                          {d.idProducto.nombre + ' x' + d.cantidad}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 text-right font-semibold text-green-700">
                    {'Bs. ' + parseFloat(o.total || 0).toFixed(2)}
                  </td>
                  <td className="py-2 text-center">
                    <button
                      onClick={() => handleIniciarRecepcion(o)}
                      className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700"
                    >
                      Recibir mercadería
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Formulario recepción ───────────────────────────────────────────── */}
      {modo === 'recibir' && ordenActual && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="font-semibold text-gray-700 mb-4">
            {'Recibir mercadería — Orden #' + ordenActual.idOrden}
          </div>

          {/* Resumen de la orden */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-xs text-gray-500 uppercase">Proveedor</div>
                <div className="text-sm font-semibold text-gray-800">{ordenActual.idProveedor?.nombre}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Fecha orden</div>
                <div className="text-sm text-gray-700">{ordenActual.fecha}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Total orden</div>
                <div className="text-sm font-semibold text-green-700">{'Bs. ' + parseFloat(ordenActual.total || 0).toFixed(2)}</div>
              </div>
            </div>

            {/* Artículos de la orden */}
            <div className="text-xs text-gray-500 uppercase mb-2">Artículos a recibir</div>
            <table className="w-full text-sm">
              <thead className="text-gray-600 text-xs uppercase border-b">
                <tr>
                  <th className="pb-1 text-left">Artículo</th>
                  <th className="pb-1 text-center">Cantidad</th>
                  <th className="pb-1 text-right">Precio Unit.</th>
                  <th className="pb-1 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordenActual.detalles.map((d) => (
                  <tr key={d.idDetalleOrden}>
                    <td className="py-1.5">{d.idProducto.nombre}</td>
                    <td className="py-1.5 text-center">{d.cantidad}</td>
                    <td className="py-1.5 text-right">{'Bs. ' + parseFloat(d.precioUni).toFixed(2)}</td>
                    <td className="py-1.5 text-right font-medium text-green-700">{'Bs. ' + parseFloat(d.subTotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selección de almacén */}
          {!adqCreada && (
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Selecciona el almacén destino</div>
              <select
                value={idAlmacen}
                onChange={(e) => setIdAlmacen(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Selecciona almacén --</option>
                {dataAlmacenes?.almacenes.map((a) => (
                  <option key={a.idAlmacen} value={a.idAlmacen}>{a.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Resultado de la recepción */}
          {detallesRecibidos.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Resultado de la recepción:</div>
              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Artículo</th>
                    <th className="px-3 py-2 text-center">Cantidad</th>
                    <th className="px-3 py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detallesRecibidos.map((d, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{d.nombre}</td>
                      <td className="px-3 py-2 text-center">{d.cantidad}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={d.ok
                          ? 'px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700'
                          : 'px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700'
                        }>
                          {d.ok ? 'Stock actualizado' : d.mensaje}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {mensaje && (
            <div className={mensaje.includes('Error') || mensaje.includes('problemas')
              ? 'text-sm mb-3 text-red-500'
              : 'text-sm mb-3 text-green-600'
            }>
              {mensaje}
            </div>
          )}

          <div className="flex gap-2">
            {!adqCreada && (
              <button
                onClick={handleConfirmarRecepcion}
                disabled={procesando || !idAlmacen}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {procesando ? 'Procesando...' : 'Confirmar recepción y actualizar stock'}
              </button>
            )}
            {adqCreada && (
              <button
                onClick={() => { setModo('lista'); setOrdenActual(null); setAdqCreada(null) }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Volver a la lista
              </button>
            )}
            {!adqCreada && (
              <button
                onClick={() => { setModo('lista'); setOrdenActual(null) }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Lista de adquisiciones ────────────────────────────────────────── */}
      {modo === 'lista' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="font-semibold text-gray-700">Historial de recepciones</div>
            <div className="text-xs text-gray-400">Adquisiciones confirmadas y stock actualizado</div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Proveedor</th>
                <th className="px-4 py-3 text-left">Orden</th>
                <th className="px-4 py-3 text-left">Artículos recibidos</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.adquisiciones.map((a) => (
                <tr key={a.idAdquisicion} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{a.idAdquisicion}</td>
                  <td className="px-4 py-3">{a.fecha}</td>
                  <td className="px-4 py-3">{a.idProveedor?.nombre || '—'}</td>
                  <td className="px-4 py-3">{a.idOrden ? '#' + a.idOrden.idOrden : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {a.detalles.map((d) => (
                        <span key={d.idDetalleAdq} className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                          {d.idProducto.nombre + ' (' + d.cantidad + ') -> ' + d.idAlmacen.nombre}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={a.estado === 'activo'
                      ? 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'
                      : 'px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'
                    }>{a.estado}</span>
                  </td>
                </tr>
              ))}
              {(!data?.adquisiciones || data.adquisiciones.length === 0) && (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-400 text-sm">
                    No hay adquisiciones registradas aún.
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