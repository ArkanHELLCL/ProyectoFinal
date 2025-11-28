import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useVotos } from '../context/VotosContext'
import Hemiciclo from '../components/Hemiciclo'
import nombresDistritos from '../../mock/nombresDistritos.json'
import UserMenu from '../components/UserMenu'

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
  const { 
    tipoVotos, 
    tipoCalculo, 
    cargarDistrito,
    getDistritoData,
    getDistritosCargadosCount
  } = useVotos()
  
  const [candidatosElectos, setCandidatosElectos] = useState([])
  const [candidatosElectosCargando, setCandidatosElectosCargando] = useState(0)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentDistrito, setCurrentDistrito] = useState('')
  const [error, setError] = useState(null)
  const [colorearPor, setColorearPor] = useState('pacto') // 'pacto' o 'partido'
  const [distritosEnProceso, setDistritosEnProceso] = useState([]) // Para mostrar distritos procesándose en paralelo
  const [estadoDistritos, setEstadoDistritos] = useState({}) // { [id]: 'pendiente' | 'ok' | 'error' }
  const [totalVotosNacionales, setTotalVotosNacionales] = useState(0)
  const [votosNacionalesPorPacto, setVotosNacionalesPorPacto] = useState({})
  const [votosNacionalesPorPartido, setVotosNacionalesPorPartido] = useState({})

  // Función para obtener el nombre del distrito
  const getDistritoNombre = (id) => {
    const distrito = nombresDistritos.find(d => d.id === id)
    return distrito ? distrito.name : `Distrito ${id}`
  }

  // Función para cargar todos los candidatos electos de todos los distritos
  const cargarTodosLosElectos = async () => {
    setLoading(true)
    setError(null)
    setCandidatosElectos([])
    setCandidatosElectosCargando(0)
    setEstadoDistritos({})
    setTotalVotosNacionales(0)

    const totalDistritos = 28
    const distritosActuales = []
    const votosTotalesPorDistrito = []
    const acumuladoPactos = {}
    const acumuladoPartidos = {}

    try {
      // Verificar distritos ya cargados
      const distritosYaCargados = getDistritosCargadosCount(tipoVotos, tipoCalculo)
      setProgress(Math.round((distritosYaCargados / totalDistritos) * 100))

      // Preparar lista de distritos
      for (let distrito = 1; distrito <= totalDistritos; distrito++) {
        distritosActuales.push({
          id: distrito,
          nombre: getDistritoNombre(distrito.toString())
        })
      }
      setDistritosEnProceso(distritosActuales)

      const todosLosElectos = []
      let procesados = 0

      // Cargar todos los distritos (usa cache automáticamente)
      const promises = []
      for (let distrito = 1; distrito <= totalDistritos; distrito++) {
        const promise = (async () => {
          try {
            // Verificar si ya está en cache
            let data = getDistritoData(distrito, tipoVotos, tipoCalculo)
            
            if (!data) {
              // No está en cache, cargar este distrito específico desde API
              data = await cargarDistrito(distrito, tipoVotos, tipoCalculo)
            }

            if (data) {
              todosLosElectos.push(...data.candidatos_electos)
              setEstadoDistritos(prev => ({ ...prev, [distrito]: 'ok' }))
              setCandidatosElectosCargando(prev => prev + data.candidatos_electos.length)
              
              if (data.votos_totales_reales) {
                votosTotalesPorDistrito.push(data.votos_totales_reales)
              }
              if (data.candidatos) {
                procesarCandidatos(data.candidatos, acumuladoPactos, acumuladoPartidos)
              }
            } else {
              setEstadoDistritos(prev => ({ ...prev, [distrito]: 'error' }))
            }

            procesados++
            setProgress(Math.round((procesados / totalDistritos) * 100))
            setCurrentDistrito(`Distrito ${distrito} procesado`)
          } catch (error) {
            setEstadoDistritos(prev => ({ ...prev, [distrito]: 'error: ' + error.message }))
            procesados++
            setProgress(Math.round((procesados / totalDistritos) * 100))
          }
        })()

        promises.push(promise)
      }

      await Promise.all(promises)

      // Calcular total nacional de votos reales
      const totalVotos = votosTotalesPorDistrito.reduce((acc, curr) => acc + curr, 0)
      setTotalVotosNacionales(totalVotos)
      setVotosNacionalesPorPacto(acumuladoPactos)
      setVotosNacionalesPorPartido(acumuladoPartidos)

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

  // Función auxiliar para procesar candidatos y acumular votos
  const procesarCandidatos = (candidatos, acumuladoPactos, acumuladoPartidos) => {
    candidatos.forEach(candidato => {
      const votos = candidato.votos_reales_cantidad || 0
      const pacto = candidato.pacto || 'SIN PACTO'
      
      // Acumular por pacto
      if (tipoCalculo === 'derecha') {
        if (!['J', 'K'].includes(pacto)) {
          acumuladoPactos[pacto] = (acumuladoPactos[pacto] || 0) + votos
        }
      } else if (tipoCalculo === 'izquierda') {
        if (!['A', 'B', 'C', 'D', 'F', 'G', 'H'].includes(pacto)) {
          acumuladoPactos[pacto] = (acumuladoPactos[pacto] || 0) + votos
        }
      } else {
        if (!['JK', 'AH'].includes(pacto)) {
          acumuladoPactos[pacto] = (acumuladoPactos[pacto] || 0) + votos
        }
      }

      // Acumular por partido
      const partido = candidato.partido || 'IND'
      acumuladoPartidos[partido] = (acumuladoPartidos[partido] || 0) + votos
    })
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

    if (codigoPacto === 'X') {
      // Solo mostrar IND para el pacto X
      const tieneIndependientes = candidatosElectos.some(c =>
        c.pacto === 'X' && (!c.partido || c.partido === 'IND')
      )
      if (tieneIndependientes) {
        partidos.add('IND')
      }
    }

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

  // Obtener votos por pacto
  const getVotosPorPacto = (codigoPacto) => {
    // Para el pacto X, solo devolver los votos directamente sin sumar otros partidos
    return votosNacionalesPorPacto[codigoPacto] || 0
  }

  // Obtener votos por partido
  /*const getVotosPorPartido = (codigoPartido) => {
    return votosNacionalesPorPartido[codigoPartido] || 0
  }*/

  // Cargar datos automáticamente al montar el componente o cuando cambien tipoVotos/tipoCalculo
  useEffect(() => {
    cargarTodosLosElectos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoVotos, tipoCalculo])

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-4">
          <UserMenu />
        </div>
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
              Votos: {tipoVotos === 'encuesta' ? 'Encuesta' : tipoVotos === 'reales' ? 'Reales' : 'Comparativa'}
            </span>
            <span className="inline-block ml-2 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
              Cálculo: {tipoCalculo === 'normal' ? 'Normal' : tipoCalculo === 'derecha' ? 'Derecha (J+K)' : 'Izquierda (A-H)'}
            </span>
          </p>
          {totalVotosNacionales > 0 && (
            <p className="text-lg font-semibold text-indigo-600 mt-1">
              Total Nacional de Votos Válidos: {totalVotosNacionales.toLocaleString('es-CL')}
            </p>
          )}
        </header>

        {/* Barra de progreso */}
        {loading && (
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Cargando Datos del Hemiciclo</h2>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-indigo-700">Hemiciclo</span>
                  {progress === 100 && (
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <span className="text-xs text-green-600 font-semibold">Completo</span>
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-center text-gray-500 text-sm">
              Cargando datos de 28 distritos...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-lg">Hemiciclo Parlamentario de Chile</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="text-sm text-gray-600 font-medium">Colorear por:</span>
                    <button
                      onClick={() => setColorearPor('pacto')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${colorearPor === 'pacto'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Pacto
                    </button>
                    <button
                      onClick={() => setColorearPor('partido')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${colorearPor === 'partido'
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
                totalVotosNacionales={totalVotosNacionales}
              />
            </div>
          </div>
        )}

        {/* Estadísticas por Pacto */}
        {candidatosElectos.length > 0 && !loading && colorearPor === 'pacto' && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
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
                        <div className="text-xs text-gray-500">
                          {((cantidad / candidatosElectos.length) * 100).toFixed(1)}% escaños
                          {getVotosPorPacto(codigo) > 0 && totalVotosNacionales > 0 && (
                            <span>
                              {' | '}{((getVotosPorPacto(codigo) / totalVotosNacionales) * 100).toFixed(2)}% votos
                            </span>
                          )}
                        </div>
                        {getVotosPorPacto(codigo) > 0 && (
                          <div className="text-xs text-indigo-600 font-medium">
                            {getVotosPorPacto(codigo).toLocaleString('es-CL')} votos
                          </div>
                        )}
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
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
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
                        <div className="text-xs text-gray-500">
                          {((cantidad / candidatosElectos.length) * 100).toFixed(1)}% escaños
                          {votosNacionalesPorPartido[codigo] && totalVotosNacionales > 0 && (
                            <span>
                              {' | '}{((votosNacionalesPorPartido[codigo] / totalVotosNacionales) * 100).toFixed(2)}% votos
                            </span>
                          )}
                        </div>
                        {votosNacionalesPorPartido[codigo] && (
                          <div className="text-xs text-blue-600 font-medium mt-0.5">
                            {Math.round(votosNacionalesPorPartido[codigo]).toLocaleString('es-CL')} votos
                          </div>
                        )}
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
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
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
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
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
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
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
