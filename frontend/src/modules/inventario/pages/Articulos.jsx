import { useQuery, useMutation } from '@apollo/client'
import { useState } from 'react'
import {
  GET_PRODUCTOS, GET_MARCAS, GET_CATEGORIAS,
  GET_UNIDADES, GET_PRODUCTOS_ALMACEN,
} from '../graphql/queries'
import { CREAR_PRODUCTO, ACTUALIZAR_PRODUCTO, ACTUALIZAR_LIMITES_STOCK } from '../graphql/mutations'

export default function Productos() {
  const { data, loading, refetch }  = useQuery(GET_PRODUCTOS)
  const { data: dataMarcas }        = useQuery(GET_MARCAS)
  const { data: dataCategorias }    = useQuery(GET_CATEGORIAS)
  const { data: dataUnidades }      = useQuery(GET_UNIDADES)
  const { data: dataStock, refetch: refetchStock } = useQuery(GET_PRODUCTOS_ALMACEN, { fetchPolicy: 'network-only' })

  const [crearProducto]      = useMutation(CREAR_PRODUCTO)
  const [actualizarProducto] = useMutation(ACTUALIZAR_PRODUCTO)
  const [actualizarLimites]  = useMutation(ACTUALIZAR_LIMITES_STOCK)

  const [modo, setModo]               = useState('lista')
  const [productoSel, setProductoSel] = useState(null)
  const [mensaje, setMensaje]         = useState('')
  const [filaExpandida, setFilaExpandida] = useState(null)
  const [limites, setLimites]         = useState(null)

  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: '',
    idMarca: '', idCategoria: '', idUnidad: '',
  })

  const getStockPorProducto = (idProducto) =>
    (dataStock?.productosAlmacen || []).filter(
      (pa) => String(pa.idProducto?.idProducto) === String(idProducto)
    )

  const getStockTotal = (idProducto) =>
    getStockPorProducto(idProducto).reduce((s, pa) => s + parseFloat(pa.stock || 0), 0)

  const handleCrear = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await crearProducto({
        variables: {
          nombre:      form.nombre,
          descripcion: form.descripcion || null,
          precio:      form.precio || '0',
          idMarca:     form.idMarca     ? parseInt(form.idMarca)     : null,
          idCategoria: form.idCategoria ? parseInt(form.idCategoria) : null,
          idUnidad:    form.idUnidad    ? parseInt(form.idUnidad)    : null,
        }
      })
      if (res.crearProducto.ok) {
        setMensaje('Artículo creado correctamente')
        setForm({ nombre: '', descripcion: '', precio: '', idMarca: '', idCategoria: '', idUnidad: '' })
        setModo('lista')
        refetch()
      }
    } catch (err) { setMensaje('Error: ' + err.message) }
  }

  const handleEditar = async (e) => {
    e.preventDefault()
    try {
      const { data: res } = await actualizarProducto({
        variables: {
          idProducto:  parseInt(productoSel.idProducto),
          nombre:      form.nombre      || null,
          descripcion: form.descripcion || null,
          precio:      form.precio      || null,
          idMarca:     form.idMarca     ? parseInt(form.idMarca)     : null,
          idCategoria: form.idCategoria ? parseInt(form.idCategoria) : null,
          idUnidad:    form.idUnidad    ? parseInt(form.idUnidad)    : null,
        }
      })
      if (res.actualizarProducto.ok) {
        setMensaje('Artículo actualizado')
        setModo('lista')
        refetch()
      }
    } catch (err) { setMensaje('Error: ' + err.message) }
  }

  const handleSeleccionar = (p) => {
    setProductoSel(p)
    setForm({
      nombre:      p.nombre,
      descripcion: p.descripcion || '',
      precio:      p.precio,
      idMarca:     p.idMarca?.idMarca         || '',
      idCategoria: p.idCategoria?.idCategoria || '',
      idUnidad:    p.idUnidad?.idUnidad       || '',
    })
    setModo('editar')
    setMensaje('')
  }

  const abrirLimites = (pa) => {
    setLimites({
      idProducto:    pa.idProducto?.idProducto,
      idAlmacen:     pa.idAlmacen?.idAlmacen,
      nombreAlmacen: pa.idAlmacen?.nombre,
      stockMin:      pa.stockMin || '',
      stockMax:      pa.stockMax || '',
      procesando:    false,
      mensaje:       '',
    })
  }

  const handleGuardarLimites = async () => {
    setLimites({ ...limites, procesando: true, mensaje: '' })
    try {
      const { data: res } = await actualizarLimites({
        variables: {
          idProducto: parseInt(limites.idProducto),
          idAlmacen:  parseInt(limites.idAlmacen),
          stockMin:   limites.stockMin !== '' ? String(limites.stockMin) : null,
          stockMax:   limites.stockMax !== '' ? String(limites.stockMax) : null,
        }
      })
      if (res.actualizarLimitesStock.ok) {
        await refetchStock()
        setLimites(null)
      } else {
        setLimites({ ...limites, procesando: false, mensaje: res.actualizarLimitesStock.mensaje })
      }
    } catch (err) {
      setLimites({ ...limites, procesando: false, mensaje: 'Error: ' + err.message })
    }
  }

  if (loading) return <p className="p-4">Cargando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Artículos</h2>
        {modo === 'lista'
          ? (
            <button onClick={() => { setModo('nuevo'); setMensaje('') }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              + Nuevo Artículo
            </button>
          ) : (
            <button onClick={() => { setModo('lista'); setMensaje('') }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
              ← Ver lista
            </button>
          )
        }
      </div>

      {/* ── Formulario crear / editar ─────────────────────────────────────── */}
      {(modo === 'nuevo' || modo === 'editar') && (
        <form onSubmit={modo === 'nuevo' ? handleCrear : handleEditar}
          className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            {modo === 'nuevo' ? 'Nuevo Artículo' : 'Editando: ' + productoSel?.nombre}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre</label>
              <input type="text" value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Descripción</label>
              <input type="text" value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Precio venta</label>
              <input type="text" value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Marca</label>
              <select value={form.idMarca}
                onChange={(e) => setForm({ ...form, idMarca: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Sin marca --</option>
                {dataMarcas?.marcas.map((m) => (
                  <option key={m.idMarca} value={m.idMarca}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Categoría</label>
              <select value={form.idCategoria}
                onChange={(e) => setForm({ ...form, idCategoria: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Sin categoría --</option>
                {dataCategorias?.categorias.map((c) => (
                  <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Unidad de medida</label>
              <select value={form.idUnidad}
                onChange={(e) => setForm({ ...form, idUnidad: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Sin unidad --</option>
                {dataUnidades?.unidadesMedida.map((u) => (
                  <option key={u.idUnidad} value={u.idUnidad}>{u.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          {mensaje && <p className="text-green-600 text-sm mt-2">{mensaje}</p>}
          <div className="flex gap-2 mt-3">
            <button type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              {modo === 'nuevo' ? 'Crear Artículo' : 'Guardar Cambios'}
            </button>
            <button type="button" onClick={() => setModo('lista')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* ── Tabla principal ───────────────────────────────────────────────── */}
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
                <th className="px-4 py-3 text-center">Stock total</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(data?.productos || []).map((p) => {
                const stockTotal   = getStockTotal(p.idProducto)
                const stockDetalle = getStockPorProducto(p.idProducto)
                const bajoDeMínimo = stockDetalle.some(
                  (pa) => parseFloat(pa.stock) <= parseFloat(pa.stockMin || 0) && parseFloat(pa.stockMin || 0) > 0
                )
                const expandida = filaExpandida === p.idProducto

                return (
                  <>
                    <tr key={p.idProducto} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{p.idProducto}</td>
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          {p.nombre}
                          {bajoDeMínimo && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700">
                              ⚠ bajo mínimo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{'Bs. ' + parseFloat(p.precio).toFixed(2)}</td>
                      <td className="px-4 py-3">{p.idMarca?.nombre || '—'}</td>
                      <td className="px-4 py-3">{p.idCategoria?.nombre || '—'}</td>
                      <td className="px-4 py-3">{p.idUnidad?.nombre || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={
                          stockTotal === 0
                            ? 'px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700'
                            : bajoDeMínimo
                            ? 'px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700'
                            : 'px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700'
                        }>
                          {stockTotal}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={p.estado === 'activo'
                          ? 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'
                          : 'px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'
                        }>{p.estado}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => {
                              setFilaExpandida(expandida ? null : p.idProducto)
                              setLimites(null)
                            }}
                            className="text-blue-500 hover:text-blue-700 text-xs">
                            {expandida ? 'Ocultar' : 'Ver stock'}
                          </button>
                          <button onClick={() => handleSeleccionar(p)}
                            className="text-yellow-600 hover:text-yellow-800 text-xs">
                            Editor
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Fila expandida: stock por almacén */}
                    {expandida && (
                      <tr key={p.idProducto + '-detalle'} className="bg-gray-50 border-b border-gray-200">
                        <td colSpan="9" className="px-6 py-3">
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            {'Stock por almacén — ' + p.nombre}
                          </div>
                          {stockDetalle.length === 0 ? (
                            <div className="text-sm text-gray-400">
                              Sin registros de stock. El stock se agrega automáticamente al confirmar una compra.
                            </div>
                          ) : (
                            <table className="w-full text-sm">
                              <thead className="text-gray-500 text-xs uppercase border-b border-gray-200">
                                <tr>
                                  <th className="pb-1 text-left">Almacén</th>
                                  <th className="pb-1 text-center">Stock actual</th>
                                  <th className="pb-1 text-center">Stock mínimo</th>
                                  <th className="pb-1 text-center">Stock máximo</th>
                                  <th className="pb-1 text-center">Estado</th>
                                  <th className="pb-1 text-center">Acción</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {stockDetalle.map((pa) => {
                                  const stk    = parseFloat(pa.stock || 0)
                                  const stkMin = parseFloat(pa.stockMin || 0)
                                  const bajo   = stkMin > 0 && stk <= stkMin
                                  const editandoEste =
                                    limites?.idProducto === pa.idProducto?.idProducto &&
                                    limites?.idAlmacen  === pa.idAlmacen?.idAlmacen
                                  return (
                                    <>
                                      <tr key={pa.idProductoAlmacen}>
                                        <td className="py-1.5 font-medium">{pa.idAlmacen?.nombre}</td>
                                        <td className="py-1.5 text-center font-semibold">
                                          <span className={
                                            stk === 0
                                              ? 'px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700'
                                              : bajo
                                              ? 'px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700'
                                              : 'px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700'
                                          }>{stk}</span>
                                        </td>
                                        <td className="py-1.5 text-center text-gray-500">{pa.stockMin || '—'}</td>
                                        <td className="py-1.5 text-center text-gray-500">{pa.stockMax || '—'}</td>
                                        <td className="py-1.5 text-center">
                                          {bajo
                                            ? <span className="text-xs text-orange-600 font-semibold">⚠ Bajo mínimo</span>
                                            : stk === 0
                                            ? <span className="text-xs text-red-600 font-semibold">Sin stock</span>
                                            : <span className="text-xs text-green-600">OK</span>
                                          }
                                        </td>
                                        <td className="py-1.5 text-center">
                                          <button
                                            onClick={() => editandoEste ? setLimites(null) : abrirLimites(pa)}
                                            className="text-purple-600 hover:text-purple-800 text-xs">
                                            {editandoEste ? 'Cancelar' : 'Editar límites'}
                                          </button>
                                        </td>
                                      </tr>

                                      {editandoEste && limites && (
                                        <tr key={pa.idProductoAlmacen + '-limites'}>
                                          <td colSpan="6" className="pb-3 pt-1">
                                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                              <div className="text-xs font-semibold text-purple-800 mb-2">
                                                {'Editar límites — ' + limites.nombreAlmacen}
                                              </div>
                                              <div className="flex gap-4 items-end">
                                                <div>
                                                  <label className="block text-xs text-gray-600 mb-1">Stock mínimo</label>
                                                  <input type="number" min="0"
                                                    value={limites.stockMin}
                                                    onChange={(e) => setLimites({ ...limites, stockMin: e.target.value })}
                                                    placeholder="0"
                                                    className="border rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                                                </div>
                                                <div>
                                                  <label className="block text-xs text-gray-600 mb-1">Stock máximo</label>
                                                  <input type="number" min="0"
                                                    value={limites.stockMax}
                                                    onChange={(e) => setLimites({ ...limites, stockMax: e.target.value })}
                                                    placeholder="0"
                                                    className="border rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                                                </div>
                                                <button
                                                  onClick={handleGuardarLimites}
                                                  disabled={limites.procesando}
                                                  className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
                                                  {limites.procesando ? 'Guardando...' : 'Guardar'}
                                                </button>
                                                <button
                                                  onClick={() => setLimites(null)}
                                                  className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-300">
                                                  Cancelar
                                                </button>
                                              </div>
                                              {limites.mensaje && (
                                                <div className="text-xs text-red-600 mt-2">{limites.mensaje}</div>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </>
                                  )
                                })}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}