import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_CLIENTES } from '../graphql/queries'
import { CREAR_CLIENTE, ACTUALIZAR_CLIENTE } from '../graphql/mutations'

export default function Clientes() {
  const { data, loading, refetch } = useQuery(GET_CLIENTES)
  const [crearCliente]             = useMutation(CREAR_CLIENTE)
  const [actualizarCliente]        = useMutation(ACTUALIZAR_CLIENTE)
  const [modo, setModo]            = useState('lista')
  const [clienteSel, setClienteSel] = useState(null)
  const [mensaje, setMensaje]      = useState('')

  const [form, setForm] = useState({
    nombre: '', paterno: '', materno: '',
    telefono: '', correo: '', nit: '', direccion: ''
  })

  const handleCrear = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearCliente({
        variables: {
          nombre:    form.nombre,
          paterno:   form.paterno || null,
          materno:   form.materno || null,
          telefono:  form.telefono || null,
          correo:    form.correo || null,
          nit:       form.nit || null,
          direccion: form.direccion || null,
        }
      })
      if (res.crearCliente.ok) {
        setMensaje('Cliente creado correctamente')
        setForm({ nombre: '', paterno: '', materno: '', telefono: '', correo: '', nit: '', direccion: '' })
        setModo('lista')
        refetch()
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleEditar = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await actualizarCliente({
        variables: {
          idCliente: parseInt(clienteSel.idCliente),
          nombre:    form.nombre || null,
          paterno:   form.paterno || null,
          materno:   form.materno || null,
          telefono:  form.telefono || null,
          correo:    form.correo || null,
          nit:       form.nit || null,
          direccion: form.direccion || null,
        }
      })
      if (res.actualizarCliente.ok) {
        setMensaje('Cliente actualizado')
        setModo('lista')
        refetch()
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleSeleccionar = (c) => {
    setClienteSel(c)
    setForm({
      nombre:    c.nombre,
      paterno:   c.paterno || '',
      materno:   c.materno || '',
      telefono:  c.telefono || '',
      correo:    c.correo || '',
      nit:       c.nit || '',
      direccion: c.direccion || '',
    })
    setModo('editar')
    setMensaje('')
  }

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Clientes</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje('') }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' ? 'Ver lista' : '+ Nuevo Cliente'}
        </button>
      </div>

      {(modo === 'nuevo' || modo === 'editar') && (
        <form onSubmit={modo === 'nuevo' ? handleCrear : handleEditar} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            {modo === 'nuevo' ? 'Nuevo Cliente' : `Editando: ${clienteSel?.nombreCompleto}`}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Nombre',    key: 'nombre',    req: true },
              { label: 'Paterno',   key: 'paterno',   req: false },
              { label: 'Materno',   key: 'materno',   req: false },
              { label: 'Teléfono', key: 'telefono',  req: false },
              { label: 'Correo',    key: 'correo',    req: false },
              { label: 'CI',        key: 'nit',       req: false },
              { label: 'Dirección', key: 'direccion', req: false },
            ].map(({ label, key, req }) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={req}
                />
              </div>
            ))}
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              {modo === 'nuevo' ? 'Crear Cliente' : 'Guardar Cambios'}
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
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Teléfono</th>
                <th className="px-4 py-3 text-left">Correo</th>
                <th className="px-4 py-3 text-left">CI</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.clientes.map((c) => (
                <tr key={c.idCliente} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{c.idCliente}</td>
                  <td className="px-4 py-3 font-medium">{c.nombreCompleto}</td>
                  <td className="px-4 py-3">{c.telefono || '—'}</td>
                  <td className="px-4 py-3">{c.correo || '—'}</td>
                  <td className="px-4 py-3">{c.nit || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{c.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleSeleccionar(c)} className="text-blue-500 hover:text-blue-700 text-xs">
                      Editar
                    </button>
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