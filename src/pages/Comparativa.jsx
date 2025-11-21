import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Hemiciclo from '../components/Hemiciclo'
import { useVotos } from '../context/VotosContext'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

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

const Comparativa = () => {
  const { tipoCalculo } = useVotos()
  const [candidatosEncuesta, setCandidatosEncuesta] = useState([])
  const [candidatosReales, setCandidatosReales] = useState([])
  const [loading, setLoading] = useState(true)
  const [estadisticas, setEstadisticas] = useState(null)
  const [progresoEncuesta, setProgresoEncuesta] = useState(0)
  const [progresoReales, setProgresoReales] = useState(0)
  const [encuestaCompleto, setEncuestaCompleto] = useState(false)
  const [realesCompleto, setRealesCompleto] = useState(false)
  const [colorearPor, setColorearPor] = useState('partido')
  
  // Usar useRef para contadores que se actualizan en callbacks asíncronos
  const completadosEncuestaRef = useRef(0)
  const completadosRealesRef = useRef(0)

  useEffect(() => {
    cargarDatosComparativos()
  }, [])

  const cargarDatosComparativos = async () => {
    try {
      setLoading(true)
      setProgresoEncuesta(0)
      setProgresoReales(0)
      setEncuestaCompleto(false)
      setRealesCompleto(false)
      
      // Resetear contadores
      completadosEncuestaRef.current = 0
      completadosRealesRef.current = 0
      
      const totalDistritos = 28
      
      // Crear TODAS las 56 promesas de fetch simultáneamente
      const todasLasPromesas = []
      const indicesEncuesta = []
      const indicesReales = []

      // Lanzar todas las llamadas de encuesta y reales entremezcladas
      for (let distrito = 1; distrito <= 28; distrito++) {
        // Encuesta
        let urlEncuesta = `${API_BASE_URL}/api/candidatos/${distrito}?votos=encuesta`
        if (tipoCalculo === 'izquierda') {
          urlEncuesta += '&pacto_ficticio=toda_izquierda'
        } else if (tipoCalculo === 'derecha') {
          urlEncuesta += '&pacto_ficticio=toda_derecha'
        }

        indicesEncuesta.push(todasLasPromesas.length)
        todasLasPromesas.push(
          fetch(urlEncuesta)
            .then(res => res.json())
            .then(data => {
              const electos = data.resultados?.candidatos_electos || []
              completadosEncuestaRef.current++
              setProgresoEncuesta((completadosEncuestaRef.current / totalDistritos) * 100)
              return electos
            })
            .catch(err => {
              console.error(`Error al obtener distrito ${distrito} (encuesta):`, err)
              completadosEncuestaRef.current++
              setProgresoEncuesta((completadosEncuestaRef.current / totalDistritos) * 100)
              return []
            })
        )

        // Reales
        let urlReales = `${API_BASE_URL}/api/candidatos/${distrito}?votos=reales`
        if (tipoCalculo === 'izquierda') {
          urlReales += '&pacto_ficticio=toda_izquierda'
        } else if (tipoCalculo === 'derecha') {
          urlReales += '&pacto_ficticio=toda_derecha'
        }

        indicesReales.push(todasLasPromesas.length)
        todasLasPromesas.push(
          fetch(urlReales)
            .then(res => res.json())
            .then(data => {
              const electos = data.resultados?.candidatos_electos || []
              completadosRealesRef.current++
              setProgresoReales((completadosRealesRef.current / totalDistritos) * 100)
              return electos
            })
            .catch(err => {
              console.error(`Error al obtener distrito ${distrito} (reales):`, err)
              completadosRealesRef.current++
              setProgresoReales((completadosRealesRef.current / totalDistritos) * 100)
              return []
            })
        )
      }

      // Esperar a que TODAS las 56 llamadas terminen simultáneamente
      const todosLosResultados = await Promise.all(todasLasPromesas)
      
      // Separar resultados de encuesta y reales
      const resultadosEncuesta = indicesEncuesta.map(i => todosLosResultados[i])
      const resultadosReales = indicesReales.map(i => todosLosResultados[i])
      
      setEncuestaCompleto(true)
      setRealesCompleto(true)
      
      // Combinar todos los electos
      const todosElectosEncuesta = []
      const todosElectosReales = []
      
      resultadosEncuesta.forEach(electos => {
        todosElectosEncuesta.push(...electos)
      })
      
      resultadosReales.forEach(electos => {
        todosElectosReales.push(...electos)
      })

      console.log('=== RESUMEN FINAL ===')
      console.log('Total candidatos encuesta:', todosElectosEncuesta.length)
      console.log('Total candidatos reales:', todosElectosReales.length)
      console.log('Primeros 3 candidatos encuesta:', todosElectosEncuesta.slice(0, 3))
      console.log('Primeros 3 candidatos reales:', todosElectosReales.slice(0, 3))
      
      // Verificar partidos únicos
      const partidosEncuesta = [...new Set(todosElectosEncuesta.map(c => c.partido))]
      const partidosReales = [...new Set(todosElectosReales.map(c => c.partido))]
      console.log('Partidos únicos encuesta:', partidosEncuesta)
      console.log('Partidos únicos reales:', partidosReales)
      
      setCandidatosEncuesta(todosElectosEncuesta)
      setCandidatosReales(todosElectosReales)
      
      // Calcular estadísticas
      calcularEstadisticas(todosElectosEncuesta, todosElectosReales)
      
      setLoading(false)
    } catch (err) {
      console.error('Error al cargar datos comparativos:', err)
      setLoading(false)
    }
  }

  const calcularEstadisticas = (encuesta, reales) => {
    // Contar por partido
    const contarPorPartido = (candidatos) => {
      const conteo = {}
      candidatos.forEach(c => {
        conteo[c.partido] = (conteo[c.partido] || 0) + 1
      })
      return conteo
    }

    // Contar por pacto
    const contarPorPacto = (candidatos) => {
      const conteo = {}
      candidatos.forEach(c => {
        const pacto = c.pacto || 'SIN_PACTO'
        conteo[pacto] = (conteo[pacto] || 0) + 1
      })
      return conteo
    }

    const encuestaPartidos = contarPorPartido(encuesta)
    const realesPartidos = contarPorPartido(reales)
    const encuestaPactos = contarPorPacto(encuesta)
    const realesPactos = contarPorPacto(reales)

    // Calcular diferencias por partido
    const diferencias = []
    const todosPartidos = new Set([...Object.keys(encuestaPartidos), ...Object.keys(realesPartidos)])
    
    todosPartidos.forEach(partido => {
      const enc = encuestaPartidos[partido] || 0
      const real = realesPartidos[partido] || 0
      const diff = enc - real
      diferencias.push({
        partido,
        encuesta: enc,
        reales: real,
        diferencia: diff,
        precision: real > 0 ? Math.abs((enc - real) / real * 100) : (enc > 0 ? 100 : 0)
      })
    })

    // Calcular diferencias por pacto
    const diferenciasPacto = []
    const todosPactos = new Set([...Object.keys(encuestaPactos), ...Object.keys(realesPactos)])
    
    todosPactos.forEach(pacto => {
      const enc = encuestaPactos[pacto] || 0
      const real = realesPactos[pacto] || 0
      const diff = enc - real
      diferenciasPacto.push({
        pacto,
        encuesta: enc,
        reales: real,
        diferencia: diff,
        precision: real > 0 ? Math.abs((enc - real) / real * 100) : (enc > 0 ? 100 : 0)
      })
    })

    // Identificar candidatos que salieron en encuesta pero no en reales
    const candidatosNoElectosReales = encuesta.filter(candEnc => {
      // Buscar si este candidato está en los reales
      const estaEnReales = reales.some(candReal => 
        candReal.nombre === candEnc.nombre && candReal.distrito === candEnc.distrito
      )
      return !estaEnReales
    })

    // Agrupar por partido
    const noElectosPorPartido = {}
    candidatosNoElectosReales.forEach(cand => {
      if (!noElectosPorPartido[cand.partido]) {
        noElectosPorPartido[cand.partido] = []
      }
      noElectosPorPartido[cand.partido].push(cand)
    })

    // Calcular diferencias de porcentaje por partido
    const diferenciasPorcentaje = diferencias.map(diff => {
      const totalEncuesta = encuesta.length
      const totalReales = reales.length
      
      const porcentajeEncuesta = totalEncuesta > 0 ? (diff.encuesta / totalEncuesta * 100) : 0
      const porcentajeReales = totalReales > 0 ? (diff.reales / totalReales * 100) : 0
      const diferenciaPorcentual = porcentajeEncuesta - porcentajeReales
      
      return {
        partido: diff.partido,
        porcentajeEncuesta: porcentajeEncuesta.toFixed(2),
        porcentajeReales: porcentajeReales.toFixed(2),
        diferenciaPorcentual: diferenciaPorcentual.toFixed(2),
        escañosEncuesta: diff.encuesta,
        escañosReales: diff.reales
      }
    }).sort((a, b) => Math.abs(parseFloat(b.diferenciaPorcentual)) - Math.abs(parseFloat(a.diferenciaPorcentual)))

    // Calcular diferencias de porcentaje por pacto
    const diferenciasPorcentajePacto = diferenciasPacto.map(diff => {
      const totalEncuesta = encuesta.length
      const totalReales = reales.length
      
      const porcentajeEncuesta = totalEncuesta > 0 ? (diff.encuesta / totalEncuesta * 100) : 0
      const porcentajeReales = totalReales > 0 ? (diff.reales / totalReales * 100) : 0
      const diferenciaPorcentual = porcentajeEncuesta - porcentajeReales
      
      return {
        pacto: diff.pacto,
        porcentajeEncuesta: porcentajeEncuesta.toFixed(2),
        porcentajeReales: porcentajeReales.toFixed(2),
        diferenciaPorcentual: diferenciaPorcentual.toFixed(2),
        escañosEncuesta: diff.encuesta,
        escañosReales: diff.reales
      }
    }).sort((a, b) => Math.abs(parseFloat(b.diferenciaPorcentual)) - Math.abs(parseFloat(a.diferenciaPorcentual)))

    // Calcular métricas generales
    const totalDiferencias = diferencias.reduce((sum, d) => sum + Math.abs(d.diferencia), 0)
    const promedioError = diferencias.length > 0 ? totalDiferencias / diferencias.length : 0
    const aciertosExactos = diferencias.filter(d => d.diferencia === 0).length
    const precisionGeneral = diferencias.length > 0 ? (aciertosExactos / diferencias.length * 100) : 0

    setEstadisticas({
      diferencias: diferencias.sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia)),
      diferenciasPacto: diferenciasPacto.sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia)),
      diferenciasPorcentaje,
      diferenciasPorcentajePacto,
      candidatosNoElectosReales,
      noElectosPorPartido,
      totalEncuesta: encuesta.length,
      totalReales: reales.length,
      diferenciaTotal: encuesta.length - reales.length,
      promedioError: promedioError.toFixed(2),
      aciertosExactos,
      precisionGeneral: precisionGeneral.toFixed(1)
    })
  }

  const getPactoNombre = (codigo) => {
    const nombres = {
      A: "Ecologista Verde",
      B: "Verdes, Regionalistas",
      C: "Unidad por Chile",
      D: "Izquierda Ecologista",
      E: "Amarillos por Chile",
      F: "Trabajadores Revolucionarios",
      G: "Alianza Verde Popular",
      H: "Popular",
      I: "Partido de la Gente",
      J: "Chile Grande y Unido",
      K: "Cambio por Chile",
      SIN_PACTO: "Sin Pacto"
    }
    return nombres[codigo] || codigo
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

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-100 flex items-center justify-center py-8 px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Cargando Datos Comparativos</h2>
          
          {/* Barra de progreso Encuesta */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-indigo-700">Datos de Encuesta</span>
                {encuestaCompleto && (
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
              <span className="text-sm font-medium text-gray-600">{Math.round(progresoEncuesta)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progresoEncuesta}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Cargando 28 distritos...</p>
          </div>

          {/* Barra de progreso Reales */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-700">Datos Reales</span>
                {realesCompleto && (
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
              <span className="text-sm font-medium text-gray-600">{Math.round(progresoReales)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-green-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progresoReales}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Cargando 28 distritos...</p>
          </div>

          {/* Indicador de procesamiento final */}
          {encuestaCompleto && realesCompleto && (
            <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium text-blue-700">Procesando estadísticas...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="ml-2 font-medium">Volver</span>
            </Link>
            <h1 className="text-4xl font-bold text-gray-800 ml-auto">Comparativa Electoral</h1>
          </div>
          <p className="text-gray-600">Comparación entre votos de encuesta y votos reales</p>
        </header>

        {/* Estadísticas Generales */}
        {estadisticas && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Encuesta</p>
                    <p className="text-3xl font-bold text-indigo-600">{estadisticas.totalEncuesta}</p>
                  </div>
                  <svg className="w-12 h-12 text-indigo-200" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Reales</p>
                    <p className="text-3xl font-bold text-green-600">{estadisticas.totalReales}</p>
                  </div>
                  <svg className="w-12 h-12 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Diferencia Total</p>
                    <p className={`text-3xl font-bold ${estadisticas.diferenciaTotal === 0 ? 'text-gray-600' : estadisticas.diferenciaTotal > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                      {estadisticas.diferenciaTotal > 0 ? '+' : ''}{estadisticas.diferenciaTotal}
                    </p>
                  </div>
                  <svg className="w-12 h-12 text-orange-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Aciertos Exactos</p>
                    <p className="text-3xl font-bold text-purple-600">{estadisticas.aciertosExactos}</p>
                    <p className="text-xs text-gray-500 mt-1">{estadisticas.precisionGeneral}% precisión</p>
                  </div>
                  <svg className="w-12 h-12 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Botón de Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-lg shadow-md p-2 inline-flex gap-2">
                <button
                  onClick={() => setColorearPor('partido')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    colorearPor === 'partido'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Por Partido
                </button>
                <button
                  onClick={() => setColorearPor('pacto')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    colorearPor === 'pacto'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Por Pacto
                </button>
              </div>
            </div>

            {/* Hemiciclos Comparativos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Hemiciclo Encuesta */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Encuesta</h2>
                  <p className="text-sm text-gray-600">{candidatosEncuesta.length} escaños proyectados</p>
                </div>
                <div className="flex justify-center">
                  <Hemiciclo 
                    candidatosElectos={candidatosEncuesta}
                    getPactoColor={colorearPor === 'partido' ? getPartidoColor : getPactoColor}
                    getPartidoNombre={colorearPor === 'partido' ? getPartidoNombre : getPactoNombre}
                    colorearPor={colorearPor}
                  />
                </div>
              </div>

              {/* Hemiciclo Real */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Resultados Reales</h2>
                  <p className="text-sm text-gray-600">{candidatosReales.length} escaños obtenidos</p>
                </div>
                <div className="flex justify-center">
                  <Hemiciclo 
                    candidatosElectos={candidatosReales}
                    getPactoColor={colorearPor === 'partido' ? getPartidoColor : getPactoColor}
                    getPartidoNombre={colorearPor === 'partido' ? getPartidoNombre : getPactoNombre}
                    colorearPor={colorearPor}
                  />
                </div>
              </div>
            </div>

            {/* Tabla de Diferencias por Partido */}
            {colorearPor === 'partido' && estadisticas.diferencias.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Diferencias por Partido</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Partido
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Encuesta
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reales
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Diferencia
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visualización
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {estadisticas.diferencias.map((diff, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className={`inline-block w-4 h-4 rounded ${getPartidoColor(diff.partido)}`}></span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{diff.partido}</div>
                                <div className="text-xs text-gray-500">{getPartidoNombre(diff.partido)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                              {diff.encuesta}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                              {diff.reales}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              diff.diferencia === 0 ? 'bg-gray-100 text-gray-800' :
                              diff.diferencia > 0 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {diff.diferencia > 0 ? '+' : ''}{diff.diferencia}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div 
                                  className="bg-indigo-500 h-full" 
                                  style={{ width: `${(diff.encuesta / Math.max(diff.encuesta, diff.reales, 1)) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div 
                                  className="bg-green-500 h-full" 
                                  style={{ width: `${(diff.reales / Math.max(diff.encuesta, diff.reales, 1)) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tabla de Diferencias por Pacto */}
            {colorearPor === 'pacto' && estadisticas.diferenciasPacto && estadisticas.diferenciasPacto.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Diferencias por Pacto</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pacto
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Encuesta
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reales
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Diferencia
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visualización
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {estadisticas.diferenciasPacto.map((diff, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className={`inline-block w-4 h-4 rounded ${getPactoColor(diff.pacto)}`}></span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{diff.pacto}</div>
                                <div className="text-xs text-gray-500">{getPactoNombre(diff.pacto)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                              {diff.encuesta}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                              {diff.reales}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              diff.diferencia === 0 ? 'bg-gray-100 text-gray-800' :
                              diff.diferencia > 0 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {diff.diferencia > 0 ? '+' : ''}{diff.diferencia}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div 
                                  className="bg-indigo-500 h-full" 
                                  style={{ width: `${(diff.encuesta / Math.max(diff.encuesta, diff.reales, 1)) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div 
                                  className="bg-green-500 h-full" 
                                  style={{ width: `${(diff.reales / Math.max(diff.encuesta, diff.reales, 1)) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Diferencias Porcentuales por Partido */}
            {colorearPor === 'partido' && estadisticas.diferenciasPorcentaje && estadisticas.diferenciasPorcentaje.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Diferencias Porcentuales - Encuesta vs Resultados Reales</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Comparación del porcentaje de escaños obtenidos por cada partido
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Partido
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % Encuesta
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % Real
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Diferencia %
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Escaños (Enc/Real)
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visualización
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {estadisticas.diferenciasPorcentaje.map((diff, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className={`inline-block w-4 h-4 rounded ${getPartidoColor(diff.partido)}`}></span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{diff.partido}</div>
                                <div className="text-xs text-gray-500">{getPartidoNombre(diff.partido)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                              {diff.porcentajeEncuesta}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                              {diff.porcentajeReales}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              Math.abs(parseFloat(diff.diferenciaPorcentual)) < 0.5 ? 'bg-gray-100 text-gray-800' :
                              parseFloat(diff.diferenciaPorcentual) > 0 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {parseFloat(diff.diferenciaPorcentual) > 0 ? '+' : ''}{diff.diferenciaPorcentual}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm text-gray-700 font-medium">
                              {diff.escañosEncuesta} / {diff.escañosReales}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-500 w-16">Encuesta</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                  <div 
                                    className="bg-indigo-500 h-full transition-all" 
                                    style={{ width: `${diff.porcentajeEncuesta}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-16">Real</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                  <div 
                                    className="bg-green-500 h-full transition-all" 
                                    style={{ width: `${diff.porcentajeReales}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Diferencias Porcentuales por Pacto */}
            {colorearPor === 'pacto' && estadisticas.diferenciasPorcentajePacto && estadisticas.diferenciasPorcentajePacto.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Diferencias Porcentuales por Pacto - Encuesta vs Resultados Reales</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Comparación del porcentaje de escaños obtenidos por cada pacto
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pacto
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % Encuesta
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % Real
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Diferencia %
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Escaños (Enc/Real)
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visualización
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {estadisticas.diferenciasPorcentajePacto.map((diff, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className={`inline-block w-4 h-4 rounded ${getPactoColor(diff.pacto)}`}></span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{diff.pacto}</div>
                                <div className="text-xs text-gray-500">{getPactoNombre(diff.pacto)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                              {diff.porcentajeEncuesta}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                              {diff.porcentajeReales}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              Math.abs(parseFloat(diff.diferenciaPorcentual)) < 0.5 ? 'bg-gray-100 text-gray-800' :
                              parseFloat(diff.diferenciaPorcentual) > 0 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {parseFloat(diff.diferenciaPorcentual) > 0 ? '+' : ''}{diff.diferenciaPorcentual}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm text-gray-700 font-medium">
                              {diff.escañosEncuesta} / {diff.escañosReales}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-500 w-16">Encuesta</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                  <div 
                                    className="bg-indigo-500 h-full transition-all" 
                                    style={{ width: `${diff.porcentajeEncuesta}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-16">Real</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                  <div 
                                    className="bg-green-500 h-full transition-all" 
                                    style={{ width: `${diff.porcentajeReales}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cuadro de Candidatos Proyectados pero No Electos */}
            {estadisticas.candidatosNoElectosReales && estadisticas.candidatosNoElectosReales.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Candidatos Proyectados en Encuesta pero No Electos</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Total: {estadisticas.candidatosNoElectosReales.length} candidatos que aparecían como electos en la encuesta pero no resultaron electos
                  </p>
                </div>

                {/* Resumen por Partido */}
                <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(estadisticas.noElectosPorPartido).map(([partido, candidatos]) => (
                    <div key={partido} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block w-3 h-3 rounded ${getPartidoColor(partido)}`}></span>
                        <span className="text-sm font-bold text-gray-900">{partido}</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">{candidatos.length}</div>
                      <div className="text-xs text-gray-500">no electos</div>
                    </div>
                  ))}
                </div>

                {/* Tabla Detallada */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidato
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Partido
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Distrito
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pacto
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {estadisticas.candidatosNoElectosReales
                        .sort((a, b) => {
                          // Extraer id_distrito desde zona
                          const getIdDistrito = (c) => {
                            if (c.zona) {
                              if (c.zona.startsWith('600')) {
                                return parseInt(c.zona.slice(3), 10)
                              } else if (c.zona.startsWith('60')) {
                                return parseInt(c.zona.slice(2), 10)
                              }
                            }
                            return c.distrito ? parseInt(c.distrito, 10) : 0
                          }
                          const distritoA = getIdDistrito(a)
                          const distritoB = getIdDistrito(b)
                          if (distritoA !== distritoB) {
                            return distritoA - distritoB
                          }
                          // Si es el mismo distrito, ordenar por nombre
                          return a.nombre.localeCompare(b.nombre)
                        })
                        .map((candidato, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{candidato.nombre}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={`inline-block w-3 h-3 rounded ${getPartidoColor(candidato.partido)}`}></span>
                                <span className="text-sm font-medium text-gray-900">{candidato.partido}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm text-gray-900">
                                {(() => {
                                  // Extraer id_distrito desde zona
                                  if (candidato.zona) {
                                    if (candidato.zona.startsWith('600')) {
                                      return candidato.zona.slice(3)
                                    } else if (candidato.zona.startsWith('60')) {
                                      return candidato.zona.slice(2)
                                    }
                                  }
                                  // Fallback: mostrar distrito si existe
                                  return candidato.distrito || '-'
                                })()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {candidato.pacto ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span className={`inline-block w-3 h-3 rounded ${getPactoColor(candidato.pacto)}`}></span>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{candidato.pacto}</div>
                                    <div className="text-xs text-gray-500">{getPactoNombre(candidato.pacto)}</div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-600">Sin pacto</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Comparativa
