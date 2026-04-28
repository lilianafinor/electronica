import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_DIAGNOSTICOS, GET_NOTAS_REPARACION } from '../graphql/queries'
import { CREAR_DIAGNOSTICO } from '../graphql/mutations'

export default function Diagnosticos() {
  const { data, loading, refetch }  = useQuery(GET_DIAGNOSTICOS)
  const { data: dataNotas }         = useQuery(GET_NOTAS_REPARACION)
  const [crearDiagnostico]          = useMutation(CREAR_DIAGNOSTICO)
  const [modo, setModo]             = useState('lista')
  const [mensaje, setMensaje]       = useState('')

  const [form, setForm] = useState({
    idNotaReparacion: '', descripcion: '', causaRaiz: '', tiempoEstimadoHrs: ''
  })

  const handleCrear = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearDiagnostico({
        variables: {
          idNotaReparacion:  parseInt(form.idNotaReparacion),
          descripcion:       form.descripcion,
          causaRaiz:         form.causaRaiz || null,
          tiempoEstimadoHrs: form.tiempoEstimadoHrs || null,
        }
      })
      if (res.crearDiagnostico.ok) {
        setMensaje(res.crearDiagnostico.mensaje)
        setForm({ idNotaReparacion: '', descripcion: '', causaRaiz: '', tiempoEstimadoHrs: '' })
        setModo('lista')
        refetch()
      } else {
        setMensaje(res.crearDiagnostico.mensaje)
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

const notasSinDiagnostico = dataNotas?.notasReparacion.filter(
    (n) => n.estado.toLowerCase() === 'recibido'
  ) || []
  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Diagnósticos</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje('') }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' ? 'Ver lista' : '+ Nuevo Diagnóstico'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <form onSubmit={handleCrear} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Nuevo Diagnóstico</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Orden de Reparación</label>
              <select value={form.idNotaReparacion} onChange={(e) => setForm({ ...form, idNotaReparacion: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Selecciona --</option>
                {notasSinDiagnostico.map((n) => (
                  <option key={n.idNotaReparacion} value={n.idNotaReparacion}>
                    #{n.idNotaReparacion} — {n.idEquipo?.nombre} — {n.idCliente?.nombreCompleto}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tiempo Estimado (hrs)</label>
              <input type="number" value={form.tiempoEstimadoHrs}
                onChange={(e) => setForm({ ...form, tiempoEstimadoHrs: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.5" min="0" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Descripción del Diagnóstico</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Causa Raíz</label>
              <textarea value={form.causaRaiz} onChange={(e) => setForm({ ...form, causaRaiz: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2" />
            </div>
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Guardar Diagnóstico
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
                <th className="px-4 py-3 text-left">Orden</th>
                <th className="px-4 py-3 text-left">Equipo</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-left">Causa Raíz</th>
                <th className="px-4 py-3 text-left">Tiempo Est. (hrs)</th>
                <th className="px-4 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.diagnosticos.map((d) => (
                <tr key={d.idDiagnostico} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{d.idDiagnostico}</td>
                  <td className="px-4 py-3">#{d.idNotaReparacion?.idNotaReparacion}</td>
                  <td className="px-4 py-3">{d.idNotaReparacion?.idEquipo?.nombre}</td>
                  <td className="px-4 py-3">{d.idNotaReparacion?.idCliente?.nombreCompleto}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{d.descripcion}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{d.causaRaiz || '—'}</td>
                  <td className="px-4 py-3">{d.tiempoEstimadoHrs || '—'}</td>
                  <td className="px-4 py-3">{d.fechaDiagnostico}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}