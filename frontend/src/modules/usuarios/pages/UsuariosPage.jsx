import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_USUARIOS, GET_ROLES, GET_ROLES_PERMISOS, GET_PERMISOS_USUARIO } from '../graphql/queries'
import {
  CREAR_USUARIO, ACTUALIZAR_USUARIO,
  ASIGNAR_ROL_A_USUARIO, ASIGNAR_PERMISO_A_USUARIO,
  ELIMINAR_PERMISO_USUARIO
} from '../graphql/mutations'

export default function UsuariosPage() {
  const { data, loading, refetch }              = useQuery(GET_USUARIOS)
  const { data: dataRoles }                     = useQuery(GET_ROLES)
  const { data: dataRolPermisos }               = useQuery(GET_ROLES_PERMISOS)
  const { data: dataPermisosUsuario, refetch: refetchPermisos } = useQuery(GET_PERMISOS_USUARIO)
  const [crearUsuario]                          = useMutation(CREAR_USUARIO)
  const [actualizarUsuario]                     = useMutation(ACTUALIZAR_USUARIO)
  const [asignarRol]                            = useMutation(ASIGNAR_ROL_A_USUARIO)
  const [asignarPermiso]                        = useMutation(ASIGNAR_PERMISO_A_USUARIO)
  const [eliminarPermisoUsuario]                = useMutation(ELIMINAR_PERMISO_USUARIO)
  const [usuarioSel, setUsuarioSel]             = useState(null)
  const [rolSel, setRolSel]                     = useState('')
  const [rolPermisoSel, setRolPermisoSel]       = useState('')
  const [mensaje, setMensaje]                   = useState('')
  const [modo, setModo]                         = useState('lista')
  const [tab, setTab]                           = useState('rol')

  const [form, setForm] = useState({
    nombre: '', paterno: '', materno: '', username: '',
    correo: '', password: '', telefono: ''
  })

  const handleCrear = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearUsuario({ variables: form })
      if (res.crearUsuario.ok) {
        setMensaje('Usuario creado correctamente')
        setForm({ nombre: '', paterno: '', materno: '', username: '', correo: '', password: '', telefono: '' })
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
      const { data: res } = await actualizarUsuario({
        variables: {
          idUsuario: parseInt(usuarioSel.idUsuario),
          nombre:    form.nombre || null,
          paterno:   form.paterno || null,
          materno:   form.materno || null,
          telefono:  form.telefono || null,
        }
      })
      if (res.actualizarUsuario.ok) {
        setMensaje('Usuario actualizado')
        setModo('lista')
        refetch()
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleAsignarRol = async () => {
    if (!usuarioSel || !rolSel) return
    try {
      const { data: res } = await asignarRol({
        variables: {
          idUsuario: parseInt(usuarioSel.idUsuario),
          idRol:     parseInt(rolSel)
        }
      })
      setMensaje(res.asignarRolAUsuario.mensaje)
      refetch()
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleAsignarPermiso = async () => {
    if (!usuarioSel || !rolPermisoSel) return
    try {
      const { data: res } = await asignarPermiso({
        variables: {
          idUsuario:    parseInt(usuarioSel.idUsuario),
          idRolPermiso: parseInt(rolPermisoSel)
        }
      })
      setMensaje(res.asignarRolPermisoAUsuario.mensaje)
      setRolPermisoSel('')
      refetchPermisos()
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleEliminarPermiso = async (idRolPermisoUsuario) => {
    try {
      await eliminarPermisoUsuario({
        variables: { idRolPermisoUsuario: parseInt(idRolPermisoUsuario) }
      })
      setMensaje('Permiso eliminado')
      refetchPermisos()
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleSeleccionarUsuario = (usuario) => {
    setUsuarioSel(usuario)
    setForm({
      nombre:   usuario.nombreCompleto.split(' ')[0] || '',
      paterno:  usuario.nombreCompleto.split(' ')[1] || '',
      materno:  usuario.nombreCompleto.split(' ')[2] || '',
      username: usuario.username,
      correo:   usuario.correo,
      password: '',
      telefono: usuario.telefono || '',
    })
    setRolSel(usuario.idRol?.idRol || '')
    setModo('editar')
    setTab('rol')
    setMensaje('')
  }

  const permisosDelUsuario = dataPermisosUsuario?.rolesPermisosUsuarios.filter(
    (rpu) => rpu.idUsuario.idUsuario === usuarioSel?.idUsuario
  ) || []

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje(''); setUsuarioSel(null) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' ? 'Ver lista' : '+ Nuevo Usuario'}
        </button>
      </div>

      {/* Formulario nuevo usuario */}
      {modo === 'nuevo' && (
        <form onSubmit={handleCrear} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Nuevo Usuario</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Nombre',   key: 'nombre',   req: true },
              { label: 'Paterno',  key: 'paterno',  req: false },
              { label: 'Materno',  key: 'materno',  req: false },
              { label: 'Username', key: 'username', req: true },
              { label: 'Correo',   key: 'correo',   req: true },
              { label: 'Teléfono', key: 'telefono', req: false },
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
            <div>
              <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          {mensaje && <p className="text-red-500 text-sm mt-2">{mensaje}</p>}
          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Crear Usuario
            </button>
            <button type="button" onClick={() => setModo('lista')} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Formulario editar usuario */}
      {modo === 'editar' && usuarioSel && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            Editando: <span className="text-blue-600">{usuarioSel.username}</span>
          </h3>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b">
            {['rol', 'permisos', 'datos'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium capitalize ${
                  tab === t
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'rol' ? 'Asignar Rol' : t === 'permisos' ? 'Asignar Permisos' : 'Editar Datos'}
              </button>
            ))}
          </div>

          {/* Tab: Asignar Rol */}
          {tab === 'rol' && (
            <div>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Rol actual: <span className="font-medium text-blue-600">{usuarioSel.idRol?.nombre || 'Sin rol'}</span></label>
                  <select
                    value={rolSel}
                    onChange={(e) => setRolSel(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Sin rol --</option>
                    {dataRoles?.roles.map((r) => (
                      <option key={r.idRol} value={r.idRol}>{r.nombre}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAsignarRol}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Asignar Rol
                </button>
              </div>
              {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
            </div>
          )}

          {/* Tab: Asignar Permisos */}
          {tab === 'permisos' && (
            <div>
              <div className="flex gap-3 items-end mb-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Seleccionar permiso</label>
                  <select
                    value={rolPermisoSel}
                    onChange={(e) => setRolPermisoSel(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Selecciona --</option>
                    {dataRolPermisos?.rolesPermisos
                      .filter((rp) => !permisosDelUsuario.some(
                        (pu) => pu.idRolPermiso.idRolPermiso === rp.idRolPermiso
                      ))
                      .map((rp) => (
                        <option key={rp.idRolPermiso} value={rp.idRolPermiso}>
                          {rp.idPermiso.nombre}
                        </option>
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

              <h4 className="text-sm font-semibold text-gray-700 mb-2">Permisos actuales:</h4>
              {permisosDelUsuario.length === 0 ? (
                <p className="text-sm text-gray-400">Sin permisos asignados</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-2 text-left">Permiso</th>
                      <th className="px-4 py-2 text-left">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {permisosDelUsuario.map((pu) => (
                      <tr key={pu.idRolPermisoUsuario}>
                        <td className="px-4 py-2">{pu.idRolPermiso.idPermiso.nombre}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleEliminarPermiso(parseInt(pu.idRolPermisoUsuario))}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
            </div>
          )}

          {/* Tab: Editar Datos */}
          {tab === 'datos' && (
            <form onSubmit={handleEditar}>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Nombre',   key: 'nombre' },
                  { label: 'Paterno',  key: 'paterno' },
                  { label: 'Materno',  key: 'materno' },
                  { label: 'Teléfono', key: 'telefono' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-600 mb-1">{label}</label>
                    <input
                      type="text"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
              {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
              <div className="flex gap-2 mt-3">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  Guardar Cambios
                </button>
                <button type="button" onClick={() => setModo('lista')} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tabla usuarios */}
      {modo === 'lista' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Correo</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.usuarios.map((u) => (
                <tr key={u.idUsuario} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{u.idUsuario}</td>
                  <td className="px-4 py-3 font-medium">{u.nombreCompleto}</td>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3 text-gray-500">{u.correo}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {u.idRol?.nombre || 'Sin rol'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.bloqueado
                        ? 'bg-red-100 text-red-700'
                        : u.estado === 'activo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.bloqueado ? 'bloqueado' : u.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleSeleccionarUsuario(u)}
                      className="text-blue-500 hover:text-blue-700 text-xs"
                    >
                      Gestionar
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