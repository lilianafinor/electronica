import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_CATALOGO_PROVEEDOR, GET_PROVEEDORES } from '../graphql/queries'
import { GET_PRODUCTOS } from '../../inventario/graphql/queries'
import { AGREGAR_ARTICULO_CATALOGO, ACTUALIZAR_CATALOGO, ELIMINAR_ARTICULO_CATALOGO } from '../graphql/mutations'

export default function CatalogoProveedor() {
  const { data, loading, refetch } = useQuery(GET_CATALOGO_PROVEEDOR)
  const { data: dataProveedores }  = useQuery(GET_PROVEEDORES)
  const { data: dataProductos }    = useQuery(GET_PRODUCTOS)
  const [agregarArticulo]          = useMutation(AGREGAR_ARTICULO_CATALOGO)
  const [actualizarCatalogo]       = useMutation(ACTUALIZAR_CATALOGO)
  const [eliminarArticulo]         = useMutation(ELIMINAR_ARTICULO_CATALOGO)
  const [modo, setModo]            = useState('lista')
  const [catalogoSel, setCatalogoSel] = useState(null)
  const [mensaje, setMensaje]      = useState('')
  const [filtroProveedor, setFiltroProveedor] = useState('')
  const [filtroArticulo, setFiltroArticulo]   = useState('')

  const [form, setForm] = useState({
    idProveedor: '', idProducto: '', precioUnitario: '', stockDisponible: ''
  })

  const [formEdit, setFormEdit] = useState({
    precioUnitario: '', stockDisponible: '', estado: ''
  })

  const handleAgregar = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await agregarArticulo({
        variables: {
          idProveedor:     parseInt(form.idProveedor),
          idProducto:      parseInt(form.idProducto),
          precioUnitario:  form.precioUnitario,
          stockDisponible: form.stockDisponible,
        }
      })
      if (res.agregarArticuloCatalogo.ok) {
        setMensaje(res.agregarArticuloCatalogo.mensaje)
        setForm({ idProveedor: '', idProducto: '', precioUnitario: '', stockDisponible: '' })
        setModo('lista')
        refetch()
      } else {
        setMensaje(res.agregarArticuloCatalogo.mensaje)
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleActualizar = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await actualizarCatalogo({
        variables: {
          idCatalogo:      parseInt(catalogoSel.idCatalogo),
          precioUnitario:  formEdit.precioUnitario || null,
          stockDisponible: formEdit.stockDisponible || null,
          estado:          formEdit.estado || null,
        }
      })
      if (res.actualizarCatalogo.ok) {
        setMensaje(res.actualizarCatalogo.mensaje)
        setModo('lista')
        refetch()
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleEliminar = async (idCatalogo) => {
    if (!confirm('¿Eliminar este artículo del catálogo?')) return
    try {
      const { data: res } = await eliminarArticulo({
        variables: { idCatalogo: parseInt(idCatalogo) }
      })
      setMensaje(res.eliminarArticuloCatalogo.mensaje)
      refetch()
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleSeleccionar = (c) => {
    setCatalogoSel(c)
    setFormEdit({
      precioUnitario:  c.precioUnitario,
      stockDisponible: c.stockDisponible,
      estado:          c.estado,
    })
    setModo('editar')
    setMensaje('')
  }

  const catalogoFiltrado = data?.catalogoProveedor.filter((c) => {
    const matchProveedor = filtroProveedor
      ? c.idProveedor.idProveedor === filtroProveedor
      : true
    const matchArticulo = filtroArticulo
      ? c.idProducto.nombre.toLowerCase().includes(filtroArticulo.toLowerCase())
      : true
    return matchProveedor && matchArticulo
  }) || []

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Catálogo de Proveedores</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje('') }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' ? 'Ver lista' : '+ Agregar Artículo'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <form onSubmit={handleAgregar} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Agregar Artículo al Catálogo</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Proveedor</label>
              <select value={form.idProveedor} onChange={(e) => setForm({ ...form, idProveedor: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Selecciona --</option>
                {dataProveedores?.proveedores.map((p) => (
                  <option key={p.idProveedor} value={p.idProveedor}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Artículo</label>
              <select value={form.idProducto} onChange={(e) => setForm({ ...form, idProducto: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Selecciona --</option>
                {dataProductos?.productos.map((p) => (
                  <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Precio Unitario (Bs.)</label>
              <input type="text" value={form.precioUnitario}
                onChange={(e) => setForm({ ...form, precioUnitario: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Stock Disponible</label>
              <input type="text" value={form.stockDisponible}
                onChange={(e) => setForm({ ...form, stockDisponible: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Guardar
            </button>
            <button type="button" onClick={() => setModo('lista')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {modo === 'editar' && catalogoSel && (
        <form onSubmit={handleActualizar} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            Editando: {catalogoSel.idProducto.nombre} — {catalogoSel.idProveedor.nombre}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Precio Unitario (Bs.)</label>
              <input type="text" value={formEdit.precioUnitario}
                onChange={(e) => setFormEdit({ ...formEdit, precioUnitario: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Stock Disponible</label>
              <input type="text" value={formEdit.stockDisponible}
                onChange={(e) => setFormEdit({ ...formEdit, stockDisponible: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Estado</label>
              <select value={formEdit.estado} onChange={(e) => setFormEdit({ ...formEdit, estado: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Guardar Cambios
            </button>
            <button type="button" onClick={() => setModo('lista')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {modo === 'lista' && (
        <>
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Filtrar por Proveedor</label>
                <select value={filtroProveedor} onChange={(e) => setFiltroProveedor(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Todos --</option>
                  {dataProveedores?.proveedores.map((p) => (
                    <option key={p.idProveedor} value={p.idProveedor}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Buscar Artículo</label>
                <input type="text" value={filtroArticulo}
                  onChange={(e) => setFiltroArticulo(e.target.value)}
                  placeholder="Nombre del artículo..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {mensaje && <p className="text-green-600 text-sm mb-3">{mensaje}</p>}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Artículo</th>
                  <th className="px-4 py-3 text-left">Marca</th>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-left">Proveedor</th>
                  <th className="px-4 py-3 text-left">Precio Unit.</th>
                  <th className="px-4 py-3 text-left">Stock Disp.</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {catalogoFiltrado.map((c) => (
                  <tr key={c.idCatalogo} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{c.idProducto.nombre}</td>
                    <td className="px-4 py-3">{c.idProducto.idMarca?.nombre || '—'}</td>
                    <td className="px-4 py-3">{c.idProducto.idCategoria?.nombre || '—'}</td>
                    <td className="px-4 py-3">{c.idProveedor.nombre}</td>
                    <td className="px-4 py-3 font-medium text-blue-700">Bs. {c.precioUnitario}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        parseFloat(c.stockDisponible) > 10
                          ? 'bg-green-100 text-green-700'
                          : parseFloat(c.stockDisponible) > 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {c.stockDisponible}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{c.estado}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleSeleccionar(c)}
                          className="text-blue-500 hover:text-blue-700 text-xs">Editar</button>
                        <button onClick={() => handleEliminar(c.idCatalogo)}
                          className="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {catalogoFiltrado.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-4 py-6 text-center text-gray-400">
                      No hay artículos en el catálogo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}