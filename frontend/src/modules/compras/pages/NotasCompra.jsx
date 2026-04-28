import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_NOTAS_COMPRA, GET_PROVEEDORES } from '../graphql/queries'
import { GET_PRODUCTOS } from '../../inventario/graphql/queries'
import { CREAR_NOTA_COMPRA, AGREGAR_DETALLE_NOTA_COMPRA } from '../graphql/mutations'

export default function NotasCompra() {
  const { data, loading, refetch } = useQuery(GET_NOTAS_COMPRA)
  const { data: dataProveedores }  = useQuery(GET_PROVEEDORES)
  const { data: dataProductos }    = useQuery(GET_PRODUCTOS)
  const [crearNota]                = useMutation(CREAR_NOTA_COMPRA)
  const [agregarDetalle]           = useMutation(AGREGAR_DETALLE_NOTA_COMPRA)
  const [modo, setModo]            = useState('lista')
  const [notaSel, setNotaSel]      = useState(null)
  const [mensaje, setMensaje]      = useState('')

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

  const [formNota, setFormNota] = useState({
    fechaCompra: '', idProveedor: '', nroFactura: '', glosa: '', tipoPago: 'contado'
  })
  const [formDetalle, setFormDetalle] = useState({ idProducto: '', cantidad: '', precioUni: '' })

  const handleCrearNota = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearNota({
        variables: {
          fechaCompra: formNota.fechaCompra,
          idProveedor: parseInt(formNota.idProveedor),
          nroFactura:  formNota.nroFactura || null,
          glosa:       formNota.glosa || null,
          tipoPago:    formNota.tipoPago,
          idUsuario:   parseInt(usuario?.idUsuario),
        }
      })
      if (res.crearNotaCompra.ok) {
        setMensaje('Nota de compra creada')
        setNotaSel(res.crearNotaCompra.notaCompra)
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
          idCompra:   parseInt(notaSel.idCompra),
          idProducto: parseInt(formDetalle.idProducto),
          cantidad:   formDetalle.cantidad,
          precioUni:  formDetalle.precioUni,
        }
      })
      if (res.agregarDetalleNotaCompra.ok) {
        setMensaje('Artículo agregado')
        setFormDetalle({ idProducto: '', cantidad: '', precioUni: '' })
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
        <h2 className="text-xl font-bold text-gray-800">Notas de Compra</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje(''); setNotaSel(null) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' || modo === 'detalle' ? 'Ver lista' : '+ Nueva Nota'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <form onSubmit={handleCrearNota} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Nueva Nota de Compra</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha</label>
              <input type="date" value={formNota.fechaCompra} onChange={(e) => setFormNota({ ...formNota, fechaCompra: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Proveedor</label>
              <select value={formNota.idProveedor} onChange={(e) => setFormNota({ ...formNota, idProveedor: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Selecciona --</option>
                {dataProveedores?.proveedores.map((p) => <option key={p.idProveedor} value={p.idProveedor}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nro. Factura</label>
              <input type="text" value={formNota.nroFactura} onChange={(e) => setFormNota({ ...formNota, nroFactura: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo de Pago</label>
              <select value={formNota.tipoPago} onChange={(e) => setFormNota({ ...formNota, tipoPago: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="contado">Contado</option>
                <option value="credito">Crédito</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Glosa</label>
              <input type="text" value={formNota.glosa} onChange={(e) => setFormNota({ ...formNota, glosa: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <button type="submit" className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Crear Nota
          </button>
        </form>
      )}

      {modo === 'detalle' && notaSel && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            Agregar artículos a Nota #{notaSel.idCompra}
          </h3>
          <form onSubmit={handleAgregarDetalle}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Artículo</label>
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
              Agregar Artículo
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
                <th className="px-4 py-3 text-left">Nro. Factura</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Tipo Pago</th>
                <th className="px-4 py-3 text-left">Artículos</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.notasCompra.map((n) => (
                <tr key={n.idCompra} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{n.idCompra}</td>
                  <td className="px-4 py-3">{n.fechaCompra}</td>
                  <td className="px-4 py-3">{n.idProveedor?.nombre || '—'}</td>
                  <td className="px-4 py-3">{n.nroFactura || '—'}</td>
                  <td className="px-4 py-3 font-medium">Bs. {n.totalCompra}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {n.tipoPago}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {n.detalles.map((d) => (
                        <span key={d.idDetalleCompra} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          {d.idProducto.nombre} ({d.cantidad})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      n.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{n.estado}</span>
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