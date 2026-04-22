import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_ALMACENES, GET_PRODUCTOS_ALMACEN } from '../graphql/queries'
import { CREAR_ALMACEN, ACTUALIZAR_ALMACEN } from '../graphql/mutations'

export default function Almacenes() {
  const { data, loading, refetch }        = useQuery(GET_ALMACENES)
  const { data: dataStock }               = useQuery(GET_PRODUCTOS_ALMACEN)
  const [crearAlmacen]                    = useMutation(CREAR_ALMACEN)
  const [actualizarAlmacen]               = useMutation(ACTUALIZAR_ALMACEN)
  const [modo, setModo]                   = useState('lista')
  const [almacenSel, setAlmacenSel]       = useState(null)
  const [verStock, setVerStock]           = useState(null)
  const [mensaje, setMensaje]             = useState('')

  const [form, setForm] = useState({
    nombre: '', descripcion: '', direccion: '', cantidadMax: ''
  })

  const handleCrear = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearAlmacen({
        variables: {
          nombre:      form.nombre,
          descripcion: form.descripcion || null,
          direccion:   form.direccion || null,
          cantidadMax: form.cantidadMax ? parseInt(form.cantidadMax) : null,
        }
      })
      if (res.crearAlmacen.ok) {
        setMensaje('Almacén creado correctamente')
        setForm({ nombre: '', descripcion: '', direccion: '', cantidadMax: '' })
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
      const { data: res } = await actualizarAlmacen({
        variables: {
          idAlmacen:   parseInt(almacenSel.idAlmacen),
          nombre:      form.nombre || null,
          descripcion: form.descripcion || null,
          direccion:   form.direccion || null,
          cantidadMax: form.cantidadMax ? parseInt(form.cantidadMax) : null,
        }
      })
      if (res.actualizarAlmacen.ok) {
        setMensaje('Almacén actualizado')
        setModo('lista')
        refetch()
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleSeleccionar = (a) => {
    setAlmacenSel(a)
    setForm({
      nombre:      a.nombre,
      descripcion: a.descripcion || '',
      direccion:   a.direccion || '',
      cantidadMax: a.cantidadMax || '',
    })
    setModo('editar')
    setMensaje('')
  }

  const stockDelAlmacen = (idAlmacen) =>
    dataStock?.productosAlmacen.filter(
      (pa) => pa.idAlmacen.idAlmacen === idAlmacen
    ) || []

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Almacenes</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje(''); setVerStock(null) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' ? 'Ver lista' : '+ Nuevo Almacén'}
        </button>
      </div>

      {(modo === 'nuevo' || modo === 'editar') && (
        <form onSubmit={modo === 'nuevo' ? handleCrear : handleEditar} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            {modo === 'nuevo' ? 'Nuevo Almacén' : `Editando: ${almacenSel?.nombre}`}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Nombre',        key: 'nombre',      req: true },
              { label: 'Descripción',   key: 'descripcion', req: false },
              { label: 'Dirección',     key: 'direccion',   req: false },
              { label: 'Capacidad Máx', key: 'cantidadMax', req: false },
            ].map(({ label, key, req }) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input type="text" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={req} />
              </div>
            ))}
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              {modo === 'nuevo' ? 'Crear Almacén' : 'Guardar Cambios'}
            </button>
            <button type="button" onClick={() => setModo('lista')} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {modo === 'lista' && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Dirección</th>
                  <th className="px-4 py-3 text-left">Cap. Máx</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.almacenes.map((a) => (
                  <tr key={a.idAlmacen} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{a.idAlmacen}</td>
                    <td className="px-4 py-3 font-medium">{a.nombre}</td>
                    <td className="px-4 py-3 text-gray-500">{a.direccion || '—'}</td>
                    <td className="px-4 py-3">{a.cantidadMax || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{a.estado}</span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => handleSeleccionar(a)} className="text-blue-500 hover:text-blue-700 text-xs">
                        Editar
                      </button>
                      <button
                        onClick={() => setVerStock(verStock === a.idAlmacen ? null : a.idAlmacen)}
                        className="text-green-500 hover:text-green-700 text-xs"
                      >
                        {verStock === a.idAlmacen ? 'Ocultar stock' : 'Ver stock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {verStock && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 bg-blue-50 border-b">
                <h3 className="font-semibold text-blue-700">
                  Stock — {data?.almacenes.find((a) => a.idAlmacen === verStock)?.nombre}
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Producto</th>
                    <th className="px-4 py-3 text-left">Stock</th>
                    <th className="px-4 py-3 text-left">Stock Mín</th>
                    <th className="px-4 py-3 text-left">Stock Máx</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stockDelAlmacen(verStock).length === 0 ? (
                    <tr><td colSpan="4" className="px-4 py-3 text-gray-400 text-center">Sin productos</td></tr>
                  ) : (
                    stockDelAlmacen(verStock).map((pa) => (
                      <tr key={pa.idProductoAlmacen} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{pa.idProducto.nombre}</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${parseFloat(pa.stock) <= parseFloat(pa.stockMin) ? 'text-red-600' : 'text-green-600'}`}>
                            {pa.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">{pa.stockMin}</td>
                        <td className="px-4 py-3">{pa.stockMax || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}