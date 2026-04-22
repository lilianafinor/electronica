export default function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Bienvenido, {usuario?.nombreCompleto}
      </h1>
      <p className="text-gray-500">
        Rol: <span className="font-medium text-blue-600">{usuario?.idRol?.nombre}</span>
      </p>
    </div>
  )
}