import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import nombresDistritos from '../../mock/nombresDistritos.json'

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
  const [candidatos, setCandidatos] = useState([])
  const [distritos, setDistritos] = useState([])
  const [escanos, setEscanos] = useState([])
  const [selectedDistrito, setSelectedDistrito] = useState('')
  const [mostrarSoloConVotos, setMostrarSoloConVotos] = useState(true)
  const [votosAcumulados, setVotosAcumulados] = useState([])
  const [partidosAcumulados, setPartidosAcumulados] = useState([])
  const [candidatosElectos, setCandidatosElectos] = useState([])
  const [pactoExpandido, setPactoExpandido] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingVotos, setLoadingVotos] = useState(false)
  const [error, setError] = useState(null)

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
    };
    return colores[codigo] || "bg-gray-100 text-gray-800";
  }

  // Función para verificar si un candidato tiene votos
  const tieneVotos = (candidato) => {
    return (candidato.votos_reales && candidato.votos_reales > 0) || 
           (candidato.votos_encuesta && candidato.votos_encuesta > 0)
  }

  // Función para obtener candidatos filtrados
  const getCandidatosFiltrados = () => {
    // Los candidatos ya vienen filtrados por distrito desde la API
    let candidatosDis = candidatos
    
    if (mostrarSoloConVotos) {
      candidatosDis = candidatosDis.filter(tieneVotos)
    }
    
    return candidatosDis
  }

  // Función para obtener votos acumulados por lista del distrito seleccionado
  const getListasDistrito = () => {
    if (!selectedDistrito || !votosAcumulados.length) return []
    
    let filtrados = votosAcumulados
    
    if (mostrarSoloConVotos) {
      filtrados = votosAcumulados.filter(lista => {
        return (lista.votos_reales && lista.votos_reales > 0) || 
               (lista.votos_encuesta && lista.votos_encuesta > 0)
      })
    }
    
    return filtrados
  }

  // Función para obtener votos acumulados por partido del distrito seleccionado
  const getPartidosDistrito = () => {
    if (!selectedDistrito || !partidosAcumulados.length) return []
    
    let filtrados = partidosAcumulados
    
    if (mostrarSoloConVotos) {
      filtrados = partidosAcumulados.filter(partido => {
        return (partido.votos_reales && partido.votos_reales > 0) || 
               (partido.votos_encuesta && partido.votos_encuesta > 0)
      })
    }
    
    return filtrados
  }

  // Función para expandir/colapsar la tabla de candidatos electos de un pacto
  const togglePacto = (codigoPacto) => {
    const nuevoValor = pactoExpandido === codigoPacto ? null : codigoPacto
    setPactoExpandido(nuevoValor)
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
    const total = mujeres.reduce((total, candidato) => {
      return total + (candidato.aporte_electo || 0)
    }, 0)
    return total
  }

  // Función para calcular aporte total por pacto (suma de aporte_electo de mujeres del pacto)
  const getAporteTotalPorPacto = (codigoPacto) => {
    if (!Array.isArray(candidatosElectos)) return 0
    const mujeres = candidatosElectos.filter(candidato => candidato.pacto === codigoPacto && candidato.sexo === 'M')
    const total = mujeres.reduce((total, candidato) => {
      return total + (candidato.aporte_electo || 0)
    }, 0)
    return total
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
      
      // Obtener candidatos del distrito
      const url = `${API_BASE_URL}/api/candidatos/${distrito}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Error al obtener los candidatos del distrito')
      }
      
      const data = await response.json()
      console.log('Respuesta API candidatos:', data)
      
      // Extraer candidatos
      const candidatosDistrito = data.candidatos || []
      
      // Extraer candidatos electos (están dentro de resultados.candidatos_electos)
      let electos = []
      if (data.resultados && data.resultados.candidatos_electos) {
        electos = data.resultados.candidatos_electos
      }
      
      // Extraer listas y partidos desde acumulado
      const acumulado = data.acumulado || {}
      const listas = acumulado.listas || []
      const partidos = acumulado.partidos || []
      
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
          <p className="text-gray-600">Seleccione un distrito para visualizar la información electoral</p>
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

          {/* Checkbox para filtrar candidatos con votos */}
          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={mostrarSoloConVotos}
                onChange={(e) => setMostrarSoloConVotos(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Mostrar solo candidatos con votos
              </span>
            </label>
          </div>

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
                  {mostrarSoloConVotos && candidatos.length > getCandidatosFiltrados().length && (
                    <span className="text-gray-500 ml-1">
                      (con votos de {candidatos.length} total)
                    </span>
                  )}
                </div>
              </div>

              {/* Tabla de Candidatos */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="flex items-center text-purple-600 mr-3">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium">Candidatos cargados</span>
                    </div>
                    <span className="text-gray-500">
                      Total: {getCandidatosFiltrados().length}
                    </span>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Partido
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Votos Reales
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Votos Encuesta
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getCandidatosFiltrados()
                        .map((candidato, index) => {
                          // Función para obtener el color de fondo según el partido
                          const getPartidoColor = (partido) => {
                            const colores = {
                              'FA': 'bg-red-100',
                              'RN': 'bg-blue-100', 
                              'PC': 'bg-red-200',
                              'UDI': 'bg-blue-200',
                              'REP': 'bg-cyan-200',
                              'PPD': 'bg-red-100',
                              'PNL': 'bg-yellow-200',
                              'PS': 'bg-red-100',
                              'DC': 'bg-purple-100',
                              'PR': 'bg-lime-200',
                              'IND': 'bg-slate-200',
                              'EVOP': 'bg-indigo-100',
                              'PL': 'bg-pink-100',
                              'FRVS': 'bg-green-100',
                              'AH': 'bg-teal-100',
                              'PDG': 'bg-orange-100'
                            };
                            return colores[partido] || 'bg-gray-100';
                          };

                          return (
                            <tr key={index} className={`${getPartidoColor(candidato.partido)} hover:bg-opacity-75 transition-colors duration-150`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {candidato.nombre}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {candidato.partido}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPactoColor(candidato.pacto)}`}>
                                  {getPactoNombre(candidato.pacto)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="font-medium">
                                  {candidato.votos_reales ? candidato.votos_reales.toLocaleString() : '0'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="font-medium">
                                  {candidato.votos_encuesta ? candidato.votos_encuesta.toLocaleString() : '0'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabla de Votos Acumulados por Pacto */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="flex items-center text-green-600 mr-3">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
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
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                              </svg>
                              Total Aporte (UF)
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Votos Reales
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Votos Encuesta
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getListasDistrito().map((lista, index) => {
                          const electosPacto = Array.isArray(candidatosElectos) 
                            ? candidatosElectos.filter(candidato => candidato.pacto === lista.codigo) 
                            : []
                          const isExpanded = pactoExpandido === lista.codigo
                          const tieneElectos = electosPacto.length > 0
                          
                          return (
                            <React.Fragment key={`pacto-${index}`}>
                              <tr 
                                className={`transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${tieneElectos ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50'}`}
                                onClick={() => {
                                  if (tieneElectos) {
                                    togglePacto(lista.codigo)
                                  }
                                }}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    {tieneElectos && (
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
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm bg-linear-to-r from-blue-400 to-blue-600 text-white ${getPactoColor(lista.codigo)}`}>
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
                                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                                        </svg>
                                        <span className="font-semibold text-green-700 text-lg">{aporteTotal.toFixed(2)} UF</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">0 UF</span>
                                    )
                                  })()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className="font-medium">
                                    {lista.votos_reales ? lista.votos_reales.toLocaleString() : '0'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className="font-medium">
                                    {lista.votos_encuesta ? lista.votos_encuesta.toFixed(1) + '%' : '0%'}
                                  </span>
                                </td>
                              </tr>
                              
                              {/* Fila expandible con candidatos electos */}
                              {tieneElectos && (
                                <tr className={`transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0'}`}>
                                  <td colSpan="5" className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'px-6 py-4' : 'px-6 py-0'}`}>
                                    <div className={`bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg transition-all duration-300 ${isExpanded ? 'p-4 border-2 border-blue-200' : 'p-0'}`}>
                                      {isExpanded && (
                                        <div className="animate-in fade-in duration-300">
                                          <div className="flex items-center gap-2 mb-4">
                                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                            </svg>
                                            <h4 className="text-base font-bold text-blue-800">
                                              Candidatos Electos - Pacto {getPactoNombre(lista.codigo)}
                                            </h4>
                                            <span className="ml-auto text-sm font-semibold text-blue-600">
                                              {electosPacto.length} escaño{electosPacto.length !== 1 ? 's' : ''}
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {electosPacto.map((candidato, idx) => (
                                              <div 
                                                key={idx} 
                                                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-200"
                                              >
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <div className="font-bold text-gray-900">{candidato.nombre}</div>
                                                  </div>
                                                  <div className="text-xs text-gray-600 ml-6">
                                                    <span className="font-semibold">{getPartidoNombre(candidato.partido)}</span>
                                                    {candidato.cupo && <span> • Cupo: {candidato.cupo}</span>}
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <span className="px-3 py-1 text-xs font-bold text-white bg-green-600 rounded-full">
                                                    ELECTO
                                                  </span>
                                                </div>
                                              </div>
                                            ))}
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

              {/* Tabla de Partidos Acumulados */}
              {(loadingVotos || getPartidosDistrito().length > 0) && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="flex items-center text-blue-600 mr-3">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd"/>
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
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                                </svg>
                                Total Aporte (UF)
                              </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Votos Reales
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Votos Encuesta
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {getPartidosDistrito().map((partido, index) => {
                            const mujeresElectas = getMujeresElectasPorPartido(partido.codigo)
                            const aporteTotal = getAporteTotalPorPartido(partido.codigo)
                            
                            return (
                              <tr key={index} className={`hover:bg-blue-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 shadow-md">
                                    <span className="text-sm font-bold text-white">{partido.codigo}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {getPartidoNombre(partido.codigo)}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getPactoColor(partido.pacto)}`}>
                                    {getPactoNombre(partido.pacto)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {mujeresElectas > 0 ? (
                                    <div className="flex items-center gap-2 bg-pink-50 px-3 py-2 rounded-lg border border-pink-200">
                                      <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                                      </svg>
                                      <span className="text-lg font-bold text-pink-700">{mujeresElectas}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
                                      <span className="text-sm text-gray-400">0</span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {aporteTotal > 0 ? (
                                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                                      </svg>
                                      <span className="text-lg font-bold text-green-700">{aporteTotal.toFixed(2)} UF</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
                                      <span className="text-sm text-gray-400">0 UF</span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className="font-medium">
                                    {partido.votos_reales ? partido.votos_reales.toLocaleString() : '0'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className="font-medium">
                                    {partido.votos_encuesta ? partido.votos_encuesta.toFixed(1) + '%' : '0%'}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <p>Total de distritos disponibles: {distritos.length}</p>
            {selectedDistrito && <p>Candidatos en distrito seleccionado: {candidatos.length}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Distritos
