import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_NOTAS_INGRESO, GET_PRODUCTOS, GET_ALMACENES } from '../graphql/queries'
import { CREAR_NOTA_INGRESO, AGREGAR_DETALLE_INGRESO } from '../graphql/mutations'

export default function Ingresos() {
  const { data, loading, refetch } = useQuery(GET_NOTAS_INGRESO)
  const { data: dataProductos }    = useQuery(GET_PRODUCTOS)
  const { data: dataAlmacenes }    = useQuery(GET_ALMACENES)
  const [crearNota]                = useMutation(CREAR_NOTA_INGRESO)
  const [agregarDetalle]           = useMutation(AGREGAR_DETALLE_INGRESO)
  const [modo, setModo]            = useState('lista')
  const [notaSel, setNotaSel]      = useState(null)
  const [mensaje, setMensaje]      = useState('')

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

  const [formNota, setFormNota] = useState({ fecha: '', glosa: '', motivo: '' })
  const [formDetalle, setFormDetalle] = useState({ idProducto: '', idAlmacen: '', cantidad: '', observacion: '' })

  const handleCrearNota = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearNota({
        variables: {
          fecha:     formNota.fecha,
          glosa:     formNota.glosa || null,
          motivo:    formNota.motivo || null,
          idUsuario: parseInt(usuario?.idUsuario),
        }
      })
      if (res.crearNotaIngreso.ok) {
        setMensaje('Nota de ingreso creada')
        setNotaSel(res.crearNotaIngreso.notaIngreso)
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
          idIngreso:   parseInt(notaSel.idIngreso),
          idProducto:  parseInt(formDetalle.idProducto),
          idAlmacen:   parseInt(formDetalle.idAlmacen),
          cantidad:    formDetalle.cantidad,
          observacion: formDetalle.observacion || null,
        }
      })
      if (res.agregarDetalleIngreso.ok) {
        setMensaje('Detalle agregado correctamente')
        setFormDetalle({ idProducto: '', idAlmacen: '', cantidad: '', observacion: '' })
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
        <h2 className="text-xl font-bold text-gray-800">Notas de Ingreso</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje(''); setNotaSel(null) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' || modo === 'detalle' ? 'Ver lista' : '+ Nueva Nota'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <form onSubmit={handleCrearNota} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Nueva Nota de Ingreso</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha</label>
              <input type="date" value={formNota.fecha} onChange={(e) => setFormNota({ ...formNota, fecha: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Motivo</label>
              <input type="text" value={formNota.motivo} onChange={(e) => setFormNota({ ...formNota, motivo: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
            Agregar productos a Nota #{notaSel.idIngreso}
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
                <label className="block text-sm text-gray-600 mb-1">Almacén</label>
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
                <label className="block text-sm text-gray-600 mb-1">Observación</label>
                <input type="text" value={formDetalle.observacion} onChange={(e) => setFormDetalle({ ...formDetalle, observacion: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                <th className="px-4 py-3 text-left">Motivo</th>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Productos</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.notasIngreso.map((n) => (
                <tr key={n.idIngreso} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{n.idIngreso}</td>
                  <td className="px-4 py-3">{n.fecha}</td>
                  <td className="px-4 py-3">{n.motivo || '—'}</td>
                  <td className="px-4 py-3">{n.idUsuario?.username || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {n.detalles.map((d) => (
                        <span key={d.idDetalleIngreso} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
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