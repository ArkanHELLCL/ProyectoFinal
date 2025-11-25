import React from 'react'
import { useNavigate } from 'react-router-dom'

const SessionExpiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()

  const handleClose = () => {
    onClose()
    navigate('/login')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
          {/* Icono */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Contenido */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Sesión Expirada
            </h3>
            <p className="text-gray-600 mb-6">
              Su sesión ha expirado o no es válida. Por favor, inicie sesión nuevamente para continuar.
            </p>
            
            {/* Botón */}
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] focus:ring-4 focus:ring-indigo-300"
            >
              Ir al Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionExpiredModal
