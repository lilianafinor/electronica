import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_ORDENES_COMPRA, GET_PROVEEDORES } from '../graphql/queries'
import { GET_PRODUCTOS } from '../../inventario/graphql/queries'
import { CREAR_ORDEN_COMPRA, AGREGAR_DETALLE_ORDEN, ACTUALIZAR_ESTADO_ORDEN } from '../graphql/mutations'

export default function OrdenesCompra() {
  const { data, loading, refetch } = useQuery(GET_ORDENES_COMPRA)
  const { data: dataProveedores }  = useQuery(GET_PROVEEDORES)
  const { data: dataProductos }    = useQuery(GET_PRODUCTOS)
  const [crearOrden]               = useMutation(CREAR_ORDEN_COMPRA)
  const [agregarDetalle]           = useMutation(AGREGAR_DETALLE_ORDEN)
  const [actualizarEstado]         = useMutation(ACTUALIZAR_ESTADO_ORDEN)
  const [modo, setModo]            = useState('lista')
  const [ordenSel, setOrdenSel]    = useState(null)
  const [mensaje, setMensaje]      = useState('')

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

  const [formOrden, setFormOrden] = useState({ fecha: '', idProveedor: '', glosa: '' })
  const [formDetalle, setFormDetalle] = useState({ idProducto: '', cantidad: '', precioUni: '' })

  const handleCrearOrden = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearOrden({
        variables: {
          fecha:       formOrden.fecha,
          idProveedor: parseInt(formOrden.idProveedor),
          glosa:       formOrden.glosa || null,
          idUsuario:   parseInt(usuario?.idUsuario),
        }
      })
      if (res.crearOrdenCompra.ok) {
        setMensaje('Orden creada')
        setOrdenSel(res.crearOrdenCompra.ordenCompra)
        setModo('detalle')
        refetch()
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleAgregarDetalle = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await agregarDetalle({
        variables: {
          idOrden:    parseInt(ordenSel.idOrden),
          idProducto: parseInt(formDetalle.idProducto),
          cantidad:   formDetalle.cantidad,
          precioUni:  formDetalle.precioUni,
        }
      })
      if (res.agregarDetalleOrden.ok) {
        setMensaje('Producto agregado')
        setFormDetalle({ idProducto: '', cantidad: '', precioUni: '' })
        refetch()
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleCambiarEstado = async (idOrden, estado) => {
    await actualizarEstado({ variables: { idOrden: parseInt(idOrden), estado } })
    refetch()
  }

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Órdenes de Compra</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje(''); setOrdenSel(null) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' || modo === 'detalle' ? 'Ver lista' : '+ Nueva Orden'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <form onSubmit={handleCrearOrden} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Nueva Orden de Compra</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha</label>
              <input type="date" value={formOrden.fecha} onChange={(e) => setFormOrden({ ...formOrden, fecha: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Proveedor</label>
              <select value={formOrden.idProveedor} onChange={(e) => setFormOrden({ ...formOrden, idProveedor: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Selecciona --</option>
                {dataProveedores?.proveedores.map((p) => <option key={p.idProveedor} value={p.idProveedor}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Glosa</label>
              <input type="text" value={formOrden.glosa} onChange={(e) => setFormOrden({ ...formOrden, glosa: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <button type="submit" className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Crear Orden
          </button>
        </form>
      )}

      {modo === 'detalle' && ordenSel && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            Agregar productos a Orden #{ordenSel.idOrden}
          </h3>
          <form onSubmit={handleAgregarDetalle}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Producto</label>
                <select value={formDetalle.idProducto} onChange={(e) => setFormDetalle({ ...formDetalle, idProducto: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">-- Selecciona --</option>
                  {dataProductos?.productos.map((p) => <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cantidad</label>
                <input type="text" value={formDetalle.cantidad} onChange={(e) => setFormDetalle({ ...formDetalle, cantidad: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Precio Unitario</label>
                <input type="text" value={formDetalle.precioUni} onChange={(e) => setFormDetalle({ ...formDetalle, precioUni: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>
            {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
            <button type="submit" className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
              Agregar Producto
            </button>
          </form>
        </div>
      )}

      {modo === 'lista' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Proveedor</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Productos</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.ordenesCompra.map((o) => (
                <tr key={o.idOrden} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{o.idOrden}</td>
                  <td className="px-4 py-3">{o.fecha}</td>
                  <td className="px-4 py-3">{o.idProveedor?.nombre || '—'}</td>
                  <td className="px-4 py-3 font-medium">Bs. {o.total}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {o.detalles.map((d) => (
                        <span key={d.idDetalleOrden} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          {d.idProducto.nombre} ({d.cantidad})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      o.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                      o.estado === 'aprobado'  ? 'bg-green-100 text-green-700' :
                      o.estado === 'cancelado' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{o.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {o.estado === 'pendiente' && (
                        <>
                          <button onClick={() => handleCambiarEstado(o.idOrden, 'aprobado')}
                            className="text-green-500 hover:text-green-700 text-xs">Aprobar</button>
                          <button onClick={() => handleCambiarEstado(o.idOrden, 'cancelado')}
                            className="text-red-500 hover:text-red-700 text-xs">Cancelar</button>
                        </>
                      )}
                    </div>
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