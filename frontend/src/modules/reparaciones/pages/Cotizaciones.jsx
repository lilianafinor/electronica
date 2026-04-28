import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_COTIZACIONES, GET_DIAGNOSTICOS, GET_TIPOS_DETALLE } from '../graphql/queries'
import { GET_PRODUCTOS } from '../../inventario/graphql/queries'
import { CREAR_COTIZACION, AGREGAR_DETALLE_REPARACION, APROBAR_COTIZACION, ENTREGAR_EQUIPO } from '../graphql/mutations'

export default function Cotizaciones() {
  const { data, loading, refetch }  = useQuery(GET_COTIZACIONES)
  const { data: dataDiags }         = useQuery(GET_DIAGNOSTICOS)
  const { data: dataTipos }         = useQuery(GET_TIPOS_DETALLE)
  const { data: dataProductos }     = useQuery(GET_PRODUCTOS)
  const [crearCotizacion]           = useMutation(CREAR_COTIZACION)
  const [agregarDetalle]            = useMutation(AGREGAR_DETALLE_REPARACION)
  const [aprobarCotizacion]         = useMutation(APROBAR_COTIZACION)
  const [entregarEquipo]            = useMutation(ENTREGAR_EQUIPO)
  const [modo, setModo]             = useState('lista')
  const [cotSel, setCotSel]         = useState(null)
  const [mensaje, setMensaje]       = useState('')
  const hoy                         = new Date().toISOString().split('T')[0]

  const [formCot, setFormCot] = useState({ idDiagnostico: '', manoObra: '' })
  const [formDet, setFormDet] = useState({
    idTipoDetalle: '', descripcion: '', cantidad: '1',
    precioUnitario: '', idProducto: '', observaciones: ''
  })
  const [fechaEntrega, setFechaEntrega] = useState(hoy)

  const diagsSinCotizacion = dataDiags?.diagnosticos.filter(
    (d) => d.idNotaReparacion?.estado.toLowerCase() === 'diagnostico'
  ) || []

  const handleCrearCot = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearCotizacion({
        variables: {
          idDiagnostico: parseInt(formCot.idDiagnostico),
          manoObra:      formCot.manoObra,
        }
      })
      if (res.crearCotizacion.ok) {
        setMensaje(res.crearCotizacion.mensaje)
        setCotSel(res.crearCotizacion.cotizacion)
        setModo('detalle')
        refetch()
      } else {
        setMensaje(res.crearCotizacion.mensaje)
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleAgregarDetalle = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await agregarDetalle({
        variables: {
          idCotizacion:   parseInt(cotSel.idCotizacion),
          idTipoDetalle:  parseInt(formDet.idTipoDetalle),
          descripcion:    formDet.descripcion || null,
          cantidad:       formDet.cantidad,
          precioUnitario: formDet.precioUnitario,
          idProducto:     formDet.idProducto ? parseInt(formDet.idProducto) : null,
          observaciones:  formDet.observaciones || null,
        }
      })
      setMensaje(res.agregarDetalleReparacion.mensaje)
      if (res.agregarDetalleReparacion.ok) {
        setFormDet({ idTipoDetalle: '', descripcion: '', cantidad: '1', precioUnitario: '', idProducto: '', observaciones: '' })
        refetch()
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleAprobar = async (idCotizacion) => {
    try {
      const { data: res } = await aprobarCotizacion({ variables: { idCotizacion: parseInt(idCotizacion) } })
      setMensaje(res.aprobarCotizacion.mensaje)
      refetch()
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleEntregar = async (idNotaReparacion) => {
    try {
      const { data: res } = await entregarEquipo({
        variables: { idNotaReparacion: parseInt(idNotaReparacion), fechaEntrega: fechaEntrega }
      })
      setMensaje(res.entregarEquipo.mensaje)
      refetch()
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Cotizaciones de Reparación</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje(''); setCotSel(null) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' || modo === 'detalle' ? 'Ver lista' : '+ Nueva Cotización'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <form onSubmit={handleCrearCot} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Nueva Cotización</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Diagnóstico</label>
              <select value={formCot.idDiagnostico} onChange={(e) => setFormCot({ ...formCot, idDiagnostico: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Selecciona --</option>
                {diagsSinCotizacion.map((d) => (
                  <option key={d.idDiagnostico} value={d.idDiagnostico}>
                    #{d.idDiagnostico} — {d.idNotaReparacion?.idEquipo?.nombre} — {d.idNotaReparacion?.idCliente?.nombreCompleto}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Mano de Obra (Bs.)</label>
              <input type="text" value={formCot.manoObra} onChange={(e) => setFormCot({ ...formCot, manoObra: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <button type="submit" className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Crear Cotización
          </button>
        </form>
      )}

      {modo === 'detalle' && cotSel && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            Agregar detalles a Cotización #{cotSel.idCotizacion}
          </h3>
          <form onSubmit={handleAgregarDetalle}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tipo de Detalle</label>
                <select value={formDet.idTipoDetalle} onChange={(e) => setFormDet({ ...formDet, idTipoDetalle: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">-- Selecciona --</option>
                  {dataTipos?.tiposDetalle.map((t) => (
                    <option key={t.idTipo} value={t.idTipo}>{t.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Producto (opcional)</label>
                <select value={formDet.idProducto} onChange={(e) => setFormDet({ ...formDet, idProducto: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Sin producto --</option>
                  {dataProductos?.productos.map((p) => (
                    <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Descripción</label>
                <input type="text" value={formDet.descripcion} onChange={(e) => setFormDet({ ...formDet, descripcion: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cantidad</label>
                <input type="number" value={formDet.cantidad} onChange={(e) => setFormDet({ ...formDet, cantidad: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1" step="1" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Precio Unitario (Bs.)</label>
                <input type="text" value={formDet.precioUnitario} onChange={(e) => setFormDet({ ...formDet, precioUnitario: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Observaciones</label>
                <input type="text" value={formDet.observaciones} onChange={(e) => setFormDet({ ...formDet, observaciones: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
            <button type="submit" className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
              Agregar Detalle
            </button>
          </form>
        </div>
      )}

      {modo === 'lista' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Equipo</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Mano Obra</th>
                <th className="px-4 py-3 text-left">Repuestos</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Detalles</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.cotizaciones.map((c) => (
                <tr key={c.idCotizacion} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{c.idCotizacion}</td>
                  <td className="px-4 py-3 font-medium">{c.idDiagnostico?.idNotaReparacion?.idEquipo?.nombre}</td>
                  <td className="px-4 py-3">{c.idDiagnostico?.idNotaReparacion?.idCliente?.nombreCompleto}</td>
                  <td className="px-4 py-3">Bs. {c.manoObra}</td>
                  <td className="px-4 py-3">Bs. {c.costoRepuesto}</td>
                  <td className="px-4 py-3 font-bold text-green-700">Bs. {c.total}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.detalles.map((d) => (
                        <span key={d.idDetalleReparacion} className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                          {d.idTipoDetalle?.nombre}: {d.descripcion || d.idProducto?.nombre || '—'} ({d.cantidad}) Bs.{d.precioTotal}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                      c.estado === 'aprobada'  ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>{c.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {c.estado === 'pendiente' && (
                        <button onClick={() => handleAprobar(c.idCotizacion)}
                          className="text-green-500 hover:text-green-700 text-xs">
                          Aprobar
                        </button>
                      )}
                      {c.estado === 'aprobada' && (
                        <div className="flex items-center gap-1">
                          <input type="date" value={fechaEntrega}
                            onChange={(e) => setFechaEntrega(e.target.value)}
                            className="border rounded px-1 py-0.5 text-xs" />
                          <button
                            onClick={() => handleEntregar(c.idDiagnostico?.idNotaReparacion?.idNotaReparacion)}
                            className="text-blue-500 hover:text-blue-700 text-xs">
                            Entregar
                          </button>
                        </div>
                      )}
                    </div>
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