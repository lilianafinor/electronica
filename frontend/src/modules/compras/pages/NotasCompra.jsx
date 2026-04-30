import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { useState } from 'react'
import { GET_NOTAS_COMPRA, GET_PROVEEDORES_POR_ARTICULO } from '../graphql/queries'
import { GET_PRODUCTOS } from '../../inventario/graphql/queries'
import { CREAR_NOTA_COMPRA, AGREGAR_DETALLE_NOTA_COMPRA } from '../graphql/mutations'

function TablaProveedores({ proveedores, onSeleccionar }) {
  if (!proveedores || proveedores.length === 0) {
    return (
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-sm text-yellow-700">Ningún proveedor tiene este artículo en catálogo.</div>
      </div>
    )
  }
  return (
    <div className="mt-3">
      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Proveedores disponibles</div>
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
          <tr>
            <th className="px-3 py-2 text-left">Proveedor</th>
            <th className="px-3 py-2 text-left">Teléfono</th>
            <th className="px-3 py-2 text-right">Precio unit.</th>
            <th className="px-3 py-2 text-center">Stock disp.</th>
            <th className="px-3 py-2 text-center">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {proveedores.map((p) => (
            <tr key={p.idCatalogo} className="hover:bg-blue-50">
              <td className="px-3 py-2 font-medium text-gray-800">{p.idProveedor?.nombre}</td>
              <td className="px-3 py-2 text-gray-500">{p.idProveedor?.telefono || '—'}</td>
              <td className="px-3 py-2 text-right font-semibold text-green-700">
                {'Bs. ' + parseFloat(p.precioUnitario).toFixed(2)}
              </td>
              <td className="px-3 py-2 text-center">
                <span className={parseFloat(p.stockDisponible) <= 5
                  ? 'px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700'
                  : 'px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700'
                }>
                  {p.stockDisponible}
                </span>
              </td>
              <td className="px-3 py-2 text-center">
                <button
                  onClick={() => onSeleccionar(p)}
                  className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-700"
                >
                  Seleccionar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function NotasCompra() {
  const { data, loading, refetch }  = useQuery(GET_NOTAS_COMPRA, { fetchPolicy: 'network-only' })
  const { data: dataProductos }     = useQuery(GET_PRODUCTOS, { fetchPolicy: 'network-only' })
  const [crearNota]                 = useMutation(CREAR_NOTA_COMPRA)
  const [agregarDetalle]            = useMutation(AGREGAR_DETALLE_NOTA_COMPRA)
  const [buscarProveedores, { data: dataProveedoresArticulo, loading: loadingProveedores }]
                                    = useLazyQuery(GET_PROVEEDORES_POR_ARTICULO, { fetchPolicy: 'network-only' })

  const [modo, setModo]             = useState('lista')
  const [notaSel, setNotaSel]       = useState(null)
  const [mensaje, setMensaje]       = useState('')
  const [detallesLocales, setDetallesLocales] = useState([])
  const [totalLocal, setTotalLocal] = useState(0)

  const [busquedaArticulo, setBusquedaArticulo]         = useState('')
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null)
  const [cantidad, setCantidad]                         = useState('')

  const [formNota, setFormNota] = useState({
    fechaCompra:   new Date().toISOString().split('T')[0],
    nroFactura:    '',
    glosa:         '',
    tipoPago:      'contado'
  })

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

  const articulosFiltrados = busquedaArticulo.trim().length >= 2
    ? (dataProductos?.productos || []).filter((p) =>
        p.nombre.toLowerCase().includes(busquedaArticulo.toLowerCase())
      )
    : []

  const handleSeleccionarArticulo = (articulo) => {
    setArticuloSeleccionado(articulo)
    setBusquedaArticulo(articulo.nombre)
    setProveedorSeleccionado(null)
    setCantidad('')
    buscarProveedores({ variables: { idProducto: parseInt(articulo.idProducto) } })
  }

  const handleSeleccionarProveedor = (catalogo) => {
    setProveedorSeleccionado(catalogo)
    setMensaje('')
  }

  const handleCrearNota = async () => {
    if (!proveedorSeleccionado) { setMensaje('Debes seleccionar un proveedor'); return }
    try {
      const { data: res } = await crearNota({
        variables: {
          fechaCompra: formNota.fechaCompra,
          idProveedor: parseInt(proveedorSeleccionado.idProveedor.idProveedor),
          nroFactura:  formNota.nroFactura || null,
          glosa:       formNota.glosa || null,
          tipoPago:    formNota.tipoPago,
          idUsuario:   parseInt(usuario?.idUsuario),
        }
      })
      if (res.crearNotaCompra.ok) {
        setNotaSel(res.crearNotaCompra.notaCompra)
        setModo('detalle')
        setMensaje('')
        refetch()
      } else {
        setMensaje('Error al crear nota')
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const handleAgregarDetalle = async () => {
    if (!articuloSeleccionado || !proveedorSeleccionado || !cantidad) {
      setMensaje('Selecciona artículo, proveedor y cantidad')
      return
    }
    try {
      const { data: res } = await agregarDetalle({
        variables: {
          idCompra:   parseInt(notaSel.idCompra),
          idProducto: parseInt(articuloSeleccionado.idProducto),
          cantidad:   String(cantidad),
          precioUni:  String(proveedorSeleccionado.precioUnitario),
        }
      })
      if (res.agregarDetalleNotaCompra.ok) {
        const cant     = parseFloat(cantidad)
        const precio   = parseFloat(proveedorSeleccionado.precioUnitario)
        setDetallesLocales((prev) => [...prev, {
          id:              Date.now(),
          nombreProducto:  articuloSeleccionado.nombre,
          nombreProveedor: proveedorSeleccionado.idProveedor?.nombre,
          cantidad:        cant,
          precioUni:       precio,
          subtotal:        cant * precio,
        }])
        setTotalLocal((prev) => prev + cantidad * precio)
        setBusquedaArticulo('')
        setArticuloSeleccionado(null)
        setProveedorSeleccionado(null)
        setCantidad('')
        setMensaje('Artículo agregado correctamente')
        refetch()
      } else {
        setMensaje('Error al agregar artículo')
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  const resetForm = () => {
    setModo('lista'); setNotaSel(null); setDetallesLocales([]); setTotalLocal(0)
    setBusquedaArticulo(''); setArticuloSeleccionado(null)
    setProveedorSeleccionado(null); setCantidad(''); setMensaje('')
    setFormNota({ fechaCompra: new Date().toISOString().split('T')[0], nroFactura: '', glosa: '', tipoPago: 'contado' })
  }

  if (loading) return <div className="p-4">Cargando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Notas de Compra</h2>
        <button
          onClick={() => { if (modo === 'nuevo' || modo === 'detalle') { resetForm() } else { setModo('nuevo') } }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {modo === 'nuevo' || modo === 'detalle' ? 'Ver lista' : '+ Nueva Nota'}
        </button>
      </div>

      {modo === 'nuevo' && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="font-semibold text-gray-700 mb-4">Nueva Nota de Compra</div>

          {/* Datos de la nota */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Fecha</div>
              <input type="date" value={formNota.fechaCompra}
                onChange={(e) => setFormNota({ ...formNota, fechaCompra: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Nro. Transacción</div>
              <input type="text" value={formNota.nroFactura}
                onChange={(e) => setFormNota({ ...formNota, nroFactura: e.target.value })}
                placeholder="Opcional"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Tipo de Pago</div>
              <select value={formNota.tipoPago}
                onChange={(e) => setFormNota({ ...formNota, tipoPago: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="contado">Contado</option>
                <option value="credito">Crédito</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Glosa</div>
              <input type="text" value={formNota.glosa}
                onChange={(e) => setFormNota({ ...formNota, glosa: e.target.value })}
                placeholder="Opcional"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Buscador de artículo */}
          <div className="border-t pt-4">
            <div className="font-medium text-gray-700 mb-3">Buscar artículo a comprar</div>
            <div className="relative">
              <input type="text" value={busquedaArticulo}
                onChange={(e) => { setBusquedaArticulo(e.target.value); setArticuloSeleccionado(null); setProveedorSeleccionado(null) }}
                placeholder="Escribe el nombre del artículo..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {articulosFiltrados.length > 0 && !articuloSeleccionado && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {articulosFiltrados.map((p) => (
                    <button key={p.idProducto} onClick={() => handleSeleccionarArticulo(p)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0">
                      <div className="font-medium text-gray-800">{p.nombre}</div>
                      <div className="text-xs text-gray-500">{(p.idMarca?.nombre || '') + ' · ' + (p.idCategoria?.nombre || '')}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {articuloSeleccionado && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-blue-800">{articuloSeleccionado.nombre}</div>
                  <div className="text-xs text-blue-600">
                    {(articuloSeleccionado.idMarca?.nombre || '—') + ' · ' + (articuloSeleccionado.idCategoria?.nombre || '—')}
                  </div>
                </div>
                <button onClick={() => { setArticuloSeleccionado(null); setBusquedaArticulo(''); setProveedorSeleccionado(null) }}
                  className="text-xs text-red-400 hover:text-red-600">
                  Cambiar
                </button>
              </div>
            )}

            {articuloSeleccionado && (
              loadingProveedores
                ? <div className="mt-3 text-sm text-gray-500">Buscando proveedores...</div>
                : <TablaProveedores
                    proveedores={dataProveedoresArticulo?.proveedoresPorArticulo}
                    onSeleccionar={handleSeleccionarProveedor}
                  />
            )}

            {proveedorSeleccionado && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-green-800">
                      {'Proveedor: ' + proveedorSeleccionado.idProveedor?.nombre}
                    </div>
                    <div className="text-xs text-green-600">
                      {'Precio: Bs. ' + parseFloat(proveedorSeleccionado.precioUnitario).toFixed(2) +
                       ' · Stock disponible: ' + proveedorSeleccionado.stockDisponible}
                    </div>
                  </div>
                  <button onClick={() => setProveedorSeleccionado(null)}
                    className="text-xs text-red-400 hover:text-red-600">Cambiar</button>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Cantidad a comprar</div>
                    <input type="number" value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      min="1" placeholder="0"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Precio unitario</div>
                    <input type="text" readOnly
                      value={'Bs. ' + parseFloat(proveedorSeleccionado.precioUnitario).toFixed(2)}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" />
                  </div>
                  {cantidad && (
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">Subtotal</div>
                      <input type="text" readOnly
                        value={'Bs. ' + (parseFloat(cantidad) * parseFloat(proveedorSeleccionado.precioUnitario)).toFixed(2)}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Artículos ya agregados */}
          {detallesLocales.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Artículos en esta nota:</div>
              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Artículo</th>
                    <th className="px-3 py-2 text-left">Proveedor</th>
                    <th className="px-3 py-2 text-center">Cant.</th>
                    <th className="px-3 py-2 text-right">P. Unit.</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detallesLocales.map((d) => (
                    <tr key={d.id}>
                      <td className="px-3 py-2">{d.nombreProducto}</td>
                      <td className="px-3 py-2 text-gray-500">{d.nombreProveedor}</td>
                      <td className="px-3 py-2 text-center">{d.cantidad}</td>
                      <td className="px-3 py-2 text-right">{'Bs. ' + d.precioUni.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-medium text-green-700">{'Bs. ' + d.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan="4" className="px-3 py-2 text-right font-semibold text-gray-700">Total:</td>
                    <td className="px-3 py-2 text-right font-bold text-green-700">{'Bs. ' + totalLocal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {mensaje && (
            <div className={mensaje.includes('Error') ? 'text-sm mt-3 text-red-500' : 'text-sm mt-3 text-green-600'}>
              {mensaje}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {!notaSel && proveedorSeleccionado && cantidad && (
              <button onClick={handleCrearNota}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Crear Nota y Agregar Artículo
              </button>
            )}
            {notaSel && proveedorSeleccionado && cantidad && (
              <button onClick={handleAgregarDetalle}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                + Agregar artículo
              </button>
            )}
            {notaSel && (
              <button onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
                Finalizar nota
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista de notas */}
      {modo === 'lista' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Proveedor</th>
                <th className="px-4 py-3 text-left">Nro. Transacción</th>
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
                  <td className="px-4 py-3 font-medium text-green-700">{'Bs. ' + parseFloat(n.totalCompra).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{n.tipoPago}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {n.detalles.map((d) => (
                        <span key={d.idDetalleCompra} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          {d.idProducto.nombre + ' (' + d.cantidad + ')'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={n.estado === 'activo'
                      ? 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'
                      : 'px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'
                    }>{n.estado}</span>
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