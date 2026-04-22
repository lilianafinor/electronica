import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_ROLES, GET_PERMISOS } from '../graphql/queries'
import { CREAR_ROL, ACTUALIZAR_ROL, ASIGNAR_PERMISO_A_ROL, ELIMINAR_ROL_PERMISO } from '../graphql/mutations'

export default function RolesPage() {
  const { data, loading, refetch } = useQuery(GET_ROLES)
  const { data: dataPermisos }     = useQuery(GET_PERMISOS)
  const [crearRol]                 = useMutation(CREAR_ROL)
  const [actualizarRol]            = useMutation(ACTUALIZAR_ROL)
  const [asignarPermiso]           = useMutation(ASIGNAR_PERMISO_A_ROL)
  const [eliminarRolPermiso]       = useMutation(ELIMINAR_ROL_PERMISO)
  const [form, setForm]            = useState({ nombre: '', descripcion: '' })
  const [rolSel, setRolSel]        = useState(null)
  const [permisoSel, setPermisoSel] = useState('')
  const [mensaje, setMensaje]      = useState('')

  const handleCrearRol = async (e) => {
    e.preventDefault()
    const { data: res } = await crearRol({ variables: form })
    if (res.crearRol.ok) {
      setMensaje('Rol creado correctamente')
      setForm({ nombre: '', descripcion: '' })
      refetch()
    }
  }

  const handleAsignarPermiso = async () => {
    if (!rolSel || !permisoSel) return
    const yaAsignado = rolSel.rolPermisos.some(
      (rp) => rp.idPermiso.idPermiso === parseInt(permisoSel)
    )
    if (yaAsignado) { setMensaje('Este permiso ya está asignado'); return }
    const { data: res } = await asignarPermiso({
      variables: { idRol: rolSel.idRol, idPermiso: parseInt(permisoSel) }
    })
    if (res.asignarPermisoARol.ok) {
      setMensaje('Permiso asignado')
      setPermisoSel('')
      refetch()
    }
  }

  const handleEliminarPermiso = async (idRolPermiso) => {
    await eliminarRolPermiso({ variables: { idRolPermiso } })
    setMensaje('Permiso eliminado del rol')
    refetch()
  }

  const handleDesactivar = async (idRol) => {
    await actualizarRol({ variables: { idRol, estado: 'inactivo' } })
    refetch()
  }

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Gestión de Roles</h2>

      {/* Formulario nuevo rol */}
      <form onSubmit={handleCrearRol} className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Nuevo Rol</h3>
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
          Guardar Rol
        </button>
      </form>

      {/* Tabla roles */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Permisos</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.roles.map((rol) => (
              <tr
                key={rol.idRol}
                className={`hover:bg-gray-50 cursor-pointer ${rolSel?.idRol === rol.idRol ? 'bg-blue-50' : ''}`}
                onClick={() => { setRolSel(rol); setMensaje('') }}
              >
                <td className="px-4 py-3">{rol.idRol}</td>
                <td className="px-4 py-3 font-medium">{rol.nombre}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {rol.rolPermisos.map((rp) => (
                      <span key={rp.idRolPermiso} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        {rp.idPermiso.nombre}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEliminarPermiso(parseInt(rp.idRolPermiso)) }}
                          className="text-red-400 hover:text-red-600 font-bold"
                        >×</button>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rol.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {rol.estado}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDesactivar(rol.idRol) }}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Desactivar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Asignar permiso al rol seleccionado */}
      {rolSel && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 mb-3">
            Asignar permiso a: <span className="text-blue-600">{rolSel.nombre}</span>
          </h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Permiso</label>
              <select
                value={permisoSel}
                onChange={(e) => setPermisoSel(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Selecciona --</option>
                {dataPermisos?.permisos
                  .filter((p) => !rolSel.rolPermisos.some((rp) => rp.idPermiso.idPermiso === p.idPermiso))
                  .map((p) => (
                    <option key={p.idPermiso} value={p.idPermiso}>{p.nombre}</option>
                  ))
                }
              </select>
            </div>
            <button
              onClick={handleAsignarPermiso}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              Asignar
            </button>
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
        </div>
      )}
    </div>
  )
}