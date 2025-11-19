import React from 'react'
import { Link } from 'react-router-dom'
import { useVotos } from '../context/VotosContext'

const Home = () => {
  const { tipoVotos, setTipoVotos } = useVotos()

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Sistema D'Hondt</h1>
          <p className="text-xl text-gray-600 mb-8">Sistema de visualización electoral para Chile</p>
          
          {/* Selector de tipo de votos */}
          <div className="inline-flex items-center gap-3 bg-white rounded-lg shadow-md px-6 py-3">
            <span className="text-sm font-medium text-gray-700">Tipo de votos:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setTipoVotos('encuesta')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  tipoVotos === 'encuesta'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Encuesta
              </button>
              <button
                onClick={() => setTipoVotos('reales')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  tipoVotos === 'reales'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Reales
              </button>
              <button
                onClick={() => setTipoVotos('comparativa')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  tipoVotos === 'comparativa'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Comparativa
              </button>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tarjeta para Análisis de Distritos */}
          <Link
            to="/distritos"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Análisis por Distrito</h2>
              <p className="text-gray-600 mb-4">
                Visualiza candidatos, votos acumulados y composición del hemiciclo por distrito
              </p>
              <div className="flex items-center text-blue-600 font-semibold">
                <span>Explorar distritos</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Tarjeta para Hemiciclo */}
          <Link
            to={tipoVotos === 'comparativa' ? '/comparativa' : '/hemiciclo'}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 ${tipoVotos === 'comparativa' ? 'bg-purple-100' : 'bg-indigo-100'} rounded-full flex items-center justify-center mb-4`}>
                <svg className={`w-10 h-10 ${tipoVotos === 'comparativa' ? 'text-purple-600' : 'text-indigo-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Visualización Hemiciclo</h2>
              <p className="text-gray-600 mb-4">
                {tipoVotos === 'comparativa' 
                  ? 'Comparación lado a lado entre encuesta y resultados reales'
                  : 'Visualización interactiva de la composición del hemiciclo con 155 escaños'
                }
              </p>
              <div className={`flex items-center ${tipoVotos === 'comparativa' ? 'text-purple-600' : 'text-indigo-600'} font-semibold`}>
                <span>{tipoVotos === 'comparativa' ? 'Ver comparativa' : 'Ver hemiciclo'}</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Información adicional */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Acerca del Sistema</h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">28</div>
              <div className="text-sm text-gray-600">Distritos Electorales</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-1">155</div>
              <div className="text-sm text-gray-600">Escaños Totales</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">11</div>
              <div className="text-sm text-gray-600">Pactos Políticos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
