import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { LOGIN_MUTATION } from '../graphql/mutations'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const navigate                = useNavigate()

  const [loginUsuario, { loading }] = useMutation(LOGIN_MUTATION)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await loginUsuario({
        variables: { username, password }
      })
      if (data.loginUsuario.ok) {
        localStorage.setItem('usuario', JSON.stringify(data.loginUsuario.usuario))
        navigate('/dashboard')
      } else {
        setError(data.loginUsuario.mensaje)
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-2">
          Electrónica PNP
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Inicia sesión para continuar
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}