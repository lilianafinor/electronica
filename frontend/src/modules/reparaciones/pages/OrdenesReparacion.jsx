import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_NOTAS_REPARACION, GET_EQUIPOS, GET_TIPOS_REPARACION } from '../graphql/queries'
import { GET_CLIENTES } from '../../ventas/graphql/queries'
import { CREAR_NOTA_REPARACION, ACTUALIZAR_ESTADO_REPARACION } from '../graphql/mutations'

export default function OrdenesReparacion() {
  const { data, loading, refetch } = useQuery(GET_NOTAS_REPARACION)
  const { data: dataEquipos }      = useQuery(GET_EQUIPOS)
  const { data: dataClientes }     = useQuery(GET_CLIENTES)
  const { data: dataTipos }        = useQuery(GET_TIPOS_REPARACION)
  const [crearNota]                = useMutation(CREAR_NOTA_REPARACION)
  const [actualizarEstado]         = useMutation(ACTUALIZAR_ESTADO_REPARACION)
  const [modo, setModo]            = useState('lista')
  const [mensaje, setMensaje]      = useState('')

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

  const [form, setForm] = useState({
    fallaReportada: '', idEquipo: '', idCliente: '', idTipoReparacion: ''
  })

  const ESTADOS = ['recibido', 'diagnostico', 'cotizado', 'aprobado', 'en_reparacion', 'listo', 'entregado', 'cancelado']

  const colorEstado = (estado) => {
    const colores = {
      recibido:      'bg-blue-100 text-blue-700',
      diagnostico:   'bg-yellow-100 text-yellow-700',
      cotizado:      'bg-purple-100 text-purple-700',
      aprobado:      'bg-indigo-100 text-indigo-700',
      en_reparacion: 'bg-orange-100 text-orange-700',
      listo:         'bg-green-100 text-green-700',
      entregado:     'bg-gray-100 text-gray-700',
      cancelado:     'bg-red-100 text-red-700',
    }
    return colores[estado] || 'bg-gray-100 text-gray-700'
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearNota({
        variables: {
          fallaReportada:    form.fallaReportada,
          idEquipo:          parseInt(form.idEquipo),
          idCliente:         parseInt(form.idCliente),
          idTipoReparacion:  form.idTipoReparacion ? parseInt(form.idTipoReparacion) : null,
          idUsuario:         parseInt(usuario?.idUsuario),
        }
      })
      if (res.crearNotaReparacion.ok) {
        setMensaje(res.crearNotaReparacion.mensaje)
        setForm({ fallaReportada: '', idEquipo: '', idCliente: '', idTipoReparacion: '' })
        setModo('lista')
        refetch()
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleCambiarEstado = async (idNotaReparacion, estado) => {
    try {
      await actualizarEstado({ variables: { idNotaReparacion: parseInt(idNotaReparacion), estado } })
      refetch()
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Órdenes de Reparación</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje('') }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' ? 'Ver lista' : '+ Nueva Orden'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <form onSubmit={handleCrear} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Nueva Orden de Reparación</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cliente</label>
              <select value={form.idCliente} onChange={(e) => setForm({ ...form, idCliente: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Selecciona --</option>
                {dataClientes?.clientes.map((c) => (
                  <option key={c.idCliente} value={c.idCliente}>{c.nombreCompleto}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Equipo</label>
              <select value={form.idEquipo} onChange={(e) => setForm({ ...form, idEquipo: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Selecciona --</option>
                {dataEquipos?.equipos.map((e) => (
                  <option key={e.idEquipo} value={e.idEquipo}>{e.nombre} — {e.modelo || 'sin modelo'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo de Reparación</label>
              <select value={form.idTipoReparacion} onChange={(e) => setForm({ ...form, idTipoReparacion: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Selecciona --</option>
                {dataTipos?.tiposReparacion.map((t) => (
                  <option key={t.idTipoReparacion} value={t.idTipoReparacion}>{t.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Falla Reportada por el Cliente</label>
              <textarea value={form.fallaReportada} onChange={(e) => setForm({ ...form, fallaReportada: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3" required />
            </div>
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Crear Orden
            </button>
            <button type="button" onClick={() => setModo('lista')} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {modo === 'lista' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Equipo</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Falla Reportada</th>
                <th className="px-4 py-3 text-left">Monto</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Cambiar Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.notasReparacion.map((n) => (
                <tr key={n.idNotaReparacion} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{n.idNotaReparacion}</td>
                  <td className="px-4 py-3">{n.fecha}</td>
                  <td className="px-4 py-3 font-medium">{n.idEquipo?.nombre} — {n.idEquipo?.modelo || '—'}</td>
                  <td className="px-4 py-3">{n.idCliente?.nombreCompleto || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{n.fallaReportada}</td>
                  <td className="px-4 py-3 font-medium text-green-700">Bs. {n.monto}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorEstado(n.estado)}`}>
                      {n.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={n.estado}
                      onChange={(e) => handleCambiarEstado(n.idNotaReparacion, e.target.value)}
                      className="border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ESTADOS.map((est) => (
                        <option key={est} value={est}>{est}</option>
                      ))}
                    </select>
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