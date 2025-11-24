import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Ilustración 404 */}
        <div className="mb-8 relative">
          <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-32 h-32 text-indigo-200 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Mensaje principal */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            ¡Página no encontrada!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          
          {/* Iconos decorativos */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.1s' }}>
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
              <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Botones de navegación */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Volver al inicio
            </Link>
            <Link
              to="/distritos"
              className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-indigo-50 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
              Ver distritos
            </Link>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">¿Qué puedes hacer?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <span className="font-medium">Ir al inicio</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Explorar distritos</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Ver hemiciclo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
