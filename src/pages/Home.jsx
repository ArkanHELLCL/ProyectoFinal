import React from 'react'
import { Link } from 'react-router-dom'
import { useVotos } from '../context/VotosContext'

const Home = () => {
  const { tipoVotos, setTipoVotos, modoComparativa, setModoComparativa, tipoCalculo, setTipoCalculo, limpiarCache, getDistritosCargadosPorTipo, getDistritosCargadosPorCalculo } = useVotos()

  // Estados para los filtros de comparativa de pactos ficticios
  const [tipoCalculo1, setTipoCalculo1] = React.useState('normal')
  const [tipoCalculo2, setTipoCalculo2] = React.useState('derecha')

  const conteoPorTipo = getDistritosCargadosPorTipo()
  const conteoPorCalculoReales = getDistritosCargadosPorCalculo('reales')
  const conteoPorCalculoEncuesta = getDistritosCargadosPorCalculo('encuesta')
  
  // Usar el conteo según el tipo de votos actual
  const conteoPorCalculo = tipoVotos === 'reales' ? conteoPorCalculoReales : conteoPorCalculoEncuesta

  const handleLimpiarCache = (tipo) => {
    const tipoVotosTexto = tipoVotos === 'reales' ? 'votos reales' : 'encuesta'
    const mensajes = {
      'todo': '¿Estás seguro de que deseas limpiar toda la caché? Esto forzará la recarga de todos los datos desde la API.',
      'reales': '¿Estás seguro de que deseas limpiar la caché de votos reales?',
      'encuesta': '¿Estás seguro de que deseas limpiar la caché de encuesta?',
      'normal': `¿Estás seguro de que deseas limpiar la caché del cálculo normal para ${tipoVotosTexto}?`,
      'derecha': `¿Estás seguro de que deseas limpiar la caché del cálculo derecha (J+K) para ${tipoVotosTexto}?`,
      'izquierda': `¿Estás seguro de que deseas limpiar la caché del cálculo izquierda (A-H) para ${tipoVotosTexto}?`
    }
    
    if (window.confirm(mensajes[tipo])) {
      // Para tipos de cálculo, pasar el tipoVotos actual
      if (tipo === 'normal' || tipo === 'derecha' || tipo === 'izquierda') {
        limpiarCache(tipo, tipoVotos)
      } else {
        limpiarCache(tipo)
      }
      const nombres = {
        'todo': 'todos los datos',
        'reales': 'votos reales',
        'encuesta': 'encuesta',
        'normal': `cálculo normal (${tipoVotosTexto})`,
        'derecha': `cálculo derecha (${tipoVotosTexto})`,
        'izquierda': `cálculo izquierda (${tipoVotosTexto})`
      }
      alert(`Caché de ${nombres[tipo]} limpiada exitosamente`)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">Sistema D'Hondt</h1>
          <p className="text-xl text-gray-600 mb-6">Sistema de visualización electoral para Chile</p>
          
          {/* Controles en una sola fila */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Selector de tipo de votos */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Tipo de votos:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setTipoVotos('encuesta')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      tipoVotos === 'encuesta'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Encuesta
                  </button>
                  <button
                    onClick={() => setTipoVotos('reales')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      tipoVotos === 'reales'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Reales
                  </button>
                </div>
              </div>

              <div className="h-6 w-px bg-gray-300"></div>

              {/* Opción de modo comparativa */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Modo visualización:</span>
                <button
                  onClick={() => setModoComparativa(!modoComparativa)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    modoComparativa
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {modoComparativa ? 'Comparativa' : 'Vista Simple'}
                </button>
              </div>

              <div className="h-6 w-px bg-gray-300"></div>

              {/* Selector de tipo de cálculo */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Tipo de cálculo:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setTipoCalculo('normal')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      tipoCalculo === 'normal'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setTipoCalculo('derecha')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      tipoCalculo === 'derecha'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Derecha (J+K)
                  </button>
                  <button
                    onClick={() => setTipoCalculo('izquierda')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      tipoCalculo === 'izquierda'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Izquierda (A-H)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tarjeta para Análisis de Distritos */}
          <Link
            to={modoComparativa ? '/comparativa-distritos' : '/distritos'}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 ${modoComparativa ? 'bg-purple-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mb-4`}>
                <svg className={`w-10 h-10 ${modoComparativa ? 'text-purple-600' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Análisis por Distrito</h2>
              <p className="text-gray-600 mb-4">
                {modoComparativa
                  ? 'Comparación lado a lado de encuesta vs reales por distrito electoral'
                  : 'Visualiza candidatos, votos acumulados y composición del hemiciclo por distrito'
                }
              </p>
              <div className={`flex items-center ${modoComparativa ? 'text-purple-600' : 'text-blue-600'} font-semibold`}>
                <span>{modoComparativa ? 'Ver comparativa' : 'Explorar distritos'}</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Tarjeta para Hemiciclo */}
          <Link
            to={modoComparativa ? '/comparativa' : '/hemiciclo'}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 ${modoComparativa ? 'bg-purple-100' : 'bg-indigo-100'} rounded-full flex items-center justify-center mb-4`}>
                <svg className={`w-10 h-10 ${modoComparativa ? 'text-purple-600' : 'text-indigo-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Visualización Hemiciclo</h2>
              <p className="text-gray-600 mb-4">
                {modoComparativa
                  ? 'Comparación lado a lado entre encuesta y resultados reales'
                  : 'Visualización interactiva de la composición del hemiciclo con 155 escaños'
                }
              </p>
              <div className={`flex items-center ${modoComparativa ? 'text-purple-600' : 'text-indigo-600'} font-semibold`}>
                <span>{modoComparativa ? 'Ver comparativa' : 'Ver hemiciclo'}</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Línea divisoria */}
        <div className="mt-12 mb-8 max-w-md mx-auto">
          <div className="border-t border-gray-200"></div>
        </div>

        {/* Subtítulo informativo */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Comparativa de pactos ficticios</h2>
          <p className="text-gray-600 text-sm">Los pactos JK (Toda la Derecha) y AH (Toda la Izquierda) son agrupaciones ficticias creadas para análisis comparativo</p>
        </div>

        {/* Filtros de tipo de cálculo para comparativas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            {/* Selector 1 */}
            <div className="flex flex-col items-center gap-2 w-full md:w-auto">
              <span className="text-sm font-medium text-gray-700">Lista 1 - Tipo de cálculo:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setTipoCalculo1('normal')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tipoCalculo1 === 'normal'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setTipoCalculo1('derecha')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tipoCalculo1 === 'derecha'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Derecha (J+K)
                </button>
                <button
                  onClick={() => setTipoCalculo1('izquierda')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tipoCalculo1 === 'izquierda'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Izquierda (A-H)
                </button>
              </div>
            </div>

            <div className="hidden md:block h-12 w-px bg-gray-300"></div>
            <div className="md:hidden w-full h-px bg-gray-300"></div>

            {/* Selector 2 */}
            <div className="flex flex-col items-center gap-2 w-full md:w-auto">
              <span className="text-sm font-medium text-gray-700">Lista 2 - Tipo de cálculo:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setTipoCalculo2('normal')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tipoCalculo2 === 'normal'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setTipoCalculo2('derecha')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tipoCalculo2 === 'derecha'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Derecha (J+K)
                </button>
                <button
                  onClick={() => setTipoCalculo2('izquierda')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tipoCalculo2 === 'izquierda'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Izquierda (A-H)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Opciones de comparativa con pactos ficticios */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Tarjeta para Análisis de Distritos con pactos ficticios */}
          <Link
            to={`/comparativa-pactos-ficticios-distritos?calculo1=${tipoCalculo1}&calculo2=${tipoCalculo2}`}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-orange-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-orange-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Análisis por Distrito</h2>
              <p className="text-gray-600 mb-4">
                Comparación por distrito entre dos tipos de cálculo seleccionados
              </p>
              <div className="flex items-center text-orange-700 font-semibold">
                <span>Ver comparativa distritos</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Tarjeta para Hemiciclo con pactos ficticios */}
          <Link
            to={`/comparativa-pactos-ficticios-hemiciclo?calculo1=${tipoCalculo1}&calculo2=${tipoCalculo2}`}
            className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-rose-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-rose-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-rose-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Visualización Hemiciclo</h2>
              <p className="text-gray-600 mb-4">
                Comparación de la composición del hemiciclo entre dos tipos de cálculo seleccionados
              </p>
              <div className="flex items-center text-rose-700 font-semibold">
                <span>Ver comparativa hemiciclo</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
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

        {/* Control de caché */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Gestión de Caché</h3>
          
          {/* Contadores de caché */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Votos Reales</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {conteoPorTipo.reales}<span className="text-sm text-blue-400">/28</span>
                  </p>
                </div>
                <button
                  onClick={() => handleLimpiarCache('reales')}
                  disabled={conteoPorTipo.reales === 0}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Encuesta</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {conteoPorTipo.encuesta}<span className="text-sm text-purple-400">/28</span>
                  </p>
                </div>
                <button
                  onClick={() => handleLimpiarCache('encuesta')}
                  disabled={conteoPorTipo.encuesta === 0}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Estado de caché por tipo de cálculo */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Caché por Tipo de Cálculo 
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                tipoVotos === 'reales' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                ({tipoVotos === 'reales' ? 'Votos Reales' : 'Encuesta'})
              </span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Normal */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-900">Normal</p>
                  {conteoPorCalculo.normal > 0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Cargado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                      Sin caché
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleLimpiarCache('normal')}
                  disabled={conteoPorCalculo.normal === 0}
                  className="w-full px-3 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200"
                >
                  Limpiar
                </button>
              </div>

              {/* Derecha */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-blue-900">Derecha (J+K)</p>
                  {conteoPorCalculo.derecha > 0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Cargado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                      Sin caché
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleLimpiarCache('derecha')}
                  disabled={conteoPorCalculo.derecha === 0}
                  className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200"
                >
                  Limpiar
                </button>
              </div>

              {/* Izquierda */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-indigo-900">Izquierda (A-H)</p>
                  {conteoPorCalculo.izquierda > 0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Cargado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                      Sin caché
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleLimpiarCache('izquierda')}
                  disabled={conteoPorCalculo.izquierda === 0}
                  className="w-full px-3 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Botón para limpiar todo */}
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => handleLimpiarCache('todo')}
              disabled={conteoPorTipo.reales === 0 && conteoPorTipo.encuesta === 0}
              className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
            >
              Limpiar Toda la Caché
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
