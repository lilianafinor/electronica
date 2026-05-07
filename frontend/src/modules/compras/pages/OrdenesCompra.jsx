import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { useState } from 'react'
import { GET_ORDENES_COMPRA, GET_PROVEEDORES_POR_ARTICULO } from '../graphql/queries'
import { GET_PRODUCTOS } from '../../inventario/graphql/queries'
import {
  CREAR_ORDEN_COMPRA, AGREGAR_DETALLE_ORDEN,
  ACTUALIZAR_ESTADO_ORDEN, ELIMINAR_DETALLE_ORDEN,
} from '../graphql/mutations'

// ── Tabla de proveedores ──────────────────────────────────────────────────────
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
            <th className="px-3 py-2 text-left">Marca</th>
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
              <td className="px-3 py-2 text-gray-500">{p.idProducto?.idMarca?.nombre || '—'}</td>
              <td className="px-3 py-2 text-right font-semibold text-green-700">
                Bs. {parseFloat(p.precioUnitario).toFixed(2)}
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
                <button onClick={() => onSeleccionar(p)}
                  className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-700">
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

// ── Badge de estado ───────────────────────────────────────────────────────────
function BadgeEstado({ estado }) {
  const clases = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    aprobado:  'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
    recibido:  'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${clases[estado] || 'bg-gray-100 text-gray-700'}`}>
      {estado}
    </span>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function OrdenesCompra() {
  const { data, loading, refetch } = useQuery(GET_ORDENES_COMPRA, { fetchPolicy: 'network-only' })
  const { data: dataProductos }    = useQuery(GET_PRODUCTOS, { fetchPolicy: 'network-only' })
  const [crearOrden]               = useMutation(CREAR_ORDEN_COMPRA)
  const [agregarDetalle]           = useMutation(AGREGAR_DETALLE_ORDEN)
  const [eliminarDetalle]          = useMutation(ELIMINAR_DETALLE_ORDEN)
  const [actualizarEstado]         = useMutation(ACTUALIZAR_ESTADO_ORDEN)
  const [buscarProveedores, { data: dataProveedoresArticulo, loading: loadingProveedores }]
                                   = useLazyQuery(GET_PROVEEDORES_POR_ARTICULO, { fetchPolicy: 'network-only' })

  // modos: 'lista' | 'nuevo' | 'detalle' | 'editar'
  const [modo, setModo]             = useState('lista')
  const [ordenSel, setOrdenSel]     = useState(null)
  const [mensaje, setMensaje]       = useState('')
  const [detallesLocales, setDetallesLocales] = useState([])
  const [totalLocal, setTotalLocal] = useState(0)

  // fila expandida en la lista (ver detalle inline)
  const [filaExpandida, setFilaExpandida] = useState(null)

  const [busquedaArticulo, setBusquedaArticulo]         = useState('')
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null)
  const [cantidad, setCantidad]                         = useState('')

  const [formOrden, setFormOrden] = useState({
    fecha: new Date().toISOString().split('T')[0],
    glosa: '',
  })

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

  const articulosFiltrados = busquedaArticulo.trim().length >= 2
    ? (dataProductos?.productos || []).filter((p) =>
        p.nombre.toLowerCase().includes(busquedaArticulo.toLowerCase())
      )
    : []

  // ── helpers de búsqueda ───────────────────────────────────────────────────
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

  // ── crear orden (primer artículo) ─────────────────────────────────────────
  const handleCrearOrden = async () => {
    if (!proveedorSeleccionado) { setMensaje('Debes seleccionar un proveedor'); return }
    if (!cantidad) { setMensaje('Ingresa la cantidad'); return }
    try {
      const { data: res } = await crearOrden({
        variables: {
          fecha:       formOrden.fecha,
          idProveedor: parseInt(proveedorSeleccionado.idProveedor.idProveedor),
          glosa:       formOrden.glosa || null,
          idUsuario:   parseInt(usuario?.idUsuario),
        }
      })
      if (res.crearOrdenCompra.ok) {
        const nuevaOrden = res.crearOrdenCompra.ordenCompra
        setOrdenSel(nuevaOrden)
        await handleAgregarDetalle(nuevaOrden.idOrden)
        setModo('detalle')
        setMensaje('')
        refetch()
      } else {
        setMensaje('Error al crear orden')
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  // ── agregar artículo a orden existente ────────────────────────────────────
  const handleAgregarDetalle = async (idOrden) => {
    const idOrdenFinal = idOrden || ordenSel?.idOrden
    if (!articuloSeleccionado || !proveedorSeleccionado || !cantidad) {
      setMensaje('Selecciona artículo, proveedor y cantidad')
      return
    }
    try {
      const { data: res } = await agregarDetalle({
        variables: {
          idOrden:    parseInt(idOrdenFinal),
          idProducto: parseInt(articuloSeleccionado.idProducto),
          cantidad:   String(cantidad),
          precioUni:  String(proveedorSeleccionado.precioUnitario),
        }
      })
      if (res.agregarDetalleOrden.ok) {
        const cant   = parseFloat(cantidad)
        const precio = parseFloat(proveedorSeleccionado.precioUnitario)
        setDetallesLocales((prev) => [
          ...prev,
          {
            id:              res.agregarDetalleOrden.detalleOrden?.idDetalleOrden || Date.now(),
            idDetalleOrden:  res.agregarDetalleOrden.detalleOrden?.idDetalleOrden,
            nombreProducto:  articuloSeleccionado.nombre,
            marca:           articuloSeleccionado.idMarca?.nombre || '—',
            nombreProveedor: proveedorSeleccionado.idProveedor?.nombre,
            cantidad:        cant,
            precioUni:       precio,
            subtotal:        cant * precio,
          }
        ])
        setTotalLocal((prev) => prev + cant * precio)
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

  // ── quitar artículo ───────────────────────────────────────────────────────
  const handleEliminarDetalle = async (detalle) => {
    if (!confirm('¿Eliminar este artículo de la orden?')) return
    try {
      const { data: res } = await eliminarDetalle({
        variables: { idDetalleOrden: parseInt(detalle.idDetalleOrden) }
      })
      if (res.eliminarDetalleOrden.ok) {
        setDetallesLocales((prev) => prev.filter((d) => d.id !== detalle.id))
        setTotalLocal((prev) => prev - detalle.subtotal)
        setMensaje('Artículo eliminado de la orden')
        refetch()
      } else {
        setMensaje(res.eliminarDetalleOrden.mensaje)
      }
    } catch (err) {
      setMensaje('Error: ' + err.message)
    }
  }

  // ── cancelar orden (desde la lista) ──────────────────────────────────────
  const handleCancelarOrden = async (idOrden) => {
    if (!confirm('¿Cancelar esta orden? Esta acción no se puede deshacer.')) return
    await actualizarEstado({ variables: { idOrden: parseInt(idOrden), estado: 'cancelado' } })
    refetch()
  }

  // ── aprobar orden ─────────────────────────────────────────────────────────
  const handleAprobarOrden = async (idOrden) => {
    await actualizarEstado({ variables: { idOrden: parseInt(idOrden), estado: 'aprobado' } })
    refetch()
  }

  // ── abrir modo editar desde la lista ─────────────────────────────────────
  const handleEditarOrden = (orden) => {
    setOrdenSel(orden)
    // cargar los detalles existentes al estado local para mostrarlos
    const detalles = (orden.detalles || []).map((d) => ({
      id:              d.idDetalleOrden,
      idDetalleOrden:  d.idDetalleOrden,
      nombreProducto:  d.idProducto?.nombre,
      marca:           d.idProducto?.idMarca?.nombre || '—',
      nombreProveedor: orden.idProveedor?.nombre,
      cantidad:        parseFloat(d.cantidad),
      precioUni:       parseFloat(d.precioUni),
      subtotal:        parseFloat(d.subTotal),
    }))
    setDetallesLocales(detalles)
    setTotalLocal(detalles.reduce((s, d) => s + d.subtotal, 0))
    setBusquedaArticulo('')
    setArticuloSeleccionado(null)
    setProveedorSeleccionado(null)
    setCantidad('')
    setMensaje('')
    setModo('editar')
  }

  const resetForm = () => {
    setModo('lista')
    setOrdenSel(null)
    setDetallesLocales([])
    setTotalLocal(0)
    setBusquedaArticulo('')
    setArticuloSeleccionado(null)
    setProveedorSeleccionado(null)
    setCantidad('')
    setMensaje('')
    setFormOrden({ fecha: new Date().toISOString().split('T')[0], glosa: '' })
  }

  // ── tabla de detalles locales ─────────────────────────────────────────────
  const TablaDetalles = ({ detalles, mostrarEliminar = false }) => (
    <div className="mt-4">
      <div className="text-sm font-semibold text-gray-700 mb-2">Artículos en esta orden:</div>
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
          <tr>
            <th className="px-3 py-2 text-left">Artículo</th>
            <th className="px-3 py-2 text-left">Marca</th>
            <th className="px-3 py-2 text-left">Proveedor</th>
            <th className="px-3 py-2 text-center">Cantidad</th>
            <th className="px-3 py-2 text-right">P. Unit.</th>
            <th className="px-3 py-2 text-right">Subtotal</th>
            {mostrarEliminar && <th className="px-3 py-2 text-center">Acción</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {detalles.map((d) => (
            <tr key={d.id}>
              <td className="px-3 py-2">{d.nombreProducto}</td>
              <td className="px-3 py-2 text-gray-500">{d.marca}</td>
              <td className="px-3 py-2 text-gray-500">{d.nombreProveedor}</td>
              <td className="px-3 py-2 text-center">{d.cantidad}</td>
              <td className="px-3 py-2 text-right">Bs. {d.precioUni.toFixed(2)}</td>
              <td className="px-3 py-2 text-right font-medium text-green-700">Bs. {d.subtotal.toFixed(2)}</td>
              {mostrarEliminar && (
                <td className="px-3 py-2 text-center">
                  <button onClick={() => handleEliminarDetalle(d)}
                    className="text-red-500 hover:text-red-700 text-xs">
                    Quitar
                  </button>
                </td>
              )}
            </tr>
          ))}
          <tr className="bg-gray-50">
            <td colSpan={mostrarEliminar ? 6 : 5}
              className="px-3 py-2 text-right font-semibold text-gray-700">Total:</td>
            <td className="px-3 py-2 text-right font-bold text-green-700">
              Bs. {totalLocal.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )

  // ── bloque buscador + proveedor + cantidad (reutilizado en nuevo/detalle/editar) ──
  const BuscadorArticulo = ({ idOrdenActual }) => (
    <div className="border-t pt-4 mt-4">
      <div className="font-medium text-gray-700 mb-3">Agregar artículo</div>
      <div className="relative">
        <input type="text" value={busquedaArticulo}
          onChange={(e) => {
            setBusquedaArticulo(e.target.value)
            setArticuloSeleccionado(null)
            setProveedorSeleccionado(null)
          }}
          placeholder="Escribe el nombre del artículo..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {articulosFiltrados.length > 0 && !articuloSeleccionado && (
          <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
            {articulosFiltrados.map((p) => (
              <button key={p.idProducto} onClick={() => handleSeleccionarArticulo(p)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0">
                <div className="font-medium text-gray-800">{p.nombre}</div>
                <div className="text-xs text-gray-500">
                  {(p.idMarca?.nombre || '—') + ' · ' + (p.idCategoria?.nombre || '—')}
                </div>
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
            className="text-xs text-red-400 hover:text-red-600">Cambiar</button>
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
                Proveedor: {proveedorSeleccionado.idProveedor?.nombre}
              </div>
              <div className="text-xs text-green-600">
                Precio: Bs. {parseFloat(proveedorSeleccionado.precioUnitario).toFixed(2)}
                {' · Stock disponible: '}{proveedorSeleccionado.stockDisponible}
              </div>
            </div>
            <button onClick={() => setProveedorSeleccionado(null)}
              className="text-xs text-red-400 hover:text-red-600">Cambiar</button>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">Cantidad a ordenar</div>
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
  )

  if (loading) return <div className="p-4">Cargando...</div>

  return (
    <div>
      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Órdenes de Compra</h2>
        {modo === 'lista'
          ? (
            <button onClick={() => setModo('nuevo')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              + Nueva Orden
            </button>
          ) : (
            <button onClick={resetForm}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
              ← Ver lista
            </button>
          )
        }
      </div>

      {/* ── MODO NUEVO ─────────────────────────────────────────────────────── */}
      {modo === 'nuevo' && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="font-semibold text-gray-700 mb-4">Nueva Orden de Compra</div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <div className="text-sm text-gray-600 mb-1">Fecha</div>
              <input type="date" value={formOrden.fecha}
                onChange={(e) => setFormOrden({ ...formOrden, fecha: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Glosa</div>
              <input type="text" value={formOrden.glosa}
                onChange={(e) => setFormOrden({ ...formOrden, glosa: e.target.value })}
                placeholder="Opcional"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <BuscadorArticulo idOrdenActual={null} />

          {detallesLocales.length > 0 && (
            <TablaDetalles detalles={detallesLocales} mostrarEliminar={true} />
          )}

          {mensaje && (
            <div className={mensaje.includes('Error') ? 'text-sm mt-3 text-red-500' : 'text-sm mt-3 text-green-600'}>
              {mensaje}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {!ordenSel && proveedorSeleccionado && cantidad && (
              <button onClick={handleCrearOrden}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Crear Orden y Agregar Artículo
              </button>
            )}
            {ordenSel && proveedorSeleccionado && cantidad && (
              <button onClick={() => handleAgregarDetalle(null)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                + Agregar otro artículo
              </button>
            )}
            {ordenSel && (
              <button onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
                Guardar y salir
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── MODO DETALLE (después de crear, agregar más artículos) ─────────── */}
      {modo === 'detalle' && ordenSel && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="font-semibold text-gray-700 mb-4">
            Orden #{ordenSel.idOrden} — Agregar artículos
          </div>

          <BuscadorArticulo idOrdenActual={ordenSel.idOrden} />

          {detallesLocales.length > 0 && (
            <TablaDetalles detalles={detallesLocales} mostrarEliminar={true} />
          )}

          {mensaje && (
            <div className={mensaje.includes('Error') ? 'text-sm mt-3 text-red-500' : 'text-sm mt-3 text-green-600'}>
              {mensaje}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {proveedorSeleccionado && cantidad && (
              <button onClick={() => handleAgregarDetalle(null)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                + Agregar artículo
              </button>
            )}
            <button onClick={resetForm}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
              Guardar y salir
            </button>
          </div>
        </div>
      )}

      {/* ── MODO EDITAR (desde la lista, orden pendiente) ──────────────────── */}
      {modo === 'editar' && ordenSel && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="font-semibold text-gray-700">
              Editando Orden #{ordenSel.idOrden}
            </div>
            <BadgeEstado estado={ordenSel.estado} />
            <span className="text-xs text-gray-400">Proveedor: {ordenSel.idProveedor?.nombre}</span>
          </div>

          {/* Artículos actuales con opción de quitar */}
          {detallesLocales.length > 0 && (
            <TablaDetalles detalles={detallesLocales} mostrarEliminar={true} />
          )}
          {detallesLocales.length === 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 mb-4">
              Esta orden no tiene artículos. Agrega al menos uno antes de aprobarla.
            </div>
          )}

          {/* Buscador para agregar más artículos */}
          <BuscadorArticulo idOrdenActual={ordenSel.idOrden} />

          {proveedorSeleccionado && cantidad && (
            <div className="mt-3">
              <button onClick={() => handleAgregarDetalle(ordenSel.idOrden)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                + Agregar artículo a la orden
              </button>
            </div>
          )}

          {mensaje && (
            <div className={mensaje.includes('Error') ? 'text-sm mt-3 text-red-500' : 'text-sm mt-3 text-green-600'}>
              {mensaje}
            </div>
          )}

          <div className="flex gap-2 mt-4 border-t pt-4">
            <button onClick={resetForm}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
              Guardar y salir
            </button>
            <button
              onClick={async () => {
                await handleAprobarOrden(ordenSel.idOrden)
                resetForm()
              }}
              disabled={detallesLocales.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
              Aprobar orden
            </button>
            <button
              onClick={async () => {
                await handleCancelarOrden(ordenSel.idOrden)
                resetForm()
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
              Cancelar orden
            </button>
          </div>
        </div>
      )}

      {/* ── LISTA DE ÓRDENES ───────────────────────────────────────────────── */}
      {modo === 'lista' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Proveedor</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(data?.ordenesCompra || []).map((o) => (
                <>
                  {/* Fila principal */}
                  <tr key={o.idOrden}
                    className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">#{o.idOrden}</td>
                    <td className="px-4 py-3">{o.fecha}</td>
                    <td className="px-4 py-3">{o.idProveedor?.nombre || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">
                      Bs. {parseFloat(o.total || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEstado estado={o.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 items-center">
                        {/* Ver detalle (toggle inline) */}
                        <button
                          onClick={() => setFilaExpandida(filaExpandida === o.idOrden ? null : o.idOrden)}
                          className="text-blue-500 hover:text-blue-700 text-xs">
                          {filaExpandida === o.idOrden ? 'Ocultar' : 'Ver detalle'}
                        </button>

                        {/* Editar: solo pendiente */}
                        {o.estado === 'pendiente' && (
                          <button onClick={() => handleEditarOrden(o)}
                            className="text-yellow-600 hover:text-yellow-800 text-xs">
                            Editar
                          </button>
                        )}

                        {/* Aprobar: solo pendiente */}
                        {o.estado === 'pendiente' && (
                          <button onClick={() => handleAprobarOrden(o.idOrden)}
                            className="text-green-600 hover:text-green-800 text-xs">
                            Aprobar
                          </button>
                        )}

                        {/* Cancelar: solo pendiente */}
                        {o.estado === 'pendiente' && (
                          <button onClick={() => handleCancelarOrden(o.idOrden)}
                            className="text-red-500 hover:text-red-700 text-xs">
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Fila expandida: detalle de artículos */}
                  {filaExpandida === o.idOrden && (
                    <tr key={o.idOrden + '-detalle'} className="bg-gray-50 border-b border-gray-200">
                      <td colSpan="6" className="px-6 py-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Artículos de la orden #{o.idOrden}
                          {o.glosa ? ` — ${o.glosa}` : ''}
                        </div>
                        <table className="w-full text-sm">
                          <thead className="text-gray-500 text-xs uppercase border-b border-gray-200">
                            <tr>
                              <th className="pb-1 text-left">Artículo</th>
                              <th className="pb-1 text-center">Cantidad</th>
                              <th className="pb-1 text-right">P. Unit.</th>
                              <th className="pb-1 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {o.detalles.map((d) => (
                              <tr key={d.idDetalleOrden}>
                                <td className="py-1.5">{d.idProducto?.nombre}</td>
                                <td className="py-1.5 text-center">{d.cantidad}</td>
                                <td className="py-1.5 text-right">Bs. {parseFloat(d.precioUni).toFixed(2)}</td>
                                <td className="py-1.5 text-right font-medium text-green-700">
                                  Bs. {parseFloat(d.subTotal).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                            <tr className="border-t border-gray-200">
                              <td colSpan="3" className="py-1.5 text-right font-semibold text-gray-700">Total:</td>
                              <td className="py-1.5 text-right font-bold text-green-700">
                                Bs. {parseFloat(o.total || 0).toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        {o.estado === 'pendiente' && (
                          <div className="mt-2 text-xs text-gray-400">
                            Usa "Editar" para agregar o quitar artículos de esta orden.
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {(!data?.ordenesCompra || data.ordenesCompra.length === 0) && (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-400 text-sm">
                    No hay órdenes de compra registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}