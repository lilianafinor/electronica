import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_EQUIPOS } from '../graphql/queries'
import { GET_CLIENTES } from '../../ventas/graphql/queries'
import { CREAR_EQUIPO } from '../graphql/mutations'

export default function Equipos() {
  const { data, loading, refetch } = useQuery(GET_EQUIPOS)
  const { data: dataClientes }     = useQuery(GET_CLIENTES)
  const [crearEquipo]              = useMutation(CREAR_EQUIPO)
  const [modo, setModo]            = useState('lista')
  const [mensaje, setMensaje]      = useState('')

  const [form, setForm] = useState({
    nombre: '', modelo: '', descripcion: '',
    tipoEquipo: '', serieImei: '', idCliente: ''
  })

  const handleCrear = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearEquipo({
        variables: {
          nombre:      form.nombre,
          idCliente:   parseInt(form.idCliente),
          modelo:      form.modelo || null,
          descripcion: form.descripcion || null,
          tipoEquipo:  form.tipoEquipo || null,
          serieImei:   form.serieImei || null,
        }
      })
      if (res.crearEquipo.ok) {
        setMensaje(res.crearEquipo.mensaje)
        setForm({ nombre: '', modelo: '', descripcion: '', tipoEquipo: '', serieImei: '', idCliente: '' })
        setModo('lista')
        refetch()
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recepción de Equipos</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje('') }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' ? 'Ver lista' : '+ Registrar Equipo'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <form onSubmit={handleCrear} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Registrar Equipo</h3>
          <div className="grid grid-cols-3 gap-4">
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
            {[
              { label: 'Nombre del Equipo', key: 'nombre',      req: true },
              { label: 'Modelo',            key: 'modelo',      req: false },
              { label: 'Tipo de Equipo',    key: 'tipoEquipo',  req: false },
              { label: 'Serie / IMEI',      key: 'serieImei',   req: false },
              { label: 'Descripción',       key: 'descripcion', req: false },
            ].map(({ label, key, req }) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input type="text" value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={req} />
              </div>
            ))}
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Registrar
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
                <th className="px-4 py-3 text-left">Equipo</th>
                <th className="px-4 py-3 text-left">Modelo</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Serie/IMEI</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Fecha Ingreso</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.equipos.map((e) => (
                <tr key={e.idEquipo} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{e.idEquipo}</td>
                  <td className="px-4 py-3 font-medium">{e.nombre}</td>
                  <td className="px-4 py-3">{e.modelo || '—'}</td>
                  <td className="px-4 py-3">{e.tipoEquipo || '—'}</td>
                  <td className="px-4 py-3">{e.serieImei || '—'}</td>
                  <td className="px-4 py-3">{e.idCliente?.nombreCompleto || '—'}</td>
                  <td className="px-4 py-3">{e.fechaIngreso}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      e.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{e.estado}</span>
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