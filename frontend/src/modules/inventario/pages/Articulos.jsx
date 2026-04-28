import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_PRODUCTOS, GET_MARCAS, GET_CATEGORIAS, GET_UNIDADES } from '../graphql/queries'
import { CREAR_PRODUCTO, ACTUALIZAR_PRODUCTO } from '../graphql/mutations'

export default function Productos() {
  const { data, loading, refetch } = useQuery(GET_PRODUCTOS)
  const { data: dataMarcas }       = useQuery(GET_MARCAS)
  const { data: dataCategorias }   = useQuery(GET_CATEGORIAS)
  const { data: dataUnidades }     = useQuery(GET_UNIDADES)
  const [crearProducto]            = useMutation(CREAR_PRODUCTO)
  const [actualizarProducto]       = useMutation(ACTUALIZAR_PRODUCTO)
  const [modo, setModo]            = useState('lista')
  const [productoSel, setProductoSel] = useState(null)
  const [mensaje, setMensaje]      = useState('')

  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: '',
    idMarca: '', idCategoria: '', idUnidad: ''
  })

  const handleCrear = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearProducto({
        variables: {
          nombre:      form.nombre,
          descripcion: form.descripcion || null,
          precio:      form.precio || '0',
          idMarca:     form.idMarca ? parseInt(form.idMarca) : null,
          idCategoria: form.idCategoria ? parseInt(form.idCategoria) : null,
          idUnidad:    form.idUnidad ? parseInt(form.idUnidad) : null,
        }
      })
      if (res.crearProducto.ok) {
        setMensaje('Artículo creado correctamente')
        setForm({ nombre: '', descripcion: '', precio: '', idMarca: '', idCategoria: '', idUnidad: '' })
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
      const { data: res } = await actualizarProducto({
        variables: {
          idProducto:  parseInt(productoSel.idProducto),
          nombre:      form.nombre || null,
          descripcion: form.descripcion || null,
          precio:      form.precio || null,
          idMarca:     form.idMarca ? parseInt(form.idMarca) : null,
          idCategoria: form.idCategoria ? parseInt(form.idCategoria) : null,
          idUnidad:    form.idUnidad ? parseInt(form.idUnidad) : null,
        }
      })
      if (res.actualizarProducto.ok) {
        setMensaje('Artículo actualizado')
        setModo('lista')
        refetch()
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleSeleccionar = (p) => {
    setProductoSel(p)
    setForm({
      nombre:      p.nombre,
      descripcion: p.descripcion || '',
      precio:      p.precio,
      idMarca:     p.idMarca?.idMarca || '',
      idCategoria: p.idCategoria?.idCategoria || '',
      idUnidad:    p.idUnidad?.idUnidad || '',
    })
    setModo('editar')
    setMensaje('')
  }

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Artículos</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje('') }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' ? 'Ver lista' : '+ Nuevo Artículo'}
        </button>
      </div>

      {(modo === 'nuevo' || modo === 'editar') && (
        <form onSubmit={modo === 'nuevo' ? handleCrear : handleEditar} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            {modo === 'nuevo' ? 'Nuevo Artículo' : `Editando: ${productoSel?.nombre}`}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Descripción</label>
              <input type="text" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Precio</label>
              <input type="text" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Marca</label>
              <select value={form.idMarca} onChange={(e) => setForm({ ...form, idMarca: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Sin marca --</option>
                {dataMarcas?.marcas.map((m) => <option key={m.idMarca} value={m.idMarca}>{m.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Categoría</label>
              <select value={form.idCategoria} onChange={(e) => setForm({ ...form, idCategoria: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Sin categoría --</option>
                {dataCategorias?.categorias.map((c) => <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Unidad de Medida</label>
              <select value={form.idUnidad} onChange={(e) => setForm({ ...form, idUnidad: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Sin unidad --</option>
                {dataUnidades?.unidadesMedida.map((u) => <option key={u.idUnidad} value={u.idUnidad}>{u.nombre}</option>)}
              </select>
            </div>
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              {modo === 'nuevo' ? 'Crear Artículo' : 'Guardar Cambios'}
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
                <th className="px-4 py-3 text-left">Precio</th>
                <th className="px-4 py-3 text-left">Marca</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-left">Unidad</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.productos.map((p) => (
                <tr key={p.idProducto} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{p.idProducto}</td>
                  <td className="px-4 py-3 font-medium">{p.nombre}</td>
                  <td className="px-4 py-3">Bs. {p.precio}</td>
                  <td className="px-4 py-3">{p.idMarca?.nombre || '—'}</td>
                  <td className="px-4 py-3">{p.idCategoria?.nombre || '—'}</td>
                  <td className="px-4 py-3">{p.idUnidad?.nombre || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{p.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleSeleccionar(p)} className="text-blue-500 hover:text-blue-700 text-xs">
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