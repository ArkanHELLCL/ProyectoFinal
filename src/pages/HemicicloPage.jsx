import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useVotos } from '../context/VotosContext'
import Hemiciclo from '../components/Hemiciclo'
import nombresDistritos from '../../mock/nombresDistritos.json'

// URL base de la API según el entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const PACTO_NOMBRES = {
  A: "Partido Ecologista Verde",
  B: "Verdes, Regionalistas y Humanistas",
  C: "Unidad por Chile",
  D: "Izquierda Ecologista Popular",
  E: "Amarillos por Chile",
  F: "Trabajadores Revolucionarios",
  G: "Alianza Verde Popular",
  H: "Popular",
  I: "Partido de la Gente",
  J: "Chile Grande y Unido",
  K: "Cambio por Chile",
  JK: "Toda la Derecha",
  AH: "Toda la Izquierda",
}

const PARTIDO_NOMBRES = {
  PS: "Partido Socialista",
  UDI: "Unión Demócrata Independiente",
  RN: "Renovación Nacional",
  PC: "Partido Comunista",
  DC: "Democracia Cristiana",
  FA: "Frente Amplio",
  REP: "Partido Republicano",
  PPD: "Partido Por la Democracia",
  PL: "Partido Liberal",
  PR: "Partido Radical",
  FRVS: "Federación Regionalista Verde Social",
  AH: "Acción Humanista",
  IND: "Independiente",
  PDG: "Partido de la Gente",
  EVOP: "Evópoli",
  DEM: "Demócratas",
  PNL: "Partido Nacional Liberal",
  AMR: "Amarillos por Chile",
  AMA: "Amarillos por Chile",
  PSC: "Partido Social Cristiano",
  PTR: "Partido de Trabajadores Revolucionarios",
  EVO: "Evópoli",
}

const HemicicloPage = () => {
  const { tipoVotos, tipoCalculo } = useVotos()
  const [candidatosElectos, setCandidatosElectos] = useState([])
  const [candidatosElectosCargando, setCandidatosElectosCargando] = useState(0)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentDistrito, setCurrentDistrito] = useState('')
  const [error, setError] = useState(null)
  const [colorearPor, setColorearPor] = useState('pacto') // 'pacto' o 'partido'
  const [distritosEnProceso, setDistritosEnProceso] = useState([]) // Para mostrar distritos procesándose en paralelo
  const [distritosCompletados, setDistritosCompletados] = useState(0)
  const [estadoDistritos, setEstadoDistritos] = useState({}) // { [id]: 'pendiente' | 'ok' | 'error' }

  // Función para obtener el nombre del distrito
  const getDistritoNombre = (id) => {
    const distrito = nombresDistritos.find(d => d.id === id)
    return distrito ? distrito.name : `Distrito ${id}`
  }

  // Función para cargar todos los candidatos electos de todos los distritos en paralelo
  const cargarTodosLosElectos = async () => {
    setLoading(true)
    setError(null)
    setCandidatosElectos([])
    setCandidatosElectosCargando(0)
    setProgress(0)
    setDistritosCompletados(0)
    setEstadoDistritos({})

    const totalDistritos = 28
    const distritosActuales = []

    try {
      const todosLosElectos = []
      const promises = []

      for (let distrito = 1; distrito <= totalDistritos; distrito++) {
        distritosActuales.push({
          id: distrito,
          nombre: getDistritoNombre(distrito.toString())
        })

        let url = `${API_BASE_URL}/api/candidatos/${distrito}?votos=${tipoVotos}`
        if (tipoCalculo === 'izquierda') {
          url += '&pacto_ficticio=toda_izquierda'
        } else if (tipoCalculo === 'derecha') {
          url += '&pacto_ficticio=toda_derecha'
        }

        const promise = fetch(url)
          .then(response => {
            if (response.ok) {
              return response.json()
            }
            return null
          })
          .then(data => {
            if (data && data.resultados && data.resultados.candidatos_electos) {
              todosLosElectos.push(...data.resultados.candidatos_electos)
              setEstadoDistritos(prev => ({ ...prev, [distrito]: 'ok' }))
              setCandidatosElectosCargando(prev => prev + data.resultados.candidatos_electos.length)
            } else {
              setEstadoDistritos(prev => ({ ...prev, [distrito]: 'error' }))
            }
            // Actualizar progreso y distrito actual
            setDistritosCompletados(prev => {
              const nuevo = prev + 1
              setProgress(Math.round((nuevo / totalDistritos) * 100))
              setCurrentDistrito(`Distrito ${distrito} procesado`)
              return nuevo
            })
            return null
          })
          .catch(err => {
            console.error(`Error al obtener distrito ${distrito}:`, err)
            setEstadoDistritos(prev => ({ ...prev, [distrito]: 'error' }))
            setDistritosCompletados(prev => {
              const nuevo = prev + 1
              setProgress(Math.round((nuevo / totalDistritos) * 100))
              setCurrentDistrito(`Distrito ${distrito} error`)
              return nuevo
            })
            return null
          })

        promises.push(promise)
      }

      setDistritosEnProceso(distritosActuales)

      await Promise.all(promises)

      setCandidatosElectos(todosLosElectos)
      setProgress(100)
      setCurrentDistrito('¡Proceso completado!')
      setDistritosEnProceso([])
      setLoading(false)
    } catch (err) {
      setError(`Error al cargar los candidatos electos: ${err.message}`)
      setLoading(false)
      setDistritosEnProceso([])
    }
  }

  const getPactoColor = (codigo) => {
    const colores = {
      A: "bg-lime-200 text-lime-900",        // Ecologista Verde
      B: "bg-emerald-200 text-emerald-900",  // Verdes, Regionalistas
      C: "bg-rose-200 text-rose-900",        // Unidad por Chile (centro-izquierda)
      D: "bg-fuchsia-200 text-fuchsia-900",  // Izquierda Ecologista
      E: "bg-amber-200 text-amber-900",      // Amarillos por Chile
      F: "bg-red-300 text-red-950",          // Trabajadores Revolucionarios
      G: "bg-teal-200 text-teal-900",        // Alianza Verde Popular
      H: "bg-slate-200 text-slate-900",      // Popular
      I: "bg-orange-300 text-orange-950",    // Partido de la Gente
      J: "bg-sky-300 text-sky-950",          // Chile Grande y Unido (centro-derecha)
      K: "bg-violet-300 text-violet-950",    // Cambio por Chile
      JK: "bg-blue-500 text-white",          // Toda la Derecha
      AH: "bg-red-500 text-white",           // Toda la Izquierda
    }
    return colores[codigo] || "bg-gray-100 text-gray-800"
  }

  const getPartidoColor = (codigo) => {
    const colores = {
      FA: "bg-red-200 text-red-900",         // Frente Amplio
      RN: "bg-blue-200 text-blue-900",       // Renovación Nacional
      PC: "bg-red-300 text-red-950",         // Partido Comunista
      UDI: "bg-blue-400 text-blue-950",      // Unión Demócrata Independiente
      REP: "bg-cyan-300 text-cyan-950",      // Partido Republicano
      PPD: "bg-red-200 text-red-900",        // Partido Por la Democracia
      PNL: "bg-yellow-300 text-yellow-950",  // Partido Nacional Liberal
      PS: "bg-red-200 text-red-900",         // Partido Socialista
      DC: "bg-purple-200 text-purple-900",   // Democracia Cristiana
      PL: "bg-pink-200 text-pink-900",       // Partido Liberal
      PR: "bg-lime-300 text-lime-950",       // Partido Radical
      FRVS: "bg-green-200 text-green-900",   // Federación Regionalista Verde Social
      AH: "bg-teal-200 text-teal-900",       // Acción Humanista
      IND: "bg-slate-300 text-slate-950",    // Independiente
      PDG: "bg-orange-200 text-orange-900",  // Partido de la Gente
      EVOP: "bg-indigo-200 text-indigo-900", // Evópoli
      EVO: "bg-indigo-200 text-indigo-900",  // Evópoli (alias)
      DEM: "bg-indigo-200 text-indigo-900",  // Demócratas
      PSC: "bg-yellow-200 text-yellow-900",  // Partido Social Cristiano
      AMR: "bg-amber-300 text-amber-950",    // Amarillos por Chile
      AMA: "bg-amber-300 text-amber-950",    // Amarillos por Chile (alias)
      PTR: "bg-rose-300 text-rose-950",      // Trabajadores Revolucionarios
    }
    return colores[codigo] || "bg-gray-200 text-gray-800"
  }

  const getPartidoNombre = (codigo) => {
    return PARTIDO_NOMBRES[codigo] || codigo
  }

  // Contar escaños por pacto
  const contarEscanosPorPacto = () => {
    const conteo = {}
    candidatosElectos.forEach(candidato => {
      const pacto = candidato.pacto || 'SIN PACTO'
      conteo[pacto] = (conteo[pacto] || 0) + 1
    })
    return conteo
  }

  // Obtener partidos únicos por pacto
  const getPartidosPorPacto = (codigoPacto) => {
    const partidos = new Set()
    candidatosElectos.forEach(candidato => {
      const pacto = candidato.pacto || 'SIN PACTO'
      if (pacto === codigoPacto) {
        partidos.add(candidato.partido || 'IND')
      }
    })
    return Array.from(partidos).sort()
  }

  // Contar escaños por partido
  const contarEscanosPorPartido = () => {
    const conteo = {}
    candidatosElectos.forEach(candidato => {
      const partido = candidato.partido || 'IND'
      conteo[partido] = (conteo[partido] || 0) + 1
    })
    return conteo
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Link
              to="/"
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="ml-2 font-medium">Volver</span>
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">Visualización del Hemiciclo</h1>
          </div>
          <p className="text-gray-600">
            Vista interactiva de la composición del hemiciclo parlamentario
            <span className="inline-block ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
              Votos de {tipoVotos === 'encuesta' ? 'Encuesta' : tipoVotos === 'reales' ? 'Reales' : 'Comparativa'}
            </span>
          </p>
        </header>

        {/* Botón para cargar datos */}
        {!loading && candidatosElectos.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Cargar Composición del Hemiciclo</h2>
            <p className="text-gray-600 mb-6">
              Haz clic en el botón para cargar los 155 escaños electos de los 28 distritos
            </p>
            <button
              onClick={cargarTodosLosElectos}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Cargar Datos del Hemiciclo
            </button>
          </div>
        )}

        {/* Barra de progreso */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Cargando datos en paralelo...</span>
                <span className="text-sm font-semibold text-indigo-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-linear-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-300 flex items-center justify-end"
                  style={{ width: `${progress}%` }}
                >
                  {progress > 10 && (
                    <span className="text-xs text-white font-bold mr-2">{progress}%</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Mostrar distritos procesándose en paralelo */}
            {distritosEnProceso.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-600 mb-2">Procesando en paralelo:</div>
                <div className="flex flex-wrap gap-2">
                  {distritosEnProceso.map(distrito => {
                    const estado = estadoDistritos[distrito.id]
                    return (
                      <div 
                        key={distrito.id}
                        className="flex items-center gap-1 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs"
                      >
                        {estado === 'ok' ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : estado === 'error' ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-200">
                            <svg className="w-4 h-4 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </span>
                        )}
                        <span className="font-medium text-indigo-700">D{distrito.id}</span>
                        <span className="text-gray-600">{distrito.nombre}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-indigo-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="font-medium">{currentDistrito}</span>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Total de candidatos electos cargados: <span className="font-bold text-indigo-600">{candidatosElectosCargando}</span> / 155
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Hemiciclo */}
        {candidatosElectos.length > 0 && !loading && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="px-6 py-4 bg-linear-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-indigo-600">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-semibold text-lg">Hemiciclo Parlamentario de Chile</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="text-sm text-gray-600 font-medium">Colorear por:</span>
                    <button
                      onClick={() => setColorearPor('pacto')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        colorearPor === 'pacto'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Pacto
                    </button>
                    <button
                      onClick={() => setColorearPor('partido')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        colorearPor === 'partido'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Partido
                    </button>
                  </div>
                  <span className="text-gray-600 text-sm font-semibold">
                    {candidatosElectos.length} escaños
                  </span>
                </div>
              </div>
            </div>
            <div className="p-8 flex justify-center bg-linear-to-b from-gray-50 to-white">
              <Hemiciclo
                candidatosElectos={candidatosElectos}
                getPactoColor={colorearPor === 'pacto' ? getPactoColor : getPartidoColor}
                getPartidoNombre={getPartidoNombre}
                totalEscanos={155}
                colorearPor={colorearPor}
              />
            </div>
            {/* Botón para recargar */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
              <button
                onClick={cargarTodosLosElectos}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Recargar Datos
              </button>
            </div>
          </div>
        )}

        {/* Estadísticas por Pacto */}
        {candidatosElectos.length > 0 && !loading && colorearPor === 'pacto' && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
              Distribución de Escaños por Pacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(contarEscanosPorPacto())
                .sort((a, b) => b[1] - a[1])
                .map(([codigo, cantidad]) => (
                  <div key={codigo} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getPactoColor(codigo)}`}>
                        {codigo}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{PACTO_NOMBRES[codigo] || codigo}</div>
                        <div className="text-xs text-gray-500">{((cantidad / candidatosElectos.length) * 100).toFixed(1)}%</div>
                        <div className="text-xs text-gray-600 mt-0.5 font-medium">{getPartidosPorPacto(codigo).join(', ')}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">{cantidad}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Estadísticas por Partido */}
        {candidatosElectos.length > 0 && !loading && colorearPor === 'partido' && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
              Distribución de Escaños por Partido
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(contarEscanosPorPartido())
                .sort((a, b) => b[1] - a[1])
                .map(([codigo, cantidad]) => (
                  <div key={codigo} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getPartidoColor(codigo)}`}>
                        {codigo}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{PARTIDO_NOMBRES[codigo] || codigo}</div>
                        <div className="text-xs text-gray-500">{((cantidad / candidatosElectos.length) * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{cantidad}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Leyenda de Pactos */}
        {colorearPor === 'pacto' && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              Leyenda de Pactos
            </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(PACTO_NOMBRES)
              .filter(([codigo]) => {
                if (tipoCalculo === 'derecha') {
                  // Mostrar JK y ocultar J y K individuales
                  return codigo === 'JK' || (!['J', 'K', 'AH'].includes(codigo))
                } else if (tipoCalculo === 'izquierda') {
                  // Mostrar AH y ocultar A, B, C, D, F, G, H individuales
                  return codigo === 'AH' || (!['A', 'B', 'C', 'D', 'F', 'G', 'H', 'JK'].includes(codigo))
                }
                // Modo normal: ocultar JK y AH
                return !['JK', 'AH'].includes(codigo)
              })
              .map(([codigo, nombre]) => (
                <div key={codigo} className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPactoColor(codigo)}`}>
                    {codigo}
                  </span>
                  <span className="text-sm text-gray-700">{nombre}</span>
                </div>
              ))}
          </div>
          </div>
        )}

        {/* Leyenda de Partidos */}
        {colorearPor === 'partido' && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              Leyenda de Partidos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(PARTIDO_NOMBRES).map(([codigo, nombre]) => (
              <div key={codigo} className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPartidoColor(codigo)}`}>
                  {codigo}
                </span>
                <span className="text-sm text-gray-700">{nombre}</span>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Información */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Información</h4>
              <p className="text-sm text-blue-700">
                Esta visualización muestra los 155 escaños electos de la Cámara de Diputados de Chile, 
                obtenidos desde los 28 distritos electorales. 
                Pasa el cursor sobre cualquier escaño (círculo) para ver información detallada del candidato electo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HemicicloPage
