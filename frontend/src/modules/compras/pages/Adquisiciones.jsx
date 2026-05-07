import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GET_ADQUISICIONES, GET_ORDENES_COMPRA } from '../graphql/queries'

export default function Adquisiciones() {
  const navigate = useNavigate()

  const { data, loading }     = useQuery(GET_ADQUISICIONES, { fetchPolicy: 'network-only' })
  const { data: dataOrdenes } = useQuery(GET_ORDENES_COMPRA, { fetchPolicy: 'network-only' })

  const [verDetalle, setVerDetalle] = useState(null)

  const ordenesAprobadas = (dataOrdenes?.ordenesCompra || []).filter(
    (o) => o.estado === 'aprobado'
  )

  if (loading) return <div className="p-4">Cargando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Adquisiciones</h2>
      </div>

      {/* ── Órdenes aprobadas pendientes ─────────────────────────────────── */}
      {ordenesAprobadas.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="font-semibold text-yellow-800 mb-3">
            {'Órdenes aprobadas pendientes de recibir (' + ordenesAprobadas.length + ')'}
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
                <>
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
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setVerDetalle(verDetalle === o.idOrden ? null : o.idOrden)}
                          className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-300"
                        >
                          {verDetalle === o.idOrden ? 'Ocultar' : 'Ver detalle'}
                        </button>
                        <button
                          onClick={() => navigate('/compras/notas', { state: { orden: o } })}
                          className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700"
                        >
                          Generar nota de compra
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Fila expandida */}
                  {verDetalle === o.idOrden && (
                    <tr key={o.idOrden + '-det'}>
                      <td colSpan="6" className="pb-3 pt-1 px-2">
                        <div className="bg-white border border-yellow-200 rounded-lg p-3">
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            {'Detalle de la orden #' + o.idOrden}
                          </div>
                          <table className="w-full text-sm">
                            <thead className="text-gray-500 text-xs uppercase border-b">
                              <tr>
                                <th className="pb-1 text-left">Artículo</th>
                                <th className="pb-1 text-center">Cantidad</th>
                                <th className="pb-1 text-right">Precio unit.</th>
                                <th className="pb-1 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {o.detalles.map((d) => (
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
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ordenesAprobadas.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-sm text-green-700">
          No hay órdenes aprobadas pendientes de recibir.
        </div>
      )}

      {/* ── Historial de adquisiciones ────────────────────────────────────── */}
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
                        {d.idProducto.nombre + ' (' + d.cantidad + ') → ' + d.idAlmacen.nombre}
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
    </div>
  )
}