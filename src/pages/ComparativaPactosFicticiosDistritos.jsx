import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import nombresDistritos from '../../mock/nombresDistritos.json'
import { useVotos } from '../context/VotosContext'

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
}

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
}

const ComparativaPactosFicticiosDistritos = () => {
  const [searchParams] = useSearchParams()
  const tipoCalculo1 = searchParams.get('calculo1') || 'normal'
  const tipoCalculo2 = searchParams.get('calculo2') || 'normal'
  
  const { cargarDistrito, getDistritoData } = useVotos()
  
  // Estados para Lista 1
  const [candidatosLista1, setCandidatosLista1] = useState([])
  const [votosAcumuladosLista1, setVotosAcumuladosLista1] = useState([])
  const [partidosAcumuladosLista1, setPartidosAcumuladosLista1] = useState([])
  const [candidatosElectosLista1, setCandidatosElectosLista1] = useState([])
  const [pactoExpandidoLista1, setPactoExpandidoLista1] = useState(null)
  const [partidoExpandidoLista1, setPartidoExpandidoLista1] = useState(null)
  
  // Estados para Lista 2
  const [candidatosLista2, setCandidatosLista2] = useState([])
  const [votosAcumuladosLista2, setVotosAcumuladosLista2] = useState([])
  const [partidosAcumuladosLista2, setPartidosAcumuladosLista2] = useState([])
  const [candidatosElectosLista2, setCandidatosElectosLista2] = useState([])
  const [pactoExpandidoLista2, setPactoExpandidoLista2] = useState(null)
  const [partidoExpandidoLista2, setPartidoExpandidoLista2] = useState(null)
  
  // Estados compartidos
  const [distritos, setDistritos] = useState([])
  const [selectedDistrito, setSelectedDistrito] = useState('')
  const [escanos, setEscanos] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingVotos, setLoadingVotos] = useState(false)
  const [error, setError] = useState(null)
  const [tipoTabla, setTipoTabla] = useState('pacto')

  const getTipoCalculoNombre = (tipo) => {
    const nombres = {
      normal: "Pactos Reales (J + K separados)",
      derecha: "Pacto Ficticio JK (Toda la Derecha)",
      izquierda: "Pacto Ficticio AH (Toda la Izquierda)"
    }
    return nombres[tipo] || tipo
  }

  const getTipoCalculoCorto = (tipo) => {
    const nombres = {
      normal: "Normal",
      derecha: "JK Unido",
      izquierda: "AH Unido"
    }
    return nombres[tipo] || tipo
  }

  const getPactosAfectados = (tipo) => {
    if (tipo === 'derecha') return ['J', 'K']
    if (tipo === 'izquierda') return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    return []
  }

  const getDistritoNombre = (id) => {
    const distrito = nombresDistritos.find(d => d.id === id)
    return distrito ? distrito.name : `Distrito ${id}`
  }

  const getEscanos = (id) => {
    if (!escanos || escanos.length === 0) return null
    const escano = escanos.find(e => e.numero_distrito === parseInt(id))
    return escano ? escano.escanos : null
  }

  const getPactoNombre = (codigo) => {
    return PACTO_NOMBRES[codigo] || codigo
  }

  const getPartidoNombre = (codigo) => {
    return PARTIDO_NOMBRES[codigo] || codigo
  }

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
    }
    return colores[codigo] || "bg-gray-100 text-gray-800"
  }

  const getPartidoColor = (codigo) => {
    const colores = {
      PEV: "bg-lime-100 text-lime-900",
      FRVS: "bg-green-200 text-green-900",
      AH: "bg-teal-200 text-teal-900",
      FA: "bg-red-200 text-red-900",
      PS: "bg-red-200 text-red-900",
      PC: "bg-red-300 text-red-950",
      DC: "bg-purple-200 text-purple-900",
      PPD: "bg-red-200 text-red-900",
      PL: "bg-pink-200 text-pink-900",
      PR: "bg-lime-300 text-lime-950",
      PH: "bg-teal-100 text-teal-900",
      AMR: "bg-amber-300 text-amber-950",
      PTR: "bg-rose-300 text-rose-950",
      AVP: "bg-teal-100 text-teal-900",
      POP: "bg-gray-200 text-gray-900",
      PDG: "bg-orange-200 text-orange-900",
      UDI: "bg-blue-400 text-blue-950",
      RN: "bg-blue-200 text-blue-900",
      EVOP: "bg-indigo-200 text-indigo-900",
      DEM: "bg-indigo-200 text-indigo-900",
      PSC: "bg-yellow-200 text-yellow-900",
      PNL: "bg-yellow-300 text-yellow-950",
      REP: "bg-cyan-300 text-cyan-950",
      IND: "bg-slate-300 text-slate-950",
    }
    return colores[codigo] || "bg-gray-200 text-gray-800"
  }

  const togglePactoLista1 = (pacto) => {
    setPactoExpandidoLista1(pactoExpandidoLista1 === pacto ? null : pacto)
  }

  const togglePartidoLista1 = (partido) => {
    setPartidoExpandidoLista1(partidoExpandidoLista1 === partido ? null : partido)
  }

  const togglePactoLista2 = (pacto) => {
    setPactoExpandidoLista2(pactoExpandidoLista2 === pacto ? null : pacto)
  }

  const togglePartidoLista2 = (partido) => {
    setPartidoExpandidoLista2(partidoExpandidoLista2 === partido ? null : partido)
  }

  useEffect(() => {
    setDistritos(nombresDistritos)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (selectedDistrito) {
      fetchCandidatosDistrito(selectedDistrito)
    }
  }, [selectedDistrito, tipoCalculo1, tipoCalculo2])

  const fetchCandidatosDistrito = async (distrito) => {
    try {
      setLoadingVotos(true)

      // Cargar datos con tipo de cálculo 1
      let dataLista1 = getDistritoData(distrito, 'reales', tipoCalculo1)
      if (!dataLista1) {
        dataLista1 = await cargarDistrito(distrito, 'reales', tipoCalculo1)
      }

      // Cargar datos con tipo de cálculo 2
      let dataLista2 = getDistritoData(distrito, 'reales', tipoCalculo2)
      if (!dataLista2) {
        dataLista2 = await cargarDistrito(distrito, 'reales', tipoCalculo2)
      }

      // Procesar datos de Lista 1
      if (dataLista1) {
        const candidatosDistritoLista1 = dataLista1.candidatos || []
        const electosLista1 = dataLista1.candidatos_electos || []

        const listasMapLista1 = {}
        const partidosMapLista1 = {}
        
        candidatosDistritoLista1.forEach(candidato => {
          const votos = candidato.votos_reales_cantidad || candidato.votos || 0
          const pacto = candidato.pacto || 'SIN PACTO'
          const partido = candidato.partido || 'IND'
          
          if (!listasMapLista1[pacto]) {
            listasMapLista1[pacto] = { 
              codigo: pacto, 
              lista: pacto,
              votos: 0
            }
          }
          listasMapLista1[pacto].votos += votos
          
          if (!partidosMapLista1[partido]) {
            partidosMapLista1[partido] = { 
              codigo: partido,
              partido: partido,
              pacto: pacto,
              votos: 0
            }
          }
          partidosMapLista1[partido].votos += votos
        })

        setCandidatosLista1(candidatosDistritoLista1)
        setCandidatosElectosLista1(electosLista1)
        setVotosAcumuladosLista1(Object.values(listasMapLista1))
        setPartidosAcumuladosLista1(Object.values(partidosMapLista1))
      }

      // Procesar datos de Lista 2
      if (dataLista2) {
        const candidatosDistritoLista2 = dataLista2.candidatos || []
        const electosLista2 = dataLista2.candidatos_electos || []

        const listasMapLista2 = {}
        const partidosMapLista2 = {}
        
        candidatosDistritoLista2.forEach(candidato => {
          const votos = candidato.votos_reales_cantidad || candidato.votos || 0
          const pacto = candidato.pacto || 'SIN PACTO'
          const partido = candidato.partido || 'IND'
          
          if (!listasMapLista2[pacto]) {
            listasMapLista2[pacto] = { 
              codigo: pacto, 
              lista: pacto,
              votos: 0
            }
          }
          listasMapLista2[pacto].votos += votos
          
          if (!partidosMapLista2[partido]) {
            partidosMapLista2[partido] = { 
              codigo: partido,
              partido: partido,
              pacto: pacto,
              votos: 0
            }
          }
          partidosMapLista2[partido].votos += votos
        })

        setCandidatosLista2(candidatosDistritoLista2)
        setCandidatosElectosLista2(electosLista2)
        setVotosAcumuladosLista2(Object.values(listasMapLista2))
        setPartidosAcumuladosLista2(Object.values(partidosMapLista2))
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
      setError('Error al cargar los datos del distrito')
      setLoadingVotos(false)
    }
  }

  // Componente para la sección de análisis comparativo
  const SeccionComparativa = ({ titulo, electos, colorTema, tipoCalculo, electosComparacion }) => {
    const pactosAfectados = getPactosAfectados(tipoCalculo)
    let electosPactosFicticios = 0
    
    // Si es un cálculo de pacto ficticio, contar solo los electos de los pactos afectados
    if (pactosAfectados.length > 0 && electosComparacion) {
      if (tipoCalculo === 'derecha') {
        electosPactosFicticios = electosComparacion.filter(c => c.pacto === 'JK').length
      } else if (tipoCalculo === 'izquierda') {
        electosPactosFicticios = electosComparacion.filter(c => c.pacto === 'AH').length
      }
    }

    return (
      <div className={`flex-1 bg-white rounded-lg shadow-lg p-6 border-2 ${colorTema === 'purple' ? 'border-purple-200' : 'border-blue-200'}`}>
        <div className={`mb-4 p-3 rounded-lg ${colorTema === 'purple' ? 'bg-purple-50' : 'bg-blue-50'}`}>
          <h2 className={`text-xl font-bold ${colorTema === 'purple' ? 'text-purple-800' : 'text-blue-800'}`}>
            {titulo}
          </h2>
        </div>
        <div className="text-center py-4">
          <div className={`text-4xl font-bold ${colorTema === 'purple' ? 'text-purple-600' : 'text-blue-600'}`}>
            {electos.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Candidatos Electos</div>
          
          {pactosAfectados.length > 0 && electosPactosFicticios > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-lg font-semibold text-gray-700">
                {electosPactosFicticios}
              </div>
              <div className="text-xs text-gray-500">
                Electos del pacto {tipoCalculo === 'derecha' ? 'JK' : 'AH'}
              </div>
            </div>
          )}

          {tipoCalculo === 'normal' && pactosAfectados.length === 0 && electosComparacion && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {getPactosAfectados('derecha').map(p => {
                  const count = electosComparacion.filter(c => c.pacto === p).length
                  return count > 0 ? `${p}: ${count}` : null
                }).filter(Boolean).join(', ') || 'Sin datos de J, K'}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4">
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
            <h1 className="text-4xl font-bold text-gray-800">Comparativa de Pactos Ficticios</h1>
          </div>
          <p className="text-gray-600 mb-2">
            Análisis del impacto de unir pactos: ¿ganan más escaños juntos o separados?
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap mt-4">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full">
                Lista 1
              </span>
              <span className="text-sm text-gray-700">{getTipoCalculoNombre(tipoCalculo1)}</span>
            </div>
            <span className="text-gray-400">vs</span>
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                Lista 2
              </span>
              <span className="text-sm text-gray-700">{getTipoCalculoNombre(tipoCalculo2)}</span>
            </div>
          </div>
          
          {/* Información explicativa */}
          {((tipoCalculo1 === 'derecha' && tipoCalculo2 === 'normal') || (tipoCalculo2 === 'derecha' && tipoCalculo1 === 'normal')) && (
            <div className="mt-4 mx-auto max-w-2xl bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>JK Ficticio:</strong> Pactos J (Chile Grande y Unido) y K (Cambio por Chile) unidos como un solo pacto
              </p>
            </div>
          )}
          
          {((tipoCalculo1 === 'izquierda' && tipoCalculo2 === 'normal') || (tipoCalculo2 === 'izquierda' && tipoCalculo1 === 'normal')) && (
            <div className="mt-4 mx-auto max-w-2xl bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>AH Ficticio:</strong> Todos los pactos de izquierda (A-H) unidos como un solo pacto
              </p>
            </div>
          )}
        </header>

        {/* Selector de distrito */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccione un Distrito Electoral
          </label>
          <select
            value={selectedDistrito}
            onChange={(e) => setSelectedDistrito(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">-- Seleccione un distrito --</option>
            {distritos.map((distrito) => (
              <option key={distrito.id} value={distrito.id}>
                {distrito.id} - {distrito.name}
              </option>
            ))}
          </select>
        </div>

        {selectedDistrito && !loadingVotos && (
          <>
            {/* Resumen comparativo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <SeccionComparativa 
                titulo={getTipoCalculoCorto(tipoCalculo1)}
                electos={candidatosElectosLista1}
                colorTema="purple"
                tipoCalculo={tipoCalculo1}
                electosComparacion={candidatosElectosLista1}
              />
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center py-4">
                  {(() => {
                    // Calcular diferencia correcta según el tipo de comparación
                    let diferencia = 0
                    let mensaje = ""
                    
                    if (tipoCalculo1 === 'derecha' && tipoCalculo2 === 'normal') {
                      const electosJK = candidatosElectosLista1.filter(c => c.pacto === 'JK').length
                      const electosJ = candidatosElectosLista2.filter(c => c.pacto === 'J').length
                      const electosK = candidatosElectosLista2.filter(c => c.pacto === 'K').length
                      diferencia = electosJK - (electosJ + electosK)
                      mensaje = diferencia > 0 
                        ? `JK unido gana ${diferencia} escaños más`
                        : diferencia < 0 
                        ? `J+K separados ganan ${Math.abs(diferencia)} escaños más`
                        : "Sin diferencia"
                    } else if (tipoCalculo1 === 'izquierda' && tipoCalculo2 === 'normal') {
                      const electosAH = candidatosElectosLista1.filter(c => c.pacto === 'AH').length
                      const pactosIzquierda = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
                      const electosIzquierdaSeparados = candidatosElectosLista2.filter(c => pactosIzquierda.includes(c.pacto)).length
                      diferencia = electosAH - electosIzquierdaSeparados
                      mensaje = diferencia > 0 
                        ? `AH unido gana ${diferencia} escaños más`
                        : diferencia < 0 
                        ? `A-H separados ganan ${Math.abs(diferencia)} escaños más`
                        : "Sin diferencia"
                    } else if (tipoCalculo2 === 'derecha' && tipoCalculo1 === 'normal') {
                      const electosJK = candidatosElectosLista2.filter(c => c.pacto === 'JK').length
                      const electosJ = candidatosElectosLista1.filter(c => c.pacto === 'J').length
                      const electosK = candidatosElectosLista1.filter(c => c.pacto === 'K').length
                      diferencia = electosJK - (electosJ + electosK)
                      mensaje = diferencia > 0 
                        ? `JK unido gana ${diferencia} escaños más`
                        : diferencia < 0 
                        ? `J+K separados ganan ${Math.abs(diferencia)} escaños más`
                        : "Sin diferencia"
                    } else if (tipoCalculo2 === 'izquierda' && tipoCalculo1 === 'normal') {
                      const electosAH = candidatosElectosLista2.filter(c => c.pacto === 'AH').length
                      const pactosIzquierda = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
                      const electosIzquierdaSeparados = candidatosElectosLista1.filter(c => pactosIzquierda.includes(c.pacto)).length
                      diferencia = electosAH - electosIzquierdaSeparados
                      mensaje = diferencia > 0 
                        ? `AH unido gana ${diferencia} escaños más`
                        : diferencia < 0 
                        ? `A-H separados ganan ${Math.abs(diferencia)} escaños más`
                        : "Sin diferencia"
                    } else {
                      diferencia = Math.abs(candidatosElectosLista1.length - candidatosElectosLista2.length)
                      mensaje = "Diferencia total de escaños"
                    }

                    return (
                      <>
                        <div className={`text-4xl font-bold ${
                          diferencia > 0 ? 'text-green-600' : diferencia < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {diferencia > 0 ? '+' : ''}{diferencia}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Diferencia de Escaños</div>
                        <div className={`mt-2 text-xs font-medium ${
                          diferencia > 0 ? 'text-green-600' : diferencia < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {mensaje}
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              <SeccionComparativa 
                titulo={getTipoCalculoCorto(tipoCalculo2)}
                electos={candidatosElectosLista2}
                colorTema="blue"
                tipoCalculo={tipoCalculo2}
                electosComparacion={candidatosElectosLista2}
              />
            </div>

            {/* Contenido principal - Solo candidatos electos */}
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-gray-700">
                Mostrando solo candidatos electos para el Distrito {getDistritoNombre(selectedDistrito)}
                {getEscanos(selectedDistrito) && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({getEscanos(selectedDistrito)} escaños)
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lista 1 - Electos */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
                <div className="mb-4 p-3 rounded-lg bg-purple-50">
                  <h2 className="text-2xl font-bold text-purple-800">
                    {getTipoCalculoNombre(tipoCalculo1)}
                  </h2>
                  <p className="text-sm text-purple-600">Lista 1</p>
                </div>

                {candidatosElectosLista1.length > 0 ? (
                  <div className="space-y-4">
                    {candidatosElectosLista1.map((candidato) => (
                      <div 
                        key={candidato.id} 
                        className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500"
                      >
                        <div className="flex items-start gap-3">
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

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold text-gray-900 truncate" title={candidato.nombre}>
                                {candidato.nombre}
                              </h4>
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 ml-2 shrink-0">
                                ELECTO
                              </span>
                            </div>
                            
                            <div className="flex gap-2 mb-2 flex-wrap">
                              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPactoColor(candidato.pacto)}`}>
                                {candidato.pacto}
                              </span>
                              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPartidoColor(candidato.partido)}`}>
                                {candidato.partido}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 truncate" title={getPartidoNombre(candidato.partido)}>
                              {getPartidoNombre(candidato.partido)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay candidatos electos para mostrar
                  </div>
                )}
              </div>

              {/* Lista 2 - Electos */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
                <div className="mb-4 p-3 rounded-lg bg-blue-50">
                  <h2 className="text-2xl font-bold text-blue-800">
                    {getTipoCalculoNombre(tipoCalculo2)}
                  </h2>
                  <p className="text-sm text-blue-600">Lista 2</p>
                </div>

                {candidatosElectosLista2.length > 0 ? (
                  <div className="space-y-4">
                    {candidatosElectosLista2.map((candidato) => (
                      <div 
                        key={candidato.id} 
                        className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500"
                      >
                        <div className="flex items-start gap-3">
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

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold text-gray-900 truncate" title={candidato.nombre}>
                                {candidato.nombre}
                              </h4>
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 ml-2 shrink-0">
                                ELECTO
                              </span>
                            </div>
                            
                            <div className="flex gap-2 mb-2 flex-wrap">
                              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPactoColor(candidato.pacto)}`}>
                                {candidato.pacto}
                              </span>
                              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPartidoColor(candidato.partido)}`}>
                                {candidato.partido}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 truncate" title={getPartidoNombre(candidato.partido)}>
                              {getPartidoNombre(candidato.partido)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay candidatos electos para mostrar
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {!selectedDistrito && !loadingVotos && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Seleccione un distrito para comenzar
            </h3>
            <p className="text-gray-500">
              Elija un distrito del menú desplegable para ver la comparativa de pactos ficticios
            </p>
          </div>
        )}

        {loadingVotos && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos del distrito...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComparativaPactosFicticiosDistritos
