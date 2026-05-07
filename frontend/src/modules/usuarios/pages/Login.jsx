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
      const { data } = await loginUsuario({ variables: { username, password } })
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
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: '#dc2626',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(220,38,38,0.4)',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div style={{ color: 'white', fontSize: '22px', fontWeight: '800', letterSpacing: '2px' }}>
            ELECTRÓNICA PNP
          </div>
          <div style={{ color: '#475569', fontSize: '13px', marginTop: '4px' }}>
            Sistema de Gestión
          </div>
        </div>

        {/* Tarjeta formulario */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>Bienvenido</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Ingresa tus credenciales para continuar</div>
          </div>

          <form onSubmit={handleLogin}>

            {/* Usuario */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  color: '#1e293b',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  color: '#1e293b',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#dc2626',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#ef4444' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.background = '#b91c1c' }}
              onMouseLeave={(e) => { if (!loading) e.target.style.background = '#dc2626' }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', color: '#334155', fontSize: '12px' }}>
          Electrónica PNP © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}