import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_PERMISOS } from '../graphql/queries'
import { CREAR_PERMISO, ELIMINAR_PERMISO } from '../graphql/mutations'

export default function PermisosPage() {
  const { data, loading, refetch } = useQuery(GET_PERMISOS)
  const [crearPermiso]             = useMutation(CREAR_PERMISO)
  const [eliminarPermiso]          = useMutation(ELIMINAR_PERMISO)
  const [form, setForm]            = useState({ nombre: '', descripcion: '' })
  const [mensaje, setMensaje]      = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data: res } = await crearPermiso({ variables: form })
    if (res.crearPermiso.ok) {
      setMensaje('Permiso creado correctamente')
      setForm({ nombre: '', descripcion: '' })
      refetch()
    }
  }

  const handleEliminar = async (idPermiso) => {
    if (!confirm('¿Eliminar este permiso?')) return
    const { data: res } = await eliminarPermiso({ variables: { idPermiso } })
    setMensaje(res.eliminarPermiso.mensaje)
    refetch()
  }

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Gestión de Permisos</h2>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Nuevo Permiso</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Descripción</label>
            <input
              type="text"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
        <button type="submit" className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          Guardar Permiso
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.permisos.map((p) => (
              <tr key={p.idPermiso} className="hover:bg-gray-50">
                <td className="px-4 py-3">{p.idPermiso}</td>
                <td className="px-4 py-3 font-medium">{p.nombre}</td>
                <td className="px-4 py-3 text-gray-500">{p.descripcion || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {p.estado}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleEliminar(parseInt(p.idPermiso))}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}