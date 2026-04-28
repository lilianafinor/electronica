import { useQuery, useMutation } from '@apollo/client'
import { useState, useEffect } from 'react'
import { GET_NOTAS_VENTA, GET_CLIENTES } from '../graphql/queries'
import { GET_PRODUCTOS, GET_PRODUCTOS_ALMACEN } from '../../inventario/graphql/queries'
import { CREAR_NOTA_VENTA, AGREGAR_DETALLE_VENTA, CANCELAR_VENTA } from '../graphql/mutations'

export default function NotasVenta() {
  const { data, loading, refetch } = useQuery(GET_NOTAS_VENTA)
  const { data: dataClientes }     = useQuery(GET_CLIENTES)
  const { data: dataProductos }    = useQuery(GET_PRODUCTOS)
  const { data: dataStock }        = useQuery(GET_PRODUCTOS_ALMACEN)
  const [crearVenta]               = useMutation(CREAR_NOTA_VENTA)
  const [agregarDetalle]           = useMutation(AGREGAR_DETALLE_VENTA)
  const [cancelarVenta]            = useMutation(CANCELAR_VENTA)
  const [modo, setModo]            = useState('lista')
  const [ventaSel, setVentaSel]    = useState(null)
  const [mensaje, setMensaje]      = useState('')

  const usuario   = JSON.parse(localStorage.getItem('usuario') || 'null')
  const hoy       = new Date().toISOString().split('T')[0]

  const [formVenta, setFormVenta] = useState({
    fechaVenta: hoy,
    idCliente:  '',
    glosa:      '',
    tipoPago:   'qr'
  })

  const [formDetalle, setFormDetalle] = useState({
    idProducto: '',
    idAlmacen:  '',
    cantidad:   '',
    precioUni:  '',
    unidad:     '',
    esEntero:   true
  })

  const handleProductoChange = (idProducto) => {
    if (!idProducto) {
      setFormDetalle({ idProducto: '', idAlmacen: '', cantidad: '', precioUni: '', unidad: '', esEntero: true })
      return
    }

    const producto  = dataProductos?.productos.find((p) => p.idProducto === idProducto)
    const stockItem = dataStock?.productosAlmacen.find((pa) => pa.idProducto.idProducto === idProducto)
    const unidad    = producto?.idUnidad?.nombre || ''
    const esEntero  = !['kg', 'litro', 'metro', 'lt', 'l'].includes(unidad.toLowerCase())

    setFormDetalle({
      idProducto: idProducto,
      idAlmacen:  stockItem?.idAlmacen?.idAlmacen || '',
      cantidad:   '',
      precioUni:  producto?.precio || '',
      unidad:     unidad,
      esEntero:   esEntero
    })
  }

  const handleCrearVenta = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearVenta({
        variables: {
          fechaVenta: formVenta.fechaVenta,
          idCliente:  parseInt(formVenta.idCliente),
          glosa:      formVenta.glosa || null,
          tipoPago:   formVenta.tipoPago,
          idUsuario:  parseInt(usuario?.idUsuario),
        }
      })
      if (res.crearNotaVenta.ok) {
        setMensaje(res.crearNotaVenta.mensaje)
        setVentaSel(res.crearNotaVenta.notaVenta)
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
          idVenta:    parseInt(ventaSel.idVenta),
          idProducto: parseInt(formDetalle.idProducto),
          idAlmacen:  parseInt(formDetalle.idAlmacen),
          cantidad:   formDetalle.cantidad.toString(),
          precioUni:  formDetalle.precioUni.toString(),
        }
      })
      setMensaje(res.agregarDetalleVenta.mensaje)
      if (res.agregarDetalleVenta.ok) {
        setFormDetalle({ idProducto: '', idAlmacen: '', cantidad: '', precioUni: '', unidad: '', esEntero: true })
        refetch()
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleCancelar = async (idVenta) => {
    if (!confirm('¿Cancelar esta venta? Se restaurará el stock.')) return
    try {
      const { data: res } = await cancelarVenta({ variables: { idVenta: parseInt(idVenta) } })
      setMensaje(res.cancelarVenta.mensaje)
      refetch()
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const stockDelProducto = (idProducto) =>
    dataStock?.productosAlmacen.find((pa) => pa.idProducto.idProducto === idProducto)

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Notas de Venta</h2>
        <button
          onClick={() => { setModo(modo === 'nuevo' ? 'lista' : 'nuevo'); setMensaje(''); setVentaSel(null) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' || modo === 'detalle' ? 'Ver lista' : '+ Nueva Venta'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <form onSubmit={handleCrearVenta} className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Nueva Venta</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha</label>
              <input type="date" value={formVenta.fechaVenta} readOnly
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cliente</label>
              <select value={formVenta.idCliente} onChange={(e) => setFormVenta({ ...formVenta, idCliente: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Selecciona --</option>
                {dataClientes?.clientes.map((c) => (
                  <option key={c.idCliente} value={c.idCliente}>{c.nombreCompleto}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo de Pago</label>
              <input type="text" value="QR" readOnly
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Glosa</label>
              <input type="text" value={formVenta.glosa} onChange={(e) => setFormVenta({ ...formVenta, glosa: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <button type="submit" className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Crear Venta
          </button>
        </form>
      )}

      {modo === 'detalle' && ventaSel && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            Agregar artículos a Venta #{ventaSel.idVenta}
          </h3>
          <form onSubmit={handleAgregarDetalle}>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Artículo</label>
                <select value={formDetalle.idProducto} onChange={(e) => handleProductoChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">-- Selecciona --</option>
                  {dataProductos?.productos.map((p) => (
                    <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Almacén</label>
                <input type="text"
                  value={formDetalle.idAlmacen
                    ? dataStock?.productosAlmacen.find(
                        (pa) => pa.idAlmacen.idAlmacen === formDetalle.idAlmacen
                      )?.idAlmacen.nombre || 'Sin stock'
                    : '—'
                  }
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Cantidad {formDetalle.unidad && `(${formDetalle.unidad})`}
                  {formDetalle.idProducto && (
                    <span className="text-blue-600 ml-1">
                      Stock: {stockDelProducto(formDetalle.idProducto)?.stock || 0}
                    </span>
                  )}
                </label>
                <input type="number" value={formDetalle.cantidad}
                  onChange={(e) => setFormDetalle({ ...formDetalle, cantidad: e.target.value })}
                  step={formDetalle.esEntero ? '1' : '0.01'} min="1"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Precio Unitario</label>
                <input type="text" value={formDetalle.precioUni} readOnly
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" />
              </div>
            </div>

            {formDetalle.idProducto && formDetalle.cantidad && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">
                  Subtotal: Bs. {(parseFloat(formDetalle.cantidad || 0) * parseFloat(formDetalle.precioUni || 0)).toFixed(2)}
                </p>
              </div>
            )}

            {mensaje && (
              <p className={`text-sm mt-2 ${mensaje.includes('insuficiente') ? 'text-red-600' : 'text-green-600'}`}>
                {mensaje}
              </p>
            )}
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
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Tipo Pago</th>
                <th className="px-4 py-3 text-left">Artículos</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.notasVenta.map((v) => (
                <tr key={v.idVenta} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{v.idVenta}</td>
                  <td className="px-4 py-3">{v.fechaVenta}</td>
                  <td className="px-4 py-3">{v.idCliente?.nombreCompleto || '—'}</td>
                  <td className="px-4 py-3 font-medium text-green-700">Bs. {v.montoTotal}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {v.tipoPago}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {v.detalles.map((d) => (
                        <span key={d.idDetalleVenta} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          {d.idProducto.nombre} ({d.cantidad}) Bs.{d.precioSubtotal}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      v.estado === 'activo'    ? 'bg-green-100 text-green-700' :
                      v.estado === 'cancelado' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{v.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    {v.estado === 'activo' && (
                      <button onClick={() => handleCancelar(v.idVenta)}
                        className="text-red-500 hover:text-red-700 text-xs">
                        Cancelar
                      </button>
                    )}
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