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
  PEV: "Partido Ecologista Verde",
  FRVS: "Federación Regionalista Verde Social",
  AH: "Acción Humanista",
  FA: "Frente Amplio",
  PS: "Partido Socialista",
  PC: "Partido Comunista",
  DC: "Democracia Cristiana",
  PPD: "Partido Por la Democracia",
  PL: "Partido Liberal",
  PR: "Partido Radical",
  PH: "Partido Humanista",
  AMR: "Amarillos por Chile",
  PTR: "Partido de Trabajadores Revolucionarios",
  AVP: "Alianza Verde Popular",
  POP: "Partido Popular",
  PDG: "Partido de la Gente",
  UDI: "Unión Demócrata Independiente",
  RN: "Renovación Nacional",
  EVOP: "Evópoli",
  DEM: "Demócratas",
  PSC: "Partido Social Cristiano",
  PNL: "Partido Nacional Libertario",
  REP: "Partido Republicano",
  IND: "Independiente",
};

function ComparativaDistritos() {
  const { 
    tipoCalculo, 
    cargarDistrito,
    getDistritoData
  } = useVotos()
  
  // Estados para encuesta (izquierda)
  const [candidatosEncuesta, setCandidatosEncuesta] = useState([])
  const [escanos, setEscanos] = useState([])
  const [votosAcumuladosEncuesta, setVotosAcumuladosEncuesta] = useState([])
  const [partidosAcumuladosEncuesta, setPartidosAcumuladosEncuesta] = useState([])
  const [candidatosElectosEncuesta, setCandidatosElectosEncuesta] = useState([])
  const [pactoExpandidoEncuesta, setPactoExpandidoEncuesta] = useState(null)
  const [partidoExpandidoEncuesta, setPartidoExpandidoEncuesta] = useState(null)
  
  // Estados para reales (derecha)
  const [candidatosReales, setCandidatosReales] = useState([])
  const [votosAcumuladosReales, setVotosAcumuladosReales] = useState([])
  const [partidosAcumuladosReales, setPartidosAcumuladosReales] = useState([])
  const [candidatosElectosReales, setCandidatosElectosReales] = useState([])
  const [votosTotalesReales, setVotosTotalesReales] = useState(null)
  const [pactoExpandidoReales, setPactoExpandidoReales] = useState(null)
  const [partidoExpandidoReales, setPartidoExpandidoReales] = useState(null)
  
  // Estados compartidos
  const [distritos, setDistritos] = useState([])
  const [selectedDistrito, setSelectedDistrito] = useState('')
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
      A: "bg-lime-200 text-lime-900",
      B: "bg-emerald-200 text-emerald-900",
      C: "bg-rose-200 text-rose-900",
      D: "bg-fuchsia-200 text-fuchsia-900",
      E: "bg-amber-200 text-amber-900",
      F: "bg-red-300 text-red-950",
      G: "bg-teal-200 text-teal-900",
      H: "bg-slate-200 text-slate-900",
      I: "bg-orange-300 text-orange-950",
      J: "bg-sky-300 text-sky-950",
      K: "bg-violet-300 text-violet-950",
      JK: "bg-blue-500 text-white",
      AH: "bg-red-500 text-white",
    };
    return colores[codigo] || "bg-gray-100 text-gray-800";
  }

  // Funciones para expandir/colapsar tablas de encuesta
  const togglePactoEncuesta = (codigoPacto) => {
    setPactoExpandidoEncuesta(pactoExpandidoEncuesta === codigoPacto ? null : codigoPacto)
  }

  const togglePartidoEncuesta = (codigoPartido) => {
    setPartidoExpandidoEncuesta(partidoExpandidoEncuesta === codigoPartido ? null : codigoPartido)
  }

  // Funciones para expandir/colapsar tablas de reales
  const togglePactoReales = (codigoPacto) => {
    setPactoExpandidoReales(pactoExpandidoReales === codigoPacto ? null : codigoPacto)
  }

  const togglePartidoReales = (codigoPartido) => {
    setPartidoExpandidoReales(partidoExpandidoReales === codigoPartido ? null : codigoPartido)
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
    setCandidatosEncuesta([])
    setCandidatosElectosEncuesta([])
    setVotosAcumuladosEncuesta([])
    setPartidosAcumuladosEncuesta([])
    setPactoExpandidoEncuesta(null)
    setPartidoExpandidoEncuesta(null)

    setCandidatosReales([])
    setCandidatosElectosReales([])
    setVotosAcumuladosReales([])
    setPartidosAcumuladosReales([])
    setPactoExpandidoReales(null)
    setPartidoExpandidoReales(null)

    // Obtener candidatos del distrito seleccionado para ambos tipos
    if (distrito) {
      fetchCandidatosDistrito(distrito)
    }
  }

  const fetchCandidatosDistrito = async (distrito) => {
    try {
      setLoadingVotos(true)

      // Cargar datos de encuesta
      let dataEncuesta = getDistritoData(distrito, 'encuesta', tipoCalculo)
      if (!dataEncuesta) {
        dataEncuesta = await cargarDistrito(distrito, 'encuesta', tipoCalculo)
      }

      // Cargar datos de reales
      let dataReales = getDistritoData(distrito, 'reales', tipoCalculo)
      if (!dataReales) {
        dataReales = await cargarDistrito(distrito, 'reales', tipoCalculo)
      }

      // Procesar datos de encuesta
      if (dataEncuesta) {
        const candidatosDistritoEncuesta = dataEncuesta.candidatos || []
        const electosEncuesta = dataEncuesta.candidatos_electos || []

        const listasMapEncuesta = {}
        const partidosMapEncuesta = {}
        
        candidatosDistritoEncuesta.forEach(candidato => {
          const votos = candidato.votos_encuesta_cantidad || candidato.votos || 0
          const pacto = candidato.pacto || 'SIN PACTO'
          const partido = candidato.partido || 'IND'
          
          if (!listasMapEncuesta[pacto]) {
            listasMapEncuesta[pacto] = { 
              codigo: pacto, 
              lista: pacto,
              votos: 0,
              votos_encuesta: 0
            }
          }
          listasMapEncuesta[pacto].votos += votos
          listasMapEncuesta[pacto].votos_encuesta += votos
          
          if (!partidosMapEncuesta[partido]) {
            partidosMapEncuesta[partido] = { 
              codigo: partido,
              partido: partido,
              pacto: pacto,
              votos: 0,
              votos_encuesta: 0
            }
          }
          partidosMapEncuesta[partido].votos += votos
          partidosMapEncuesta[partido].votos_encuesta += votos
        })

        setCandidatosEncuesta(candidatosDistritoEncuesta)
        setCandidatosElectosEncuesta(electosEncuesta)
        setVotosAcumuladosEncuesta(Object.values(listasMapEncuesta))
        setPartidosAcumuladosEncuesta(Object.values(partidosMapEncuesta))
      }

      // Procesar datos de reales
      if (dataReales) {
        const candidatosDistritoReales = dataReales.candidatos || []
        const electosReales = dataReales.candidatos_electos || []

        const listasMapReales = {}
        const partidosMapReales = {}
        
        candidatosDistritoReales.forEach(candidato => {
          const votos = candidato.votos_reales_cantidad || candidato.votos || 0
          const pacto = candidato.pacto || 'SIN PACTO'
          const partido = candidato.partido || 'IND'
          
          if (!listasMapReales[pacto]) {
            listasMapReales[pacto] = { 
              codigo: pacto, 
              lista: pacto,
              votos: 0,
              votos_reales: 0
            }
          }
          listasMapReales[pacto].votos += votos
          listasMapReales[pacto].votos_reales += votos
          
          if (!partidosMapReales[partido]) {
            partidosMapReales[partido] = { 
              codigo: partido,
              partido: partido,
              pacto: pacto,
              votos: 0,
              votos_reales: 0
            }
          }
          partidosMapReales[partido].votos += votos
          partidosMapReales[partido].votos_reales += votos
        })

        const votosTotales = dataReales.votos_totales_reales || null
        setVotosTotalesReales(votosTotales)

        setCandidatosReales(candidatosDistritoReales)
        setCandidatosElectosReales(electosReales)
        setVotosAcumuladosReales(Object.values(listasMapReales))
        setPartidosAcumuladosReales(Object.values(partidosMapReales))
      }

      // Obtener información de escaños del distrito
      try {
        const escanosResponse = await fetch(`${API_BASE_URL}/api/escanos/${distrito}`)
        if (escanosResponse.ok) {
          const escanosData = await escanosResponse.json()
          setEscanos([{ numero_distrito: parseInt(distrito), escanos: escanosData }])
        }
      } catch (escanosError) {
        console.error('Error al obtener escaños:', escanosError)
      }

      setLoadingVotos(false)
    } catch (err) {
      console.error('Error al obtener candidatos del distrito:', err)
      setLoadingVotos(false)
    }
  }

  // Componente para renderizar una sección de análisis (encuesta o reales)
  const SeccionAnalisis = ({ 
    tipo, 
    candidatos, 
    votosAcumulados, 
    partidosAcumulados, 
    candidatosElectos,
    pactoExpandido,
    togglePacto,
    partidoExpandido,
    togglePartido,
    colorTema
  }) => {
    const getListasOrdenadas = () => {
      if (!votosAcumulados.length) return []
      return [...votosAcumulados].sort((a, b) => {
        const votosA = a.votos || 0
        const votosB = b.votos || 0
        return votosB - votosA
      })
    }

    const getPartidosOrdenados = () => {
      if (!partidosAcumulados.length) return []
      return [...partidosAcumulados].sort((a, b) => {
        const votosA = a.votos || 0
        const votosB = b.votos || 0
        return votosB - votosA
      })
    }

    const getCandidatosPorPacto = (codigoPacto) => {
      return candidatos.filter(c => c.pacto === codigoPacto)
    }

    const getCandidatosPorPartido = (codigoPartido) => {
      return candidatos.filter(c => c.partido === codigoPartido)
    }

    /*const getMujeresElectasPorPartido = (codigoPartido) => {
      if (!Array.isArray(candidatosElectos)) return 0
      return candidatosElectos.filter(c => c.partido === codigoPartido && c.sexo === 'M').length
    }

    const getAporteTotalPorPartido = (codigoPartido) => {
      return getMujeresElectasPorPartido(codigoPartido) * 500
    }

    const getAporteTotalPorPacto = (codigoPacto) => {
      if (!Array.isArray(candidatosElectos)) return 0
      return candidatosElectos.filter(c => c.pacto === codigoPacto && c.sexo === 'M').length * 500
    }*/

    // Calcular total de votos para porcentajes
    const totalVotos = tipo === 'reales' && votosTotalesReales 
      ? votosTotalesReales 
      : candidatos.reduce((sum, c) => {
          const votos = tipo === 'reales' 
            ? (c.votos_reales_cantidad || 0) 
            : (c.votos_encuesta_cantidad || 0)
          return sum + votos
        }, 0)

    const totalEscanos = getEscanos(selectedDistrito) || 0

    return (
      <div className={`flex-1 bg-white rounded-lg shadow-lg p-6 border-2 ${colorTema === 'purple' ? 'border-purple-200' : 'border-blue-200'}`}>
        <div className={`mb-4 p-3 rounded-lg ${colorTema === 'purple' ? 'bg-purple-50' : 'bg-blue-50'}`}>
          <h2 className={`text-2xl font-bold ${colorTema === 'purple' ? 'text-purple-800' : 'text-blue-800'}`}>
            {tipo === 'encuesta' ? '📊 Datos de Encuesta' : '🗳️ Votos Reales'}
          </h2>
          <p className={`text-sm mt-1 ${colorTema === 'purple' ? 'text-purple-600' : 'text-blue-600'}`}>
            {tipo === 'encuesta' ? 'Proyección según encuestas' : 'Resultados electorales oficiales'}
          </p>
        </div>

        {!selectedDistrito ? (
          <div className="text-center py-12 text-gray-500">
            <p>Seleccione un distrito para ver la información</p>
          </div>
        ) : loadingVotos ? (
          <div className="text-center py-12">
            <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${colorTema === 'purple' ? 'border-purple-600' : 'border-blue-600'} mx-auto`}></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* Selector de tipo de tabla */}
            <div className="mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setTipoTabla('pacto')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    tipoTabla === 'pacto'
                      ? colorTema === 'purple' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Por Pacto
                </button>
                <button
                  onClick={() => setTipoTabla('partido')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    tipoTabla === 'partido'
                      ? colorTema === 'purple' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Por Partido
                </button>
              </div>
            </div>

            {/* Tabla por Pacto */}
            {tipoTabla === 'pacto' && (
              <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={colorTema === 'purple' ? 'bg-purple-100' : 'bg-blue-100'}>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-48">Pacto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Votos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">% Votos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Electos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">% Escaños</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getListasOrdenadas().map((lista) => {
                      const candidatosPacto = getCandidatosPorPacto(lista.codigo)
                      const electosPacto = candidatosElectos.filter(c => c.pacto === lista.codigo).length
                      const votos = lista.votos || 0
                      
                      // Calcular porcentaje de votos
                      const porcentajeVotos = tipo === 'encuesta'
                        ? (candidatosPacto[0]?.votos_encuesta || 0)
                        : totalVotos > 0 ? (votos / totalVotos * 100) : 0

                      // Calcular porcentaje de escaños
                      const porcentajeEscanos = totalEscanos > 0 ? (electosPacto / totalEscanos * 100) : 0

                      return (
                        <React.Fragment key={lista.codigo}>
                          <tr 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => togglePacto(lista.codigo)}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full shrink-0 ${getPactoColor(lista.codigo)}`}>
                                  {lista.codigo}
                                </span>
                                <span 
                                  className="text-sm font-medium text-gray-900 truncate max-w-[120px]" 
                                  title={getPactoNombre(lista.codigo)}
                                >
                                  {getPactoNombre(lista.codigo)}
                                </span>
                                <svg
                                  className={`w-4 h-4 flex-shrink-0 transition-transform ${
                                    pactoExpandido === lista.codigo ? 'transform rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {tipo === 'reales' ? votos.toLocaleString() : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className={colorTema === 'purple' ? 'bg-purple-600 h-2 rounded-full' : 'bg-blue-600 h-2 rounded-full'}
                                    style={{ width: `${Math.min(porcentajeVotos, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {porcentajeVotos.toFixed(2)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {electosPacto}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(porcentajeEscanos, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {porcentajeEscanos.toFixed(2)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Acordeón de candidatos con diseño de tarjetas */}
                          {pactoExpandido === lista.codigo && (
                            <tr>
                              <td colSpan={5} className="px-4 py-4 bg-blue-50">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2 text-blue-700 font-semibold">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                                    </svg>
                                    <span>Candidatos Electos del Pacto {getPactoNombre(lista.codigo)}</span>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {candidatosPacto.filter(c => candidatosElectos.some(e => e.id === c.id)).length} {candidatosPacto.filter(c => candidatosElectos.some(e => e.id === c.id)).length === 1 ? 'electo' : 'electos'}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                  {candidatosPacto.filter(candidato => {
                                    const esElecto = candidatosElectos.some(e => e.id === candidato.id)
                                    return esElecto
                                  }).map((candidato) => {
                                    const votosCandidato = tipo === 'reales'
                                      ? (candidato.votos_reales_cantidad || 0)
                                      : (candidato.votos_encuesta_cantidad || 0)
                                    
                                    const porcentajeVotosCandidato = tipo === 'encuesta'
                                      ? (candidato.votos_encuesta || 0)
                                      : totalVotos > 0 ? (votosCandidato / totalVotos * 100) : 0

                                    const esElecto = true

                                    return (
                                      <div 
                                        key={candidato.id} 
                                        className={`bg-white rounded-lg p-4 shadow-sm ${
                                          esElecto 
                                            ? 'border-l-4 border-green-500' 
                                            : 'border-l-4 border-red-400'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          {/* Foto del candidato */}
                                          <div className="shrink-0">
                                            {candidato.id_foto ? (
                                              <img
                                                src={`https://static.emol.cl/emol50/especiales/img/2025/elecciones/dip/${candidato.id_foto}.jpg`}
                                                alt={candidato.nombre}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                                onError={(e) => {
                                                  e.target.style.display = 'none'
                                                  e.target.nextElementSibling.style.display = 'flex'
                                                }}
                                              />
                                            ) : null}
                                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center" style={{display: candidato.id_foto ? 'none' : 'flex'}}>
                                              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                                              </svg>
                                            </div>
                                          </div>

                                          {/* Información del candidato */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                              <div className="flex items-center gap-2">
                                                {esElecto ? (
                                                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                                  </svg>
                                                ) : (
                                                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                                  </svg>
                                                )}
                                                <h4 className="font-semibold text-gray-900 truncate">{candidato.nombre}</h4>
                                              </div>
                                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                esElecto 
                                                  ? 'bg-green-100 text-green-800' 
                                                  : 'bg-red-100 text-red-800'
                                              }`}>
                                                {esElecto ? 'ELECTO' : 'NO ELECTO'}
                                              </span>
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 mb-2">
                                              {getPartidoNombre(candidato.partido)} • Cupo: {candidato.partido}
                                            </p>

                                            {/* Barra de progreso */}
                                            <div className="space-y-1">
                                              <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>% {tipo === 'encuesta' ? 'Encuesta' : 'Votos Reales'}</span>
                                              </div>
                                              <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                  className={`h-2 rounded-full ${
                                                    colorTema === 'purple' ? 'bg-purple-600' : 'bg-blue-600'
                                                  }`}
                                                  style={{ width: `${Math.min(porcentajeVotosCandidato, 100)}%` }}
                                                ></div>
                                              </div>
                                              <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-gray-900">
                                                  {porcentajeVotosCandidato.toFixed(1)}%
                                                </span>
                                                {tipo === 'reales' && (
                                                  <span className="text-xs text-gray-500">
                                                    {votosCandidato.toLocaleString()} votos
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
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
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Leyenda de Pactos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(PACTO_NOMBRES).map(([codigo, nombre]) => (
                    <div key={codigo} className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPactoColor(codigo)}`}>
                        {codigo}
                      </span>
                      <span className="text-xs text-gray-700">{nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
              </>
            )}

            {tipoTabla === 'partido' && (
              <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={colorTema === 'purple' ? 'bg-purple-100' : 'bg-blue-100'}>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-48">Partido</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-24">Pacto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Votos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">% Votos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Electos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">% Escaños</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getPartidosOrdenados().map((partido) => {
                      const candidatosPartido = getCandidatosPorPartido(partido.codigo)
                      const electosPartido = candidatosElectos.filter(c => c.partido === partido.codigo).length
                      const votos = partido.votos || 0
                      
                      const porcentajeVotos = tipo === 'encuesta'
                        ? (candidatosPartido[0]?.votos_encuesta || 0)
                        : totalVotos > 0 ? (votos / totalVotos * 100) : 0

                      const porcentajeEscanos = totalEscanos > 0 ? (electosPartido / totalEscanos * 100) : 0

                      return (
                        <React.Fragment key={partido.codigo}>
                          <tr 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => togglePartido(partido.codigo)}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span 
                                  className="text-sm font-medium text-gray-900 truncate max-w-[150px]"
                                  title={getPartidoNombre(partido.codigo)}
                                >
                                  {getPartidoNombre(partido.codigo)}
                                </span>
                                <svg
                                  className={`w-4 h-4 flex-shrink-0 transition-transform ${
                                    partidoExpandido === partido.codigo ? 'transform rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getPactoColor(partido.pacto)}`}>
                                {partido.pacto}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {tipo === 'reales' ? votos.toLocaleString() : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className={colorTema === 'purple' ? 'bg-purple-600 h-2 rounded-full' : 'bg-blue-600 h-2 rounded-full'}
                                    style={{ width: `${Math.min(porcentajeVotos, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {porcentajeVotos.toFixed(2)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {electosPartido}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(porcentajeEscanos, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {porcentajeEscanos.toFixed(2)}%
                                </span>
                              </div>
                            </td>
                          </tr>

                          {/* Acordeón de candidatos con diseño de tarjetas */}
                          {partidoExpandido === partido.codigo && (
                            <tr>
                              <td colSpan={6} className="px-4 py-4 bg-blue-50">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2 text-blue-700 font-semibold">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                                    </svg>
                                    <span>Candidatos Electos de {getPartidoNombre(partido.codigo)}</span>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {candidatosPartido.filter(c => candidatosElectos.some(e => e.id === c.id)).length} {candidatosPartido.filter(c => candidatosElectos.some(e => e.id === c.id)).length === 1 ? 'electo' : 'electos'}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                  {candidatosPartido.filter(candidato => {
                                    const esElecto = candidatosElectos.some(e => e.id === candidato.id)
                                    return esElecto
                                  }).map((candidato) => {
                                    const votosCandidato = tipo === 'reales'
                                      ? (candidato.votos_reales_cantidad || 0)
                                      : (candidato.votos_encuesta_cantidad || 0)
                                    
                                    const porcentajeVotosCandidato = tipo === 'encuesta'
                                      ? (candidato.votos_encuesta || 0)
                                      : totalVotos > 0 ? (votosCandidato / totalVotos * 100) : 0

                                    const esElecto = true

                                    return (
                                      <div 
                                        key={candidato.id} 
                                        className={`bg-white rounded-lg p-4 shadow-sm ${
                                          esElecto 
                                            ? 'border-l-4 border-green-500' 
                                            : 'border-l-4 border-red-400'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          {/* Foto del candidato */}
                                          <div className="flex-shrink-0">
                                            {candidato.id_foto ? (
                                              <img
                                                src={`https://static.emol.cl/emol50/especiales/img/2025/elecciones/dip/${candidato.id_foto}.jpg`}
                                                alt={candidato.nombre}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                                onError={(e) => {
                                                  e.target.style.display = 'none'
                                                  e.target.nextElementSibling.style.display = 'flex'
                                                }}
                                              />
                                            ) : null}
                                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center" style={{display: candidato.id_foto ? 'none' : 'flex'}}>
                                              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                                              </svg>
                                            </div>
                                          </div>

                                          {/* Información del candidato */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                              <div className="flex items-center gap-2">
                                                {esElecto ? (
                                                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                                  </svg>
                                                ) : (
                                                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                                  </svg>
                                                )}
                                                <h4 className="font-semibold text-gray-900 truncate">{candidato.nombre}</h4>
                                              </div>
                                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                esElecto 
                                                  ? 'bg-green-100 text-green-800' 
                                                  : 'bg-red-100 text-red-800'
                                              }`}>
                                                {esElecto ? 'ELECTO' : 'NO ELECTO'}
                                              </span>
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 mb-2">
                                              {getPartidoNombre(candidato.partido)} • Cupo: {candidato.partido}
                                            </p>

                                            {/* Barra de progreso */}
                                            <div className="space-y-1">
                                              <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>% {tipo === 'encuesta' ? 'Encuesta' : 'Votos Reales'}</span>
                                              </div>
                                              <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                  className={`h-2 rounded-full ${
                                                    colorTema === 'purple' ? 'bg-purple-600' : 'bg-blue-600'
                                                  }`}
                                                  style={{ width: `${Math.min(porcentajeVotosCandidato, 100)}%` }}
                                                ></div>
                                              </div>
                                              <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-gray-900">
                                                  {porcentajeVotosCandidato.toFixed(1)}%
                                                </span>
                                                {tipo === 'reales' && (
                                                  <span className="text-xs text-gray-500">
                                                    {votosCandidato.toLocaleString()} votos
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
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
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Leyenda de Partidos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(PARTIDO_NOMBRES).map(([codigo, nombre]) => (
                    <div key={codigo} className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600">{codigo}:</span>
                      <span className="text-xs text-gray-700">{nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
              </>
            )}
          </>
        )}
      </div>
    )
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
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
            <h1 className="text-4xl font-bold text-gray-800">Comparativa por Distrito</h1>
          </div>
          <p className="text-gray-600">
            Comparación lado a lado de encuesta vs votos reales por distrito electoral
            <span className="inline-block ml-2 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
              Cálculo: {tipoCalculo === 'normal' ? 'Normal' : tipoCalculo === 'derecha' ? 'Derecha (J+K)' : 'Izquierda (A-H)'}
            </span>
          </p>
        </header>

        {/* Selector de distrito */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <label htmlFor="distrito" className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Distrito:
          </label>
          <select
            id="distrito"
            value={selectedDistrito}
            onChange={handleDistritoChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Seleccione un distrito --</option>
            {distritos.map((distrito) => (
              <option key={distrito.id} value={distrito.id}>
                Distrito {distrito.id} - {distrito.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Secciones lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SeccionAnalisis
            tipo="encuesta"
            candidatos={candidatosEncuesta}
            votosAcumulados={votosAcumuladosEncuesta}
            partidosAcumulados={partidosAcumuladosEncuesta}
            candidatosElectos={candidatosElectosEncuesta}
            pactoExpandido={pactoExpandidoEncuesta}
            togglePacto={togglePactoEncuesta}
            partidoExpandido={partidoExpandidoEncuesta}
            togglePartido={togglePartidoEncuesta}
            colorTema="purple"
          />
          
          <SeccionAnalisis
            tipo="reales"
            candidatos={candidatosReales}
            votosAcumulados={votosAcumuladosReales}
            partidosAcumulados={partidosAcumuladosReales}
            candidatosElectos={candidatosElectosReales}
            pactoExpandido={pactoExpandidoReales}
            togglePacto={togglePactoReales}
            partidoExpandido={partidoExpandidoReales}
            togglePartido={togglePartidoReales}
            colorTema="blue"
          />
        </div>

        {/* Análisis de Diferencias */}
        {selectedDistrito && candidatosEncuesta.length > 0 && candidatosReales.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-7 h-7 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Análisis de Diferencias
              </h2>
              <p className="text-gray-600">Comparación entre proyección de encuesta y resultados reales</p>
            </div>

            {(() => {
              const totalElectosEncuesta = candidatosElectosEncuesta.length
              const totalElectosReales = candidatosElectosReales.length
              const diferenciaElectos = totalElectosReales - totalElectosEncuesta

              // Calcular votos totales
              const totalVotosEncuesta = candidatosEncuesta.reduce((sum, c) => 
                sum + (c.votos_encuesta_cantidad || 0), 0)
              const totalVotosReales = candidatosReales.reduce((sum, c) => 
                sum + (c.votos_reales_cantidad || 0), 0)
              const diferenciaVotos = totalVotosReales - totalVotosEncuesta

              // Analizar por pacto
              const electosPorPactoEncuesta = {}
              const electosPorPactoReales = {}
              
              candidatosElectosEncuesta.forEach(c => {
                electosPorPactoEncuesta[c.pacto] = (electosPorPactoEncuesta[c.pacto] || 0) + 1
              })
              
              candidatosElectosReales.forEach(c => {
                electosPorPactoReales[c.pacto] = (electosPorPactoReales[c.pacto] || 0) + 1
              })

              // Encontrar diferencias por pacto
              const todosPactos = [...new Set([
                ...Object.keys(electosPorPactoEncuesta),
                ...Object.keys(electosPorPactoReales)
              ])]

              const mayorGanador = todosPactos.map(pacto => ({
                pacto,
                encuesta: electosPorPactoEncuesta[pacto] || 0,
                reales: electosPorPactoReales[pacto] || 0,
                diferencia: (electosPorPactoReales[pacto] || 0) - (electosPorPactoEncuesta[pacto] || 0)
              })).sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia))[0]

              // Candidatos que aparecen en una lista pero no en otra
              const soloEnEncuesta = candidatosElectosEncuesta.filter(ce => 
                !candidatosElectosReales.some(cr => cr.id === ce.id)
              )
              const soloEnReales = candidatosElectosReales.filter(cr => 
                !candidatosElectosEncuesta.some(ce => ce.id === cr.id)
              )

              return (
                <>
                  {/* Grid de tarjetas de resumen */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Total de Electos */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Total Electos</h3>
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-gray-500">Encuesta:</span>
                          <span className="text-lg font-bold text-purple-600">{totalElectosEncuesta}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-gray-500">Reales:</span>
                          <span className="text-lg font-bold text-blue-600">{totalElectosReales}</span>
                        </div>
                        <div className="pt-2 border-t border-blue-200">
                          <p className={`text-xs font-semibold ${diferenciaElectos > 0 ? 'text-green-600' : diferenciaElectos < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {diferenciaElectos > 0 ? '+' : ''}{diferenciaElectos} {diferenciaElectos === 1 || diferenciaElectos === -1 ? 'candidato' : 'candidatos'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Diferencia de Votos */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Diferencia Votos</h3>
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-800">
                          {Math.abs(diferenciaVotos).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {diferenciaVotos > 0 ? 'más votos' : 'menos votos'} en reales
                        </p>
                      </div>
                    </div>

                    {/* Sorpresas */}
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border-l-4 border-amber-500">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Sorpresas</h3>
                        <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Solo en encuesta:</span>
                          <span className="text-lg font-bold text-purple-600">{soloEnEncuesta.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Solo en reales:</span>
                          <span className="text-lg font-bold text-blue-600">{soloEnReales.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mayor Cambio */}
                    {mayorGanador && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-600">Mayor Cambio</h3>
                          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {PACTO_NOMBRES[mayorGanador.pacto] || mayorGanador.pacto}
                        </p>
                        <p className={`text-lg font-bold ${mayorGanador.diferencia > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {mayorGanador.diferencia > 0 ? '+' : ''}{mayorGanador.diferencia}
                        </p>
                        <p className="text-xs text-gray-600">
                          {mayorGanador.encuesta} → {mayorGanador.reales} escaños
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Texto interpretativo */}
                  <div className="bg-indigo-50 rounded-lg p-6 border-l-4 border-indigo-500">
                    <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                      ¿Qué significa esto?
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <p className="leading-relaxed">
                        <strong>Si los votantes hubieran votado como indicaba la encuesta,</strong> el distrito {selectedDistrito} tendría{' '}
                        <span className={`font-bold ${diferenciaElectos < 0 ? 'text-red-600' : diferenciaElectos > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                          {Math.abs(diferenciaElectos)} {Math.abs(diferenciaElectos) === 1 ? 'candidato' : 'candidatos'}{' '}
                          {diferenciaElectos < 0 ? 'menos' : diferenciaElectos > 0 ? 'más' : 'igual cantidad de candidatos'}
                        </span>{' '}
                        de los que realmente resultaron electos.
                      </p>

                      {soloEnEncuesta.length > 0 && (
                        <p className="leading-relaxed">
                          <strong className="text-purple-700">
                            {soloEnEncuesta.length} {soloEnEncuesta.length === 1 ? 'candidato' : 'candidatos'}
                          </strong>{' '}
                          que la encuesta proyectaba como {soloEnEncuesta.length === 1 ? 'electo' : 'electos'} finalmente no{' '}
                          {soloEnEncuesta.length === 1 ? 'resultó' : 'resultaron'} {soloEnEncuesta.length === 1 ? 'ganador' : 'ganadores'}.
                        </p>
                      )}

                      {soloEnReales.length > 0 && (
                        <p className="leading-relaxed">
                          <strong className="text-blue-700">
                            {soloEnReales.length} {soloEnReales.length === 1 ? 'candidato' : 'candidatos'}
                          </strong>{' '}
                          {soloEnReales.length === 1 ? 'ganó' : 'ganaron'} de forma sorpresiva, sin que la encuesta{' '}
                          {soloEnReales.length === 1 ? 'lo' : 'los'} proyectara como {soloEnReales.length === 1 ? 'electo' : 'electos'}.
                        </p>
                      )}

                      {mayorGanador && mayorGanador.diferencia !== 0 && (
                        <p className="leading-relaxed">
                          El pacto <strong className="text-indigo-700">{PACTO_NOMBRES[mayorGanador.pacto]}</strong>{' '}
                          experimentó el cambio más significativo, obteniendo{' '}
                          <span className={`font-bold ${mayorGanador.diferencia > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(mayorGanador.diferencia)} {Math.abs(mayorGanador.diferencia) === 1 ? 'escaño' : 'escaños'}{' '}
                            {mayorGanador.diferencia > 0 ? 'más' : 'menos'}
                          </span>{' '}
                          de lo proyectado.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export default ComparativaDistritos
