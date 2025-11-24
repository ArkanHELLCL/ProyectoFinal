import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import nombresDistritos from '../../mock/nombresDistritos.json'
import { useVotos } from '../context/VotosContext'

// URL base de la API según el entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const PACTO_NOMBRES = {
  A: "Partido Ecologista Verde",
  B: "Verdes, Regionalistas y Humanistas (FRVS, AH)",
  C: "Unidad por Chile (FA, PS, DC, PPD, PL, PR)",
  D: "Izquierda Ecologista Popular Animalista y Humanista",
  E: "Movimiento Amarillos por Chile",
  F: "Partido de Trabajadores Revolucionarios",
  G: "Partido Alianza Verde Popular",
  H: "Popular",
  I: "Partido de la Gente",
  J: "Chile Grande y Unido (UDI, RN, Evópoli, Demócratas)",
  K: "Cambio por Chile (PSC, PNL)",
  JK: "Toda la Derecha",
  AH: "Toda la Izquierda",
};

const PARTIDO_NOMBRES = {
  // Pacto A
  PEV: "Partido Ecologista Verde",

  // Pacto B
  FRVS: "Federación Regionalista Verde Social",
  AH: "Acción Humanista",

  // Pacto C - Unidad por Chile
  FA: "Frente Amplio",
  PS: "Partido Socialista",
  PC: "Partido Comunista",
  DC: "Democracia Cristiana",
  PPD: "Partido Por la Democracia",
  PL: "Partido Liberal",
  PR: "Partido Radical",

  // Pacto D
  PH: "Partido Humanista",

  // Pacto E
  AMR: "Amarillos por Chile",

  // Pacto F
  PTR: "Partido de Trabajadores Revolucionarios",

  // Pacto G
  AVP: "Alianza Verde Popular",

  // Pacto H
  POP: "Partido Popular",

  // Pacto I
  PDG: "Partido de la Gente",

  // Pacto J - Chile Grande y Unido
  UDI: "Unión Demócrata Independiente",
  RN: "Renovación Nacional",
  EVOP: "Evópoli",
  DEM: "Demócratas",

  // Pacto K - Cambio por Chile
  PSC: "Partido Social Cristiano",
  PNL: "Partido Nacional Libertario",
  REP: "Partido Republicano",

  // Independientes
  IND: "Independiente",
};

function Distritos() {
  const { 
    tipoVotos, 
    tipoCalculo, 
    cargarDistrito,
    getDistritoData,
    getDistritoEstado
  } = useVotos()
  
  const [candidatos, setCandidatos] = useState([])
  const [distritos, setDistritos] = useState([])
  const [escanos, setEscanos] = useState([])
  const [selectedDistrito, setSelectedDistrito] = useState('')
  const [votosAcumulados, setVotosAcumulados] = useState([])
  const [partidosAcumulados, setPartidosAcumulados] = useState([])
  const [candidatosElectos, setCandidatosElectos] = useState([])
  const [pactoExpandido, setPactoExpandido] = useState(null)
  const [partidoExpandido, setPartidoExpandido] = useState(null)
  const [votosTotalesReales, setVotosTotalesReales] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingVotos, setLoadingVotos] = useState(false)
  const [error, setError] = useState(null)
  const [tipoTabla, setTipoTabla] = useState('pacto') // 'pacto' o 'partido'

  // Función para obtener el nombre completo del distrito
  const getDistritoNombre = (id) => {
    const distrito = nombresDistritos.find(d => d.id === id)
    return distrito ? distrito.name : `Distrito ${id}`
  }

  // Función para obtener los escaños de un distrito
  const getEscanos = (id) => {
    if (!escanos || escanos.length === 0) return null
    const escano = escanos.find(e => e.numero_distrito === parseInt(id))
    return escano ? escano.escanos : null
  }

  // Función para obtener el nombre completo del pacto
  const getPactoNombre = (codigo) => {
    return PACTO_NOMBRES[codigo] || codigo
  }

  // Función para obtener el nombre completo del partido
  const getPartidoNombre = (codigo) => {
    return PARTIDO_NOMBRES[codigo] || codigo
  }

  // Función para obtener el color del pacto
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
    };
    return colores[codigo] || "bg-gray-100 text-gray-800";
  }

  // Función para obtener candidatos del distrito seleccionado
  const getCandidatosFiltrados = () => {
    if (!selectedDistrito) return []
    return candidatos
  }

  // Función para obtener votos acumulados por lista del distrito seleccionado
  const getListasDistrito = () => {
    if (!selectedDistrito || !votosAcumulados.length) return []

    // Ordenar por votos descendente
    return votosAcumulados.sort((a, b) => {
      const votosA = a.votos || a.votos_reales || a.votos_encuesta || 0
      const votosB = b.votos || b.votos_reales || b.votos_encuesta || 0
      return votosB - votosA
    })
  }

  // Función para obtener votos acumulados por partido del distrito seleccionado
  const getPartidosDistrito = () => {
    if (!selectedDistrito || !partidosAcumulados.length) return []

    // Ordenar partidos por votos totales (suma de votos de candidatos) descendente
    return [...partidosAcumulados].sort((a, b) => {
      const candidatosA = candidatos.filter(c => c.partido === a.codigo)
      const candidatosB = candidatos.filter(c => c.partido === b.codigo)

      const votosA = candidatosA.reduce((sum, c) => sum + (c.votos_reales_cantidad || 0), 0)
      const votosB = candidatosB.reduce((sum, c) => sum + (c.votos_reales_cantidad || 0), 0)

      return votosB - votosA
    })
  }

  // Función para expandir/colapsar la tabla de candidatos electos de un pacto
  const togglePacto = (codigoPacto) => {
    const nuevoValor = pactoExpandido === codigoPacto ? null : codigoPacto
    setPactoExpandido(nuevoValor)
  }

  // Función para expandir/colapsar la tabla de candidatos de un partido
  const togglePartido = (codigoPartido) => {
    const nuevoValor = partidoExpandido === codigoPartido ? null : codigoPartido
    setPartidoExpandido(nuevoValor)
  }

  // Función para calcular mujeres electas por partido
  const getMujeresElectasPorPartido = (codigoPartido) => {
    if (!Array.isArray(candidatosElectos)) return 0
    const mujeres = candidatosElectos.filter(candidato =>
      candidato.partido === codigoPartido && candidato.sexo === 'M'
    )
    return mujeres.length
  }

  // Función para calcular aporte total por partido (suma de aporte_electo de mujeres)
  const getAporteTotalPorPartido = (codigoPartido) => {
    if (!Array.isArray(candidatosElectos)) return 0
    const mujeres = candidatosElectos.filter(candidato => candidato.partido === codigoPartido && candidato.sexo === 'M')
    return mujeres.length * 500
  }

  // Función para calcular aporte total por pacto (suma de aporte_electo de mujeres del pacto)
  const getAporteTotalPorPacto = (codigoPacto) => {
    if (!Array.isArray(candidatosElectos)) return 0
    const mujeres = candidatosElectos.filter(candidato => candidato.pacto === codigoPacto && candidato.sexo === 'M')
    return mujeres.length * 500
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Crear lista de distritos del 1 al 28
        const distritosConNombres = Array.from({ length: 28 }, (_, i) => {
          const id = (i + 1).toString()
          return {
            id,
            nombre: getDistritoNombre(id)
          }
        })

        setDistritos(distritosConNombres)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDistritoChange = (e) => {
    const distrito = e.target.value
    setSelectedDistrito(distrito)

    // Limpiar datos inmediatamente
    setCandidatos([])
    setCandidatosElectos([])
    setVotosAcumulados([])
    setPartidosAcumulados([])
    setPactoExpandido(null)

    // Obtener candidatos del distrito seleccionado
    if (distrito) {
      fetchCandidatosDistrito(distrito)
    }
  }

  const fetchCandidatosDistrito = async (distrito) => {
    try {
      setLoadingVotos(true)

      // Verificar si ya está en cache
      let data = getDistritoData(distrito, tipoVotos, tipoCalculo)
      
      if (!data) {
        // No está en cache, cargar desde API
        data = await cargarDistrito(distrito, tipoVotos, tipoCalculo)
        if (!data) {
          throw new Error('Error al obtener los candidatos del distrito')
        }
      }

      // Extraer candidatos
      const candidatosDistrito = data.candidatos || []

      // Extraer candidatos electos
      let electos = data.candidatos_electos || []

      // Calcular listas y partidos acumulados desde candidatos
      const listasMap = {}
      const partidosMap = {}
      
      candidatosDistrito.forEach(candidato => {
        // Determinar qué campo de votos usar según tipoVotos
        let votos = 0
        if (tipoVotos === 'reales') {
          votos = candidato.votos_reales_cantidad || candidato.votos || 0
        } else {
          votos = candidato.votos_encuesta_cantidad || candidato.votos || 0
        }
        
        const pacto = candidato.pacto || 'SIN PACTO'
        const partido = candidato.partido || 'IND'
        
        // Acumular por pacto - usar estructura consistente con el resto del código
        if (!listasMap[pacto]) {
          listasMap[pacto] = { 
            codigo: pacto, 
            lista: pacto,
            votos: 0,
            votos_reales: 0
          }
        }
        listasMap[pacto].votos += votos
        listasMap[pacto].votos_reales += votos
        
        // Acumular por partido - usar estructura consistente
        if (!partidosMap[partido]) {
          partidosMap[partido] = { 
            codigo: partido,
            partido: partido, 
            votos: 0,
            votos_reales: 0
          }
        }
        partidosMap[partido].votos += votos
        partidosMap[partido].votos_reales += votos
      })

      const listas = Object.values(listasMap)
      const partidos = Object.values(partidosMap)

      // Extraer votos_totales_reales si está disponible
      const votosTotales = data.votos_totales_reales || null
      setVotosTotalesReales(votosTotales)

      // Obtener información de escaños del distrito
      try {
        const escanosResponse = await fetch(`${API_BASE_URL}/api/escanos/${distrito}`)
        if (escanosResponse.ok) {
          const escanosData = await escanosResponse.json()
          // La API ahora devuelve solo el número de escaños
          setEscanos([{ numero_distrito: parseInt(distrito), escanos: escanosData }])
        } else {
          console.error('Error al obtener escaños, status:', escanosResponse.status)
        }
      } catch (escanosError) {
        console.error('Error en fetch de escaños:', escanosError)
      }

      setCandidatos(candidatosDistrito)
      setCandidatosElectos(electos)
      setVotosAcumulados(listas)
      setPartidosAcumulados(partidos)
      setLoadingVotos(false)
    } catch (err) {
      console.error('Error al obtener candidatos del distrito:', err)
      setCandidatos([])
      setVotosAcumulados([])
      setPartidosAcumulados([])
      setLoadingVotos(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Link
              to="/"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="ml-2 font-medium">Volver</span>
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">Análisis por Distrito</h1>
          </div>
          <p className="text-gray-600">
            Seleccione un distrito para visualizar la información electoral - <span className="inline-block ml-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
              Votos de {tipoVotos === 'encuesta' ? 'Encuesta' : tipoVotos === 'reales' ? 'Reales' : 'Comparativa'}
            </span>
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <label htmlFor="distrito-select" className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Distrito
            </label>
            <div className="relative">
              <select
                id="distrito-select"
                value={selectedDistrito}
                onChange={handleDistritoChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         bg-white text-gray-900 appearance-none cursor-pointer
                         transition duration-200 ease-in-out
                         hover:border-gray-400"
              >
                <option value="">-- Seleccione un distrito --</option>
                {distritos.map((distrito, index) => (
                  <option key={index} value={distrito.id} className="py-2">
                    {distrito.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Selector de tipo de tabla */}
          {selectedDistrito && (
            <div className="mt-4 inline-flex items-center gap-3 bg-white rounded-lg shadow-md px-6 py-3">
              <span className="text-sm font-medium text-gray-700">Tipo de Tabla:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setTipoTabla('pacto')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${tipoTabla === 'pacto'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Por Pacto
                </button>
                <button
                  onClick={() => setTipoTabla('partido')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${tipoTabla === 'partido'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Por Partido
                </button>
              </div>
            </div>
          )}

          {selectedDistrito && (
            <div className="mt-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  {getDistritoNombre(selectedDistrito)}
                  {getEscanos(selectedDistrito) && (
                    <span className="ml-2 text-sm font-normal text-blue-600">
                      ({getEscanos(selectedDistrito)} escaños)
                    </span>
                  )}
                </h3>
                <div className="text-sm text-gray-600">
                  Candidatos en este distrito: {getCandidatosFiltrados().length}
                  {tipoVotos === 'reales' && votosTotalesReales !== null && (
                    <div className="mt-1 text-gray-700 font-medium">
                      Votos totales reales: {votosTotalesReales.toLocaleString('es-CL')}
                    </div>
                  )}
                </div>
                {(() => {
                  const escanos = getEscanos(selectedDistrito)
                  const electos = candidatosElectos.length
                  if (escanos && electos !== escanos) {
                    return (
                      <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <div className="text-sm">
                            <span className="font-semibold text-yellow-800">Advertencia:</span>
                            <span className="text-yellow-700 ml-1">
                              Este distrito tiene {escanos} escaños pero se encontraron {electos} candidatos electos.
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>



              {/* Tabla de Votos Acumulados por Pacto */}
              {tipoTabla === 'pacto' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8 max-w-full lg:max-w-6xl xl:max-w-7xl">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="flex items-center text-green-600 mr-3">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Votos Acumulados por Pacto</span>
                      </div>
                      <span className="text-gray-500">
                        Total Pactos: {getListasDistrito().length}
                      </span>
                    </div>
                  </div>

                  {loadingVotos ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando votos acumulados...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Código
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Pacto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                                Total Aporte (UF)
                              </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Votos
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {getListasDistrito().map((lista, index) => {
                            // Obtener todos los candidatos del pacto
                            const candidatosPacto = candidatos.filter(candidato => candidato.pacto === lista.codigo)

                            // Identificar electos
                            const electosPacto = Array.isArray(candidatosElectos)
                              ? candidatosElectos.filter(candidato => candidato.pacto === lista.codigo)
                              : []

                            // Ordenar: Estrictamente por votos descendente
                            candidatosPacto.sort((a, b) => {
                              return (b.votos_reales_cantidad || 0) - (a.votos_reales_cantidad || 0)
                            })

                            // Calcular votos totales del pacto sumando los candidatos
                            const totalVotosPacto = candidatosPacto.reduce((sum, c) => sum + (c.votos_reales_cantidad || 0), 0)

                            const isExpanded = pactoExpandido === lista.codigo
                            const tieneCandidatos = candidatosPacto.length > 0
                            const tieneElectos = electosPacto.length > 0

                            return (
                              <React.Fragment key={`pacto-${index}`}>
                                <tr
                                  className={`transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${tieneCandidatos ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50'}`}
                                  onClick={() => {
                                    if (tieneCandidatos) {
                                      togglePacto(lista.codigo)
                                    }
                                  }}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      {tieneCandidatos && (
                                        <button
                                          className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors shadow-sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            togglePacto(lista.codigo)
                                          }}
                                        >
                                          <svg
                                            className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </button>
                                      )}
                                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getPactoColor(lista.codigo)}`}>
                                        {lista.codigo}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-medium text-gray-900">
                                        {getPactoNombre(lista.codigo)}
                                      </div>
                                      {tieneElectos && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 animate-pulse">
                                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                          {electosPacto.length} electo{electosPacto.length !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {(() => {
                                      const aporteTotal = getAporteTotalPorPacto(lista.codigo)
                                      return aporteTotal > 0 ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 border-2 border-green-200 rounded-lg shadow-sm">
                                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                          </svg>
                                          <span className="font-semibold text-green-700 text-lg">{aporteTotal.toFixed(2)} UF</span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">0 UF</span>
                                      )
                                    })()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {(() => {
                                      const porcentaje = lista.votos_encuesta || 0
                                      return (
                                        <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-2">
                                            <div className="bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner" style={{ minWidth: '200px', width: '200px' }}>
                                              <div
                                                className="h-full bg-green-600 rounded-full transition-all duration-300 shadow-sm"
                                                style={{ width: `${porcentaje}%` }}
                                              />
                                            </div>
                                            <span className="font-medium text-xs min-w-[45px] text-right">
                                              {porcentaje}%
                                            </span>
                                          </div>
                                          {totalVotosPacto > 0 && (
                                            <div className="text-xs text-gray-600 font-medium text-right">
                                              {totalVotosPacto.toLocaleString('es-CL')} votos
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })()}
                                  </td>
                                </tr>

                                {/* Fila expandible con TODOS los candidatos del pacto */}
                                {tieneCandidatos && (
                                  <tr className={`transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0'}`}>
                                    <td colSpan="4" className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'px-6 py-4' : 'px-6 py-0'}`}>
                                      <div className={`bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg transition-all duration-300 ${isExpanded ? 'p-4 border-2 border-blue-200' : 'p-0'}`}>
                                        {isExpanded && (
                                          <div className="animate-in fade-in duration-300">
                                            <div className="flex items-center gap-2 mb-4">
                                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                              </svg>
                                              <h4 className="text-base font-bold text-blue-800">
                                                Candidatos del Pacto {getPactoNombre(lista.codigo)}
                                              </h4>
                                              <span className="ml-auto text-sm font-semibold text-blue-600">
                                                {candidatosPacto.length} candidato{candidatosPacto.length !== 1 ? 's' : ''}
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              {candidatosPacto.map((candidato, idx) => {
                                                const esElecto = electosPacto.some(e => e.nombre === candidato.nombre)

                                                return (
                                                  <div
                                                    key={idx}
                                                    className={`flex items-center justify-between bg-white p-4 rounded-lg shadow-md border-l-4 hover:shadow-lg transition-shadow duration-200 ${esElecto ? 'border-green-500' : 'border-red-500'}`}
                                                  >
                                                    <div className="flex items-center gap-3 flex-1">
                                                      {candidato.id_foto && (
                                                        <img
                                                          src={`https://static.emol.cl/emol50/especiales/img/2025/elecciones/dip/${candidato.id_foto}.jpg`}
                                                          alt={candidato.nombre}
                                                          className={`w-16 h-16 rounded-full object-cover border-2 shadow-sm ${esElecto ? 'border-green-500' : 'border-red-500'}`}
                                                          onError={(e) => {
                                                            e.target.style.display = 'none'
                                                          }}
                                                        />
                                                      )}
                                                      <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                          <svg className={`w-4 h-4 ${esElecto ? 'text-green-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                          </svg>
                                                          <div className="font-bold text-gray-900">{candidato.nombre}</div>
                                                        </div>
                                                        <div className="text-xs text-gray-600 ml-6">
                                                          <span className="font-semibold">{getPartidoNombre(candidato.partido)}</span>
                                                          {candidato.cupo && <span> • Cupo: {candidato.cupo}</span>}

                                                          {/* Porcentaje y Votos */}
                                                          <div className="mt-2">
                                                            <div className="flex items-center gap-2 mb-1">
                                                              <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                                <div
                                                                  className={`h-full rounded-full ${esElecto ? 'bg-green-500' : 'bg-gray-400'}`}
                                                                  style={{ width: `${candidato.votos_encuesta || 0}%` }}
                                                                />
                                                              </div>
                                                              <span className="text-xs font-bold text-gray-700">
                                                                {candidato.votos_encuesta || 0}%
                                                              </span>
                                                            </div>
                                                            {candidato.votos_reales_cantidad > 0 && (
                                                              <div className="font-medium text-indigo-600">
                                                                {candidato.votos_reales_cantidad.toLocaleString('es-CL')} votos
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${esElecto ? 'bg-green-600' : 'bg-red-600'}`}>
                                                        {esElecto ? 'ELECTO' : 'NO ELECTO'}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tabla de Partidos Acumulados */}
              {tipoTabla === 'partido' && (loadingVotos || getPartidosDistrito().length > 0) && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="flex items-center text-blue-600 mr-3">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Votos Acumulados por Partido</span>
                      </div>
                      <span className="text-gray-500">
                        Total Partidos: {getPartidosDistrito().length}
                      </span>
                    </div>
                  </div>

                  {loadingVotos ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando votos por partido...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Código
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Partido
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Pacto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Mujeres
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                                Total Aporte (UF)
                              </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Votos
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {getPartidosDistrito().map((partido, index) => {
                            const mujeresElectas = getMujeresElectasPorPartido(partido.codigo)
                            const aporteTotal = getAporteTotalPorPartido(partido.codigo)

                            // Obtener todos los candidatos del partido
                            const candidatosPartido = candidatos.filter(candidato => candidato.partido === partido.codigo)

                            // Identificar electos
                            const electosPartido = Array.isArray(candidatosElectos)
                              ? candidatosElectos.filter(candidato => candidato.partido === partido.codigo)
                              : []

                            // Ordenar: Estrictamente por votos descendente
                            candidatosPartido.sort((a, b) => {
                              return (b.votos_reales_cantidad || 0) - (a.votos_reales_cantidad || 0)
                            })

                            // Calcular votos totales del partido sumando los candidatos
                            const totalVotosPartido = candidatosPartido.reduce((sum, c) => sum + (c.votos_reales_cantidad || 0), 0)

                            const isExpanded = partidoExpandido === partido.codigo
                            const tieneCandidatos = candidatosPartido.length > 0
                            const tieneElectos = electosPartido.length > 0

                            return (
                              <React.Fragment key={`partido-${index}`}>
                                <tr
                                  className={`transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${tieneCandidatos ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50'}`}
                                  onClick={() => {
                                    if (tieneCandidatos) {
                                      togglePartido(partido.codigo)
                                    }
                                  }}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                      {tieneCandidatos && (
                                        <button
                                          className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors shadow-sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            togglePartido(partido.codigo)
                                          }}
                                        >
                                          <svg
                                            className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </button>
                                      )}
                                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 shadow-md">
                                        <span className="text-sm font-bold text-white">{partido.codigo}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-semibold text-gray-900">
                                        {getPartidoNombre(partido.codigo)}
                                      </div>
                                      {tieneElectos && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 animate-pulse">
                                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                          {electosPartido.length} electo{electosPartido.length !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getPactoColor(partido.pacto)}`}>
                                      {partido.pacto}
                                    </span>
                                  </td>
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    {mujeresElectas > 0 ? (
                                      <div className="flex items-center justify-center gap-1 bg-pink-50 px-1.5 py-1 rounded border border-pink-200">
                                        <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-xs font-semibold text-pink-700">{mujeresElectas}</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center px-1.5 py-1 rounded bg-gray-100">
                                        <span className="text-xs text-gray-400">0</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    {aporteTotal > 0 ? (
                                      <div className="flex items-center justify-center gap-0.5 bg-green-50 px-1.5 py-1 rounded border border-green-200">
                                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-xs font-semibold text-green-700">{aporteTotal.toFixed(0)}</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center px-1.5 py-1 rounded bg-gray-100">
                                        <span className="text-xs text-gray-400">0</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900">
                                    {(() => {
                                      const porcentaje = partido.votos_encuesta || 0
                                      return (
                                        <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner" style={{ minWidth: '100px' }}>
                                              <div
                                                className="h-full bg-blue-600 rounded-full transition-all duration-300 shadow-sm"
                                                style={{ width: `${porcentaje}%` }}
                                              />
                                            </div>
                                            <span className="font-medium text-xs min-w-[45px] text-right whitespace-nowrap">
                                              {porcentaje}%
                                            </span>
                                          </div>
                                          {totalVotosPartido > 0 && (
                                            <div className="text-xs text-gray-600 font-medium text-right">
                                              {totalVotosPartido.toLocaleString('es-CL')} votos
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })()}
                                  </td>
                                </tr>

                                {/* Fila expandible con TODOS los candidatos del partido */}
                                {tieneCandidatos && (
                                  <tr className={`transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0'}`}>
                                    <td colSpan="6" className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'px-6 py-4' : 'px-6 py-0'}`}>
                                      <div className={`bg-linear-to-r from-purple-50 to-pink-50 rounded-lg transition-all duration-300 ${isExpanded ? 'p-4 border-2 border-purple-200' : 'p-0'}`}>
                                        {isExpanded && (
                                          <div className="animate-in fade-in duration-300">
                                            <div className="flex items-center gap-2 mb-4">
                                              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                              </svg>
                                              <h4 className="text-base font-bold text-purple-800">
                                                {partido.codigo === 'IND' ? 'Candidatos Independientes' : `Candidatos del Partido ${getPartidoNombre(partido.codigo)}`}
                                              </h4>
                                              <span className="ml-auto text-sm font-semibold text-purple-600">
                                                {candidatosPartido.length} candidato{candidatosPartido.length !== 1 ? 's' : ''}
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              {candidatosPartido.map((candidato, idx) => {
                                                const esElecto = electosPartido.some(e => e.nombre === candidato.nombre)

                                                return (
                                                  <div
                                                    key={idx}
                                                    className={`flex items-center justify-between bg-white p-4 rounded-lg shadow-md border-l-4 hover:shadow-lg transition-shadow duration-200 ${esElecto ? 'border-green-500' : 'border-red-500'}`}
                                                  >
                                                    <div className="flex items-center gap-3 flex-1">
                                                      {candidato.id_foto && (
                                                        <img
                                                          src={`https://static.emol.cl/emol50/especiales/img/2025/elecciones/dip/${candidato.id_foto}.jpg`}
                                                          alt={candidato.nombre}
                                                          className={`w-16 h-16 rounded-full object-cover border-2 shadow-sm ${esElecto ? 'border-green-500' : 'border-red-500'}`}
                                                          onError={(e) => {
                                                            e.target.style.display = 'none'
                                                          }}
                                                        />
                                                      )}
                                                      <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                          <svg className={`w-4 h-4 ${esElecto ? 'text-green-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                          </svg>
                                                          <div className="font-bold text-gray-900">{candidato.nombre}</div>
                                                        </div>
                                                        <div className="text-xs text-gray-600 ml-6">
                                                          <span className="font-semibold">{getPactoNombre(candidato.pacto)}</span>
                                                          {candidato.cupo && <span> • Cupo: {candidato.cupo}</span>}

                                                          {/* Porcentaje y Votos */}
                                                          <div className="mt-2">
                                                            <div className="flex items-center gap-2 mb-1">
                                                              <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                                <div
                                                                  className={`h-full rounded-full ${esElecto ? 'bg-green-500' : 'bg-gray-400'}`}
                                                                  style={{ width: `${candidato.votos_encuesta || 0}%` }}
                                                                />
                                                              </div>
                                                              <span className="text-xs font-bold text-gray-700">
                                                                {candidato.votos_encuesta || 0}%
                                                              </span>
                                                            </div>
                                                            {candidato.votos_reales_cantidad > 0 && (
                                                              <div className="font-medium text-indigo-600">
                                                                {candidato.votos_reales_cantidad.toLocaleString('es-CL')} votos
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${esElecto ? 'bg-green-600' : 'bg-red-600'}`}>
                                                        {esElecto ? 'ELECTO' : 'NO ELECTO'}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
          }

          <div className="mt-6 text-sm text-gray-500">
            <p>Total de distritos disponibles: {distritos.length}</p>
            {selectedDistrito && <p>Candidatos en distrito seleccionado: {candidatos.length}</p>}
          </div>
        </div >
      </div >
    </div >
  )
}

export default Distritos
