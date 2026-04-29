import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_PROVEEDORES, GET_CATALOGO_POR_PROVEEDOR } from '../graphql/queries'
import { CREAR_PROVEEDOR, ACTUALIZAR_PROVEEDOR } from '../graphql/mutations'

// ── Sub-componente: fila expandida con el catálogo ──────────────────────────
function FilaCatalogo({ idProveedor }) {
  const { data, loading, error } = useQuery(GET_CATALOGO_POR_PROVEEDOR, {
    variables: { idProveedor: parseInt(idProveedor) },
    fetchPolicy: 'network-only',
  })

  if (loading)
    return (
      <tr>
        <td colSpan="8" className="px-6 py-4 bg-blue-50 text-sm text-gray-500 text-center">
          Cargando catálogo...
        </td>
      </tr>
    )

  if (error)
    return (
      <tr>
        <td colSpan="8" className="px-6 py-4 bg-red-50 text-sm text-red-500 text-center">
          Error al cargar: {error.message}
        </td>
      </tr>
    )

  const articulos = data?.catalogoPorProveedor || []

  return (
    <tr>
      <td colSpan="8" className="bg-blue-50 px-6 py-4">

        {/* Encabezado del catálogo */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-semibold text-blue-700">
            📦 Artículos disponibles
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {articulos.length} artículo{articulos.length !== 1 ? 's' : ''}
          </span>
        </div>

        {articulos.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            Este proveedor no tiene artículos en catálogo.
          </p>
        ) : (
          <table className="w-full text-sm bg-white rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Artículo</th>
                <th className="px-4 py-2 text-left">Marca</th>
                <th className="px-4 py-2 text-left">Categoría</th>
                <th className="px-4 py-2 text-left">Unidad</th>
                <th className="px-4 py-2 text-right">Precio unitario</th>
                <th className="px-4 py-2 text-center">Stock disponible</th>
                <th className="px-4 py-2 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articulos.map((item) => (
                <tr key={item.idCatalogo} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-800">
                    {item.idProducto?.nombre}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {item.idProducto?.idMarca?.nombre || '—'}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {item.idProducto?.idCategoria?.nombre || '—'}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {item.idProducto?.idUnidad?.nombre || '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-green-700">
                    Bs. {parseFloat(item.precioUnitario).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.stockDisponible <= 5
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.stockDisponible}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.estado === 'activo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </td>
    </tr>
  )
}

// ── Página principal ────────────────────────────────────────────────────────
export default function Proveedores() {
  const { data, loading, refetch }      = useQuery(GET_PROVEEDORES)
  const [crearProveedor]                = useMutation(CREAR_PROVEEDOR)
  const [actualizarProveedor]           = useMutation(ACTUALIZAR_PROVEEDOR)
  const [modo, setModo]                 = useState('lista')
  const [proveedorSel, setProveedorSel] = useState(null)
  const [mensaje, setMensaje]           = useState('')
  const [expandido, setExpandido]       = useState(null)

  const [form, setForm] = useState({
    nombre: '', telefono: '', email: '',
    direccion: '', nit: '', contacto: ''
  })

  const toggleExpandido = (id) => {
    setExpandido(expandido === id ? null : id)
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearProveedor({
        variables: {
          nombre:    form.nombre,
          telefono:  form.telefono || null,
          email:     form.email || null,
          direccion: form.direccion || null,
          nit:       form.nit || null,
          contacto:  form.contacto || null,
        }
      })
      if (res.crearProveedor.ok) {
        setMensaje('Proveedor creado correctamente')
        setForm({ nombre: '', telefono: '', email: '', direccion: '', nit: '', contacto: '' })
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
      const { data: res } = await actualizarProveedor({
        variables: {
          idProveedor: parseInt(proveedorSel.idProveedor),
          nombre:      form.nombre || null,
          telefono:    form.telefono || null,
          email:       form.email || null,
          direccion:   form.direccion || null,
          nit:         form.nit || null,
          contacto:    form.contacto || null,
        }
      })
      if (res.actualizarProveedor.ok) {
        setMensaje('Proveedor actualizado')
        setModo('lista')
        refetch()
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleSeleccionar = (p) => {
    setProveedorSel(p)
    setForm({
      nombre:    p.nombre,
      telefono:  p.telefono || '',
      email:     p.email || '',
      direccion: p.direccion || '',
      nit:       p.nit || '',
      contacto:  p.contacto || '',
    })
    setModo('editar')
    setMensaje('')
    setExpandido(null)
  }

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Proveedores</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje('') }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' ? 'Ver lista' : '+ Nuevo Proveedor'}
        </button>
      </div>

      {/* Formulario crear / editar */}
      {(modo === 'nuevo' || modo === 'editar') && (
        <form
          onSubmit={modo === 'nuevo' ? handleCrear : handleEditar}
          className="bg-white p-4 rounded-lg shadow mb-6"
        >
          <h3 className="font-semibold text-gray-700 mb-3">
            {modo === 'nuevo' ? 'Nuevo Proveedor' : `Editando: ${proveedorSel?.nombre}`}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Nombre',    key: 'nombre',    req: true },
              { label: 'Teléfono', key: 'telefono',  req: false },
              { label: 'Email',     key: 'email',     req: false },
              { label: 'Dirección', key: 'direccion', req: false },
              { label: 'NIT',       key: 'nit',       req: false },
              { label: 'Contacto',  key: 'contacto',  req: false },
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
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              {modo === 'nuevo' ? 'Crear Proveedor' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={() => setModo('lista')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Tabla de proveedores */}
      {modo === 'lista' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left w-8"></th>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Teléfono</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">NIT</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.proveedores.map((p) => (
                <>
                  {/* Fila principal del proveedor */}
                  <tr
                    key={p.idProveedor}
                    className={`hover:bg-gray-50 ${expandido === p.idProveedor ? 'bg-blue-50' : ''}`}
                  >
                    {/* Botón expandir/colapsar */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleExpandido(p.idProveedor)}
                        title={expandido === p.idProveedor ? 'Ocultar catálogo' : 'Ver artículos'}
                        className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                          expandido === p.idProveedor
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                        }`}
                      >
                        {expandido === p.idProveedor ? '▲' : '▼'}
                      </button>
                    </td>
                    <td className="px-4 py-3">{p.idProveedor}</td>
                    <td className="px-4 py-3 font-medium">{p.nombre}</td>
                    <td className="px-4 py-3">{p.telefono || '—'}</td>
                    <td className="px-4 py-3">{p.email || '—'}</td>
                    <td className="px-4 py-3">{p.nit || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.estado === 'activo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSeleccionar(p)}
                        className="text-blue-500 hover:text-blue-700 text-xs"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>

                  {/* Fila expandible con catálogo del proveedor */}
                  {expandido === p.idProveedor && (
                    <FilaCatalogo
                      key={`cat-${p.idProveedor}`}
                      idProveedor={p.idProveedor}
                    />
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}