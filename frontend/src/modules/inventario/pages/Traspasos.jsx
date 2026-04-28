import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import { GET_TRASPASOS, GET_PRODUCTOS, GET_ALMACENES } from '../graphql/queries'
import { CREAR_TRASPASO, AGREGAR_DETALLE_TRASPASO } from '../graphql/mutations'

export default function Traspasos() {
  const { data, loading, refetch } = useQuery(GET_TRASPASOS)
  const { data: dataProductos }    = useQuery(GET_PRODUCTOS)
  const { data: dataAlmacenes }    = useQuery(GET_ALMACENES)
  const [crearTraspaso]            = useMutation(CREAR_TRASPASO)
  const [agregarDetalle]           = useMutation(AGREGAR_DETALLE_TRASPASO)
  const [modo, setModo]            = useState('lista')
  const [traspasoSel, setTraspasoSel] = useState(null)
  const [mensaje, setMensaje]      = useState('')

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

  const [formTraspaso, setFormTraspaso] = useState({
    fecha: '', tipo: '', glosa: '', almacenOrigen: '', almacenDestino: ''
  })
  const [formDetalle, setFormDetalle] = useState({ idProducto: '', cantidad: '' })

  const handleCrearTraspaso = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearTraspaso({
        variables: {
          fecha:          formTraspaso.fecha,
          tipo:           formTraspaso.tipo || null,
          glosa:          formTraspaso.glosa || null,
          idUsuario:      parseInt(usuario?.idUsuario),
          almacenOrigen:  parseInt(formTraspaso.almacenOrigen),
          almacenDestino: parseInt(formTraspaso.almacenDestino),
        }
      })
      if (res.crearTraspaso.ok) {
        setMensaje(res.crearTraspaso.mensaje)
        setTraspasoSel(res.crearTraspaso.traspaso)
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
          idTraspaso: parseInt(traspasoSel.idTraspaso),
          idProducto: parseInt(formDetalle.idProducto),
          cantidad:   formDetalle.cantidad,
        }
      })
      setMensaje(res.agregarDetalleTraspaso.mensaje)
      if (res.agregarDetalleTraspaso.ok) {
        setFormDetalle({ idProducto: '', cantidad: '' })
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
        <h2 className="text-xl font-bold text-gray-800">Traspasos entre Almacenes</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje(''); setTraspasoSel(null) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' || modo === 'detalle' ? 'Ver lista' : '+ Nuevo Traspaso'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <form onSubmit={handleCrearTraspaso} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Nuevo Traspaso</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha</label>
              <input type="date" value={formTraspaso.fecha} onChange={(e) => setFormTraspaso({ ...formTraspaso, fecha: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo</label>
              <input type="text" value={formTraspaso.tipo} onChange={(e) => setFormTraspaso({ ...formTraspaso, tipo: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="interno, externo..." />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Glosa</label>
              <input type="text" value={formTraspaso.glosa} onChange={(e) => setFormTraspaso({ ...formTraspaso, glosa: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Almacén Origen</label>
              <select value={formTraspaso.almacenOrigen} onChange={(e) => setFormTraspaso({ ...formTraspaso, almacenOrigen: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Selecciona --</option>
                {dataAlmacenes?.almacenes.map((a) => <option key={a.idAlmacen} value={a.idAlmacen}>{a.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Almacén Destino</label>
              <select value={formTraspaso.almacenDestino} onChange={(e) => setFormTraspaso({ ...formTraspaso, almacenDestino: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Selecciona --</option>
                {dataAlmacenes?.almacenes
                  .filter((a) => a.idAlmacen !== parseInt(formTraspaso.almacenOrigen))
                  .map((a) => <option key={a.idAlmacen} value={a.idAlmacen}>{a.nombre}</option>)}
              </select>
            </div>
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <button type="submit" className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Crear Traspaso
          </button>
        </form>
      )}

      {modo === 'detalle' && traspasoSel && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            Agregar artículos al Traspaso #{traspasoSel.idTraspaso}
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
            </div>
            {mensaje && <p className={`text-sm mt-2 ${mensaje.includes('insuficiente') || mensaje.includes('no encontrado') ? 'text-red-600' : 'text-green-600'}`}>{mensaje}</p>}
            <button type="submit" className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
              Traspasar Artículo
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
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Origen</th>
                <th className="px-4 py-3 text-left">Destino</th>
                <th className="px-4 py-3 text-left">Artículos</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.traspasos.map((t) => (
                <tr key={t.idTraspaso} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{t.idTraspaso}</td>
                  <td className="px-4 py-3">{t.fecha}</td>
                  <td className="px-4 py-3">{t.tipo || '—'}</td>
                  <td className="px-4 py-3">{t.almacenOrigen?.nombre || '—'}</td>
                  <td className="px-4 py-3">{t.almacenDestino?.nombre || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {t.detalles.map((d) => (
                        <span key={d.idDetalleTraspaso} className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                          {d.idProducto.nombre} ({d.cantidad})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      t.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{t.estado}</span>
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