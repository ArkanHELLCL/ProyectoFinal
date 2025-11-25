import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const UserMenu = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = React.useState(false)

  const handleLogout = async () => {
    setMenuAbierto(false)
    await logout()
    navigate('/login')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
      >
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
          </svg>
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-800">{user?.nombre || 'Usuario'}</div>
          <div className="text-xs text-gray-500">{user?.perfil || 'Perfil'}</div>
        </div>
        <svg className={`w-4 h-4 text-gray-600 transition-transform ${menuAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {menuAbierto && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setMenuAbierto(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-3 border-b border-gray-200">
              <div className="text-sm font-semibold text-gray-800">{user?.nombre}</div>
              <div className="text-xs text-gray-500">{user?.usuario}</div>
              <div className="text-xs text-indigo-600 mt-1">{user?.perfil}</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600 font-medium rounded-b-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default UserMenu
