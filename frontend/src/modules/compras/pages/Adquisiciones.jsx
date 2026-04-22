import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_ADQUISICIONES, GET_PROVEEDORES, GET_ORDENES_COMPRA } from '../graphql/queries'
import { GET_PRODUCTOS, GET_ALMACENES } from '../../inventario/graphql/queries'
import { CREAR_ADQUISICION, AGREGAR_DETALLE_ADQUISICION } from '../graphql/mutations'

export default function Adquisiciones() {
  const { data, loading, refetch } = useQuery(GET_ADQUISICIONES)
  const { data: dataProveedores }  = useQuery(GET_PROVEEDORES)
  const { data: dataOrdenes }      = useQuery(GET_ORDENES_COMPRA)
  const { data: dataProductos }    = useQuery(GET_PRODUCTOS)
  const { data: dataAlmacenes }    = useQuery(GET_ALMACENES)
  const [crearAdq]                 = useMutation(CREAR_ADQUISICION)
  const [agregarDetalle]           = useMutation(AGREGAR_DETALLE_ADQUISICION)
  const [modo, setModo]            = useState('lista')
  const [adqSel, setAdqSel]        = useState(null)
  const [mensaje, setMensaje]      = useState('')

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

  const [formAdq, setFormAdq] = useState({ fecha: '', idProveedor: '', idOrden: '', glosa: '' })
  const [formDetalle, setFormDetalle] = useState({ idProducto: '', idAlmacen: '', cantidad: '', precioUni: '' })

  const handleCrearAdq = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearAdq({
        variables: {
          fecha:       formAdq.fecha,
          idProveedor: parseInt(formAdq.idProveedor),
          idOrden:     formAdq.idOrden ? parseInt(formAdq.idOrden) : null,
          glosa:       formAdq.glosa || null,
          idUsuario:   parseInt(usuario?.idUsuario),
        }
      })
      if (res.crearAdquisicion.ok) {
        setMensaje('Adquisición creada')
        setAdqSel(res.crearAdquisicion.adquisicion)
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
          idAdquisicion: parseInt(adqSel.idAdquisicion),
          idProducto:    parseInt(formDetalle.idProducto),
          idAlmacen:     parseInt(formDetalle.idAlmacen),
          cantidad:      formDetalle.cantidad,
          precioUni:     formDetalle.precioUni,
        }
      })
      setMensaje(res.agregarDetalleAdquisicion.mensaje)
      if (res.agregarDetalleAdquisicion.ok) {
        setFormDetalle({ idProducto: '', idAlmacen: '', cantidad: '', precioUni: '' })
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
        <h2 className="text-xl font-bold text-gray-800">Adquisiciones</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje(''); setAdqSel(null) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' || modo === 'detalle' ? 'Ver lista' : '+ Nueva Adquisición'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <form onSubmit={handleCrearAdq} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Nueva Adquisición</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha</label>
              <input type="date" value={formAdq.fecha} onChange={(e) => setFormAdq({ ...formAdq, fecha: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Proveedor</label>
              <select value={formAdq.idProveedor} onChange={(e) => setFormAdq({ ...formAdq, idProveedor: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Selecciona --</option>
                {dataProveedores?.proveedores.map((p) => <option key={p.idProveedor} value={p.idProveedor}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Orden de Compra (opcional)</label>
              <select value={formAdq.idOrden} onChange={(e) => setFormAdq({ ...formAdq, idOrden: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Sin orden --</option>
                {dataOrdenes?.ordenesCompra
                  .filter((o) => o.estado === 'aprobado')
                  .map((o) => <option key={o.idOrden} value={o.idOrden}>Orden #{o.idOrden} — {o.idProveedor?.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Glosa</label>
              <input type="text" value={formAdq.glosa} onChange={(e) => setFormAdq({ ...formAdq, glosa: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <button type="submit" className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Crear Adquisición
          </button>
        </form>
      )}

      {modo === 'detalle' && adqSel && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            Recibir productos — Adquisición #{adqSel.idAdquisicion}
          </h3>
          <form onSubmit={handleAgregarDetalle}>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Producto</label>
                <select value={formDetalle.idProducto} onChange={(e) => setFormDetalle({ ...formDetalle, idProducto: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">-- Selecciona --</option>
                  {dataProductos?.productos.map((p) => <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Almacén destino</label>
                <select value={formDetalle.idAlmacen} onChange={(e) => setFormDetalle({ ...formDetalle, idAlmacen: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">-- Selecciona --</option>
                  {dataAlmacenes?.almacenes.map((a) => <option key={a.idAlmacen} value={a.idAlmacen}>{a.nombre}</option>)}
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
              Recibir Producto
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
                <th className="px-4 py-3 text-left">Orden</th>
                <th className="px-4 py-3 text-left">Productos recibidos</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.adquisiciones.map((a) => (
                <tr key={a.idAdquisicion} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{a.idAdquisicion}</td>
                  <td className="px-4 py-3">{a.fecha}</td>
                  <td className="px-4 py-3">{a.idProveedor?.nombre || '—'}</td>
                  <td className="px-4 py-3">{a.idOrden ? `#${a.idOrden.idOrden}` : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {a.detalles.map((d) => (
                        <span key={d.idDetalleAdq} className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                          {d.idProducto.nombre} ({d.cantidad}) → {d.idAlmacen.nombre}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      a.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{a.estado}</span>
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