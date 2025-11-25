/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Hemiciclo from '../components/Hemiciclo'
import { useVotos } from '../context/VotosContext'
import UserMenu from '../components/UserMenu'

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

const ComparativaPactosFicticiosHemiciclo = () => {
  const [searchParams] = useSearchParams()
  const tipoCalculo1 = searchParams.get('calculo1') || 'normal'
  const tipoCalculo2 = searchParams.get('calculo2') || 'normal'
  
  const { cargarDistrito, getDistritoData, getDistritosCargadosCount } = useVotos()
  
  const [candidatosLista1, setCandidatosLista1] = useState([])
  const [candidatosLista2, setCandidatosLista2] = useState([])
  const [todosCandidatosLista1, setTodosCandidatosLista1] = useState([])
  const [todosCandidatosLista2, setTodosCandidatosLista2] = useState([])
  const [totalVotosValidosLista1, setTotalVotosValidosLista1] = useState(0)
  const [totalVotosValidosLista2, setTotalVotosValidosLista2] = useState(0)
  const [loading, setLoading] = useState(true)
  const [progresoLista1, setProgresoLista1] = useState(0)
  const [progresoLista2, setProgresoLista2] = useState(0)
  const [lista1Completo, setLista1Completo] = useState(false)
  const [lista2Completo, setLista2Completo] = useState(false)
  const [colorearPor, setColorearPor] = useState('partido')
  
  const completadosLista1Ref = useRef(0)
  const completadosLista2Ref = useRef(0)

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

  /*const getPactoNombre = (codigo) => {
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
      JK: "Toda la Derecha",
      AH: "Toda la Izquierda",
      SIN_PACTO: "Sin Pacto"
    }
    return nombres[codigo] || codigo
  }*/

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
      FA: "bg-red-200 text-red-900",
      RN: "bg-blue-200 text-blue-900",
      PC: "bg-red-300 text-red-950",
      UDI: "bg-blue-400 text-blue-950",
      REP: "bg-cyan-300 text-cyan-950",
      PPD: "bg-red-200 text-red-900",
      PNL: "bg-yellow-300 text-yellow-950",
      PS: "bg-red-200 text-red-900",
      DC: "bg-purple-200 text-purple-900",
      PL: "bg-pink-200 text-pink-900",
      PR: "bg-lime-300 text-lime-950",
      FRVS: "bg-green-200 text-green-900",
      AH: "bg-teal-200 text-teal-900",
      IND: "bg-slate-300 text-slate-950",
      PDG: "bg-orange-200 text-orange-900",
      EVOP: "bg-indigo-200 text-indigo-900",
      EVO: "bg-indigo-200 text-indigo-900",
      DEM: "bg-indigo-200 text-indigo-900",
      PSC: "bg-yellow-200 text-yellow-900",
      AMR: "bg-amber-300 text-amber-950",
      AMA: "bg-amber-300 text-amber-950",
      PTR: "bg-rose-300 text-rose-950",
    }
    return colores[codigo] || "bg-gray-200 text-gray-800"
  }

  const getPartidoNombre = (codigo) => {
    return PARTIDO_NOMBRES[codigo] || codigo
  }

  useEffect(() => {
    cargarDatosComparativos()
  }, [tipoCalculo1, tipoCalculo2])

  const cargarDatosComparativos = async () => {
    try {
      setLoading(true)
      
      completadosLista1Ref.current = 0
      completadosLista2Ref.current = 0
      
      const totalDistritos = 28
      
      const lista1YaCargados = getDistritosCargadosCount('reales', tipoCalculo1)
      const lista2YaCargados = getDistritosCargadosCount('reales', tipoCalculo2)
      
      completadosLista1Ref.current = lista1YaCargados
      completadosLista2Ref.current = lista2YaCargados
      
      setProgresoLista1((lista1YaCargados / totalDistritos) * 100)
      setProgresoLista2((lista2YaCargados / totalDistritos) * 100)
      setLista1Completo(lista1YaCargados === totalDistritos)
      setLista2Completo(lista2YaCargados === totalDistritos)
      
      const promesasLista1 = []
      const promesasLista2 = []

      for (let distrito = 1; distrito <= totalDistritos; distrito++) {
        promesasLista1.push(
          (async () => {
            try {
              let data = getDistritoData(distrito, 'reales', tipoCalculo1)
              
              if (!data) {
                data = await cargarDistrito(distrito, 'reales', tipoCalculo1)
                completadosLista1Ref.current++
                setProgresoLista1((completadosLista1Ref.current / totalDistritos) * 100)
              }
              
              return { 
                electos: data?.candidatos_electos || [], 
                todos: data?.candidatos || [],
                votosValidos: data?.votos_totales_reales || 0 
              }
            } catch {
              completadosLista1Ref.current++
              setProgresoLista1((completadosLista1Ref.current / totalDistritos) * 100)
              return { electos: [], todos: [], votosValidos: 0 }
            }
          })()
        )

        promesasLista2.push(
          (async () => {
            try {
              let data = getDistritoData(distrito, 'reales', tipoCalculo2)
              
              if (!data) {
                data = await cargarDistrito(distrito, 'reales', tipoCalculo2)
                completadosLista2Ref.current++
                setProgresoLista2((completadosLista2Ref.current / totalDistritos) * 100)
              }
              
              return { 
                electos: data?.candidatos_electos || [], 
                todos: data?.candidatos || [],
                votosValidos: data?.votos_totales_reales || 0 
              }
            } catch {
              completadosLista2Ref.current++
              setProgresoLista2((completadosLista2Ref.current / totalDistritos) * 100)
              return { electos: [], todos: [], votosValidos: 0 }
            }
          })()
        )
      }

      const [resultadosLista1, resultadosLista2] = await Promise.all([
        Promise.all(promesasLista1),
        Promise.all(promesasLista2)
      ])
      
      setLista1Completo(true)
      setLista2Completo(true)
      
      const todosElectosLista1 = []
      const todosElectosLista2 = []
      const todosCandidatos1 = []
      const todosCandidatos2 = []
      let totalVotosValidosNacional1 = 0
      let totalVotosValidosNacional2 = 0
      
      resultadosLista1.forEach(resultado => {
        todosElectosLista1.push(...resultado.electos)
        todosCandidatos1.push(...resultado.todos)
        totalVotosValidosNacional1 += resultado.votosValidos
      })
      
      resultadosLista2.forEach(resultado => {
        todosElectosLista2.push(...resultado.electos)
        todosCandidatos2.push(...resultado.todos)
        totalVotosValidosNacional2 += resultado.votosValidos
      })

      setCandidatosLista1(todosElectosLista1)
      setCandidatosLista2(todosElectosLista2)
      setTodosCandidatosLista1(todosCandidatos1)
      setTodosCandidatosLista2(todosCandidatos2)
      setTotalVotosValidosLista1(totalVotosValidosNacional1)
      setTotalVotosValidosLista2(totalVotosValidosNacional2)
      
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-100 flex items-center justify-center py-8 px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Cargando Datos Comparativos</h2>
          
          {/* Barra de progreso Lista 1 */}
          <div className="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full">
                  Lista 1
                </span>
                <span className="text-sm font-semibold text-purple-900">{getTipoCalculoCorto(tipoCalculo1)}</span>
                {lista1Completo && (
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
              <span className="text-sm font-medium text-gray-600">{Math.round(progresoLista1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-purple-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progresoLista1}%` }}
              ></div>
            </div>
          </div>

          {/* Barra de progreso Lista 2 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                  Lista 2
                </span>
                <span className="text-sm font-semibold text-blue-900">{getTipoCalculoCorto(tipoCalculo2)}</span>
                {lista2Completo && (
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
              <span className="text-sm font-medium text-gray-600">{Math.round(progresoLista2)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progresoLista2}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center text-gray-500 text-sm">
            Cargando datos de 28 distritos...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <UserMenu />
        </div>
        {/* Header */}
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
            <h1 className="text-4xl font-bold text-gray-800">Comparativa de Hemiciclos - Pactos Ficticios</h1>
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

        {/* Resumen Comparativo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Lista 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
            <div className="mb-4 p-3 rounded-lg bg-purple-50">
              <h2 className="text-xl font-bold text-purple-800">{getTipoCalculoCorto(tipoCalculo1)}</h2>
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-purple-600">{candidatosLista1.length}</div>
              <div className="text-sm text-gray-600 mt-1">Escaños Totales</div>
              {getPactosAfectados(tipoCalculo1).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-lg font-semibold text-gray-700">
                    {candidatosLista1.filter(c => c.pacto === (tipoCalculo1 === 'derecha' ? 'JK' : 'AH')).length}
                  </div>
                  <div className="text-xs text-gray-500">
                    Escaños del pacto {tipoCalculo1 === 'derecha' ? 'JK' : 'AH'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Diferencia */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center py-4">
              {(() => {
                let diferencia = 0
                let mensaje = ""
                
                if (tipoCalculo1 === 'derecha' && tipoCalculo2 === 'normal') {
                  const electosJK = candidatosLista1.filter(c => c.pacto === 'JK').length
                  const electosJ = candidatosLista2.filter(c => c.pacto === 'J').length
                  const electosK = candidatosLista2.filter(c => c.pacto === 'K').length
                  diferencia = electosJK - (electosJ + electosK)
                  mensaje = diferencia > 0 
                    ? `JK unido gana ${diferencia} escaños más`
                    : diferencia < 0 
                    ? `J+K separados ganan ${Math.abs(diferencia)} escaños más`
                    : "Sin diferencia"
                } else if (tipoCalculo1 === 'izquierda' && tipoCalculo2 === 'normal') {
                  const electosAH = candidatosLista1.filter(c => c.pacto === 'AH').length
                  const pactosIzquierda = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
                  const electosIzquierdaSeparados = candidatosLista2.filter(c => pactosIzquierda.includes(c.pacto)).length
                  diferencia = electosAH - electosIzquierdaSeparados
                  mensaje = diferencia > 0 
                    ? `AH unido gana ${diferencia} escaños más`
                    : diferencia < 0 
                    ? `A-H separados ganan ${Math.abs(diferencia)} escaños más`
                    : "Sin diferencia"
                } else if (tipoCalculo2 === 'derecha' && tipoCalculo1 === 'normal') {
                  const electosJK = candidatosLista2.filter(c => c.pacto === 'JK').length
                  const electosJ = candidatosLista1.filter(c => c.pacto === 'J').length
                  const electosK = candidatosLista1.filter(c => c.pacto === 'K').length
                  diferencia = electosJK - (electosJ + electosK)
                  mensaje = diferencia > 0 
                    ? `JK unido gana ${diferencia} escaños más`
                    : diferencia < 0 
                    ? `J+K separados ganan ${Math.abs(diferencia)} escaños más`
                    : "Sin diferencia"
                } else if (tipoCalculo2 === 'izquierda' && tipoCalculo1 === 'normal') {
                  const electosAH = candidatosLista2.filter(c => c.pacto === 'AH').length
                  const pactosIzquierda = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
                  const electosIzquierdaSeparados = candidatosLista1.filter(c => pactosIzquierda.includes(c.pacto)).length
                  diferencia = electosAH - electosIzquierdaSeparados
                  mensaje = diferencia > 0 
                    ? `AH unido gana ${diferencia} escaños más`
                    : diferencia < 0 
                    ? `A-H separados ganan ${Math.abs(diferencia)} escaños más`
                    : "Sin diferencia"
                } else {
                  diferencia = Math.abs(candidatosLista1.length - candidatosLista2.length)
                  mensaje = "Diferencia total"
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

          {/* Lista 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
            <div className="mb-4 p-3 rounded-lg bg-blue-50">
              <h2 className="text-xl font-bold text-blue-800">{getTipoCalculoCorto(tipoCalculo2)}</h2>
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-blue-600">{candidatosLista2.length}</div>
              <div className="text-sm text-gray-600 mt-1">Escaños Totales</div>
              {getPactosAfectados(tipoCalculo2).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-lg font-semibold text-gray-700">
                    {candidatosLista2.filter(c => c.pacto === (tipoCalculo2 === 'derecha' ? 'JK' : 'AH')).length}
                  </div>
                  <div className="text-xs text-gray-500">
                    Escaños del pacto {tipoCalculo2 === 'derecha' ? 'JK' : 'AH'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas de Cambios por Partido */}
        {candidatosLista1.length > 0 && candidatosLista2.length > 0 && (() => {
          // Calcular escaños por partido en cada lista
          const escanosPorPartidoLista1 = {}
          const escanosPorPartidoLista2 = {}
          
          candidatosLista1.forEach(c => {
            escanosPorPartidoLista1[c.partido] = (escanosPorPartidoLista1[c.partido] || 0) + 1
          })
          
          candidatosLista2.forEach(c => {
            escanosPorPartidoLista2[c.partido] = (escanosPorPartidoLista2[c.partido] || 0) + 1
          })
          
          // Calcular cambios
          const todosLosPartidos = new Set([...Object.keys(escanosPorPartidoLista1), ...Object.keys(escanosPorPartidoLista2)])
          const cambios = []
          
          todosLosPartidos.forEach(partido => {
            const escanos1 = escanosPorPartidoLista1[partido] || 0
            const escanos2 = escanosPorPartidoLista2[partido] || 0
            const diferencia = escanos2 - escanos1
            
            if (diferencia !== 0) {
              cambios.push({ partido, diferencia, escanos1, escanos2 })
            }
          })
          
          // Ordenar: primero los que ganaron (mayor a menor), luego los que perdieron (menor a mayor)
          cambios.sort((a, b) => b.diferencia - a.diferencia)
          
          if (cambios.length === 0) return null
          
          const ganadores = cambios.filter(c => c.diferencia > 0)
          const perdedores = cambios.filter(c => c.diferencia < 0)
          
          return (
            <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-indigo-200">
              <h3 className="text-xl font-bold text-indigo-900 mb-4 text-center">
                📊 Cambios en Escaños por Partido
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Comparando <span className="font-semibold text-purple-700">{getTipoCalculoCorto(tipoCalculo1)}</span> vs <span className="font-semibold text-blue-700">{getTipoCalculoCorto(tipoCalculo2)}</span>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ganadores */}
                {ganadores.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <h4 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                      <span>📈</span> Partidos que Ganaron Escaños
                    </h4>
                    <div className="space-y-2">
                      {ganadores.map(({ partido, diferencia, escanos1, escanos2 }) => (
                        <div key={partido} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getPartidoColor(partido)}`}>
                            {partido}
                          </span>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-700">+{diferencia}</div>
                            <div className="text-xs text-gray-500">{escanos1} → {escanos2}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Perdedores */}
                {perdedores.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                    <h4 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                      <span>📉</span> Partidos que Perdieron Escaños
                    </h4>
                    <div className="space-y-2">
                      {perdedores.map(({ partido, diferencia, escanos1, escanos2 }) => (
                        <div key={partido} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getPartidoColor(partido)}`}>
                            {partido}
                          </span>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-red-700">{diferencia}</div>
                            <div className="text-xs text-gray-500">{escanos1} → {escanos2}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {/* Control para colorear */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm font-medium text-gray-700">Colorear por:</span>
            <button
              onClick={() => setColorearPor('partido')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                colorearPor === 'partido'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Partido
            </button>
            <button
              onClick={() => setColorearPor('pacto')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                colorearPor === 'pacto'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pacto
            </button>
          </div>
        </div>

        {/* Hemiciclos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Hemiciclo Lista 1 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-block px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full">
                Lista 1
              </span>
              <h2 className="text-xl font-bold text-gray-800">{getTipoCalculoCorto(tipoCalculo1)}</h2>
            </div>
            <Hemiciclo 
              candidatosElectos={candidatosLista1}
              getPactoColor={colorearPor === 'partido' ? getPartidoColor : getPactoColor}
              getPartidoNombre={getPartidoNombre}
              colorearPor={colorearPor}
              tooltipPosition="bottom"
            />
            <div className="text-center mt-4">
              <p className="text-lg font-semibold text-gray-700">
                Total: {candidatosLista1.length} escaños
              </p>
            </div>
          </div>

          {/* Hemiciclo Lista 2 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                Lista 2
              </span>
              <h2 className="text-xl font-bold text-gray-800">{getTipoCalculoCorto(tipoCalculo2)}</h2>
            </div>
            <Hemiciclo 
              candidatosElectos={candidatosLista2}
              getPactoColor={colorearPor === 'partido' ? getPartidoColor : getPactoColor}
              getPartidoNombre={getPartidoNombre}
              colorearPor={colorearPor}
              tooltipPosition="bottom"
            />
            <div className="text-center mt-4">
              <p className="text-lg font-semibold text-gray-700">
                Total: {candidatosLista2.length} escaños
              </p>
            </div>
          </div>
        </div>

        {/* Tablas Consolidadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consolidado Lista 1 */}
          {candidatosLista1.length > 0 && (() => {
            const totalEscanos = candidatosLista1.length
            const totalVotosElectos = candidatosLista1.reduce((sum, c) => sum + (c.votos_reales_cantidad || 0), 0)
            const totalVotosValidos = totalVotosValidosLista1
            
            // Consolidado por Pacto - USAR TODOS LOS CANDIDATOS
            const consolidadoPacto = {}
            todosCandidatosLista1.forEach(c => {
              if (!consolidadoPacto[c.pacto]) {
                consolidadoPacto[c.pacto] = { votos: 0, escanos: 0 }
              }
              consolidadoPacto[c.pacto].votos += c.votos_reales_cantidad || 0
            })
            // Contar escaños solo de electos
            candidatosLista1.forEach(c => {
              if (consolidadoPacto[c.pacto]) {
                consolidadoPacto[c.pacto].escanos += 1
              }
            })

            // Consolidado por Partido - USAR TODOS LOS CANDIDATOS
            const consolidadoPartido = {}
            todosCandidatosLista1.forEach(c => {
              if (!consolidadoPartido[c.partido]) {
                consolidadoPartido[c.partido] = { votos: 0, escanos: 0 }
              }
              consolidadoPartido[c.partido].votos += c.votos_reales_cantidad || 0
            })
            // Contar escaños solo de electos
            candidatosLista1.forEach(c => {
              if (consolidadoPartido[c.partido]) {
                consolidadoPartido[c.partido].escanos += 1
              }
            })

            return (
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
                <div className="mb-4 p-3 rounded-lg bg-purple-50">
                  <h2 className="text-xl font-bold text-purple-800">Consolidado Lista 1</h2>
                  <p className="text-sm text-purple-600">{getTipoCalculoNombre(tipoCalculo1)}</p>
                </div>

                <div className="space-y-6">
                  {/* Consolidado por Pacto */}
                  <div>
                    <h3 className="text-lg font-bold text-purple-800 mb-3">Por Pacto</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-purple-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-purple-900">Pacto</th>
                            <th className="px-3 py-2 text-right font-semibold text-purple-900">Escaños</th>
                            <th className="px-3 py-2 text-right font-semibold text-purple-900">% Escaños</th>
                            <th className="px-3 py-2 text-right font-semibold text-purple-900">Votos</th>
                            <th className="px-3 py-2 text-right font-semibold text-purple-900">% Votos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(consolidadoPacto)
                            .sort((a, b) => b[1].escanos - a[1].escanos)
                            .map(([pacto, data]) => (
                            <tr key={pacto} className="border-b border-gray-200 hover:bg-purple-25">
                              <td className="px-3 py-2">
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPactoColor(pacto)}`}>
                                  {pacto}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-medium">{data.escanos}</td>
                              <td className="px-3 py-2 text-right text-purple-600 font-medium">
                                {((data.escanos / totalEscanos) * 100).toFixed(1)}%
                              </td>
                              <td className="px-3 py-2 text-right">{data.votos.toLocaleString('es-CL')}</td>
                              <td className="px-3 py-2 text-right text-purple-600">
                                {totalVotosValidos > 0 ? ((data.votos / totalVotosValidos) * 100).toFixed(2) : '0.00'}%
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-purple-100 font-bold">
                            <td className="px-3 py-2">TOTAL ELECTOS</td>
                            <td className="px-3 py-2 text-right">{totalEscanos}</td>
                            <td className="px-3 py-2 text-right">100%</td>
                            <td className="px-3 py-2 text-right">{totalVotosElectos.toLocaleString('es-CL')}</td>
                            <td className="px-3 py-2 text-right">{totalVotosValidos > 0 ? ((totalVotosElectos / totalVotosValidos) * 100).toFixed(2) : '0.00'}%</td>
                          </tr>
                          <tr className="bg-purple-50 font-semibold text-xs">
                            <td className="px-3 py-2" colSpan="3">TOTAL VOTOS VÁLIDOS</td>
                            <td className="px-3 py-2 text-right">{totalVotosValidos.toLocaleString('es-CL')}</td>
                            <td className="px-3 py-2 text-right">100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Consolidado por Partido */}
                  <div className="border-t-2 border-purple-200 pt-4">
                    <h3 className="text-lg font-bold text-purple-800 mb-3">Por Partido</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-purple-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-purple-900">Partido</th>
                            <th className="px-3 py-2 text-right font-semibold text-purple-900">Escaños</th>
                            <th className="px-3 py-2 text-right font-semibold text-purple-900">% Escaños</th>
                            <th className="px-3 py-2 text-right font-semibold text-purple-900">Votos</th>
                            <th className="px-3 py-2 text-right font-semibold text-purple-900">% Votos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(consolidadoPartido)
                            .sort((a, b) => b[1].escanos - a[1].escanos)
                            .map(([partido, data]) => (
                            <tr key={partido} className="border-b border-gray-200 hover:bg-purple-25">
                              <td className="px-3 py-2">
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPartidoColor(partido)}`}>
                                  {partido}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-medium">{data.escanos}</td>
                              <td className="px-3 py-2 text-right text-purple-600 font-medium">
                                {((data.escanos / totalEscanos) * 100).toFixed(1)}%
                              </td>
                              <td className="px-3 py-2 text-right">{data.votos.toLocaleString('es-CL')}</td>
                              <td className="px-3 py-2 text-right text-purple-600">
                                {totalVotosValidos > 0 ? ((data.votos / totalVotosValidos) * 100).toFixed(2) : '0.00'}%
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-purple-100 font-bold">
                            <td className="px-3 py-2">TOTAL ELECTOS</td>
                            <td className="px-3 py-2 text-right">{totalEscanos}</td>
                            <td className="px-3 py-2 text-right">100%</td>
                            <td className="px-3 py-2 text-right">{totalVotosElectos.toLocaleString('es-CL')}</td>
                            <td className="px-3 py-2 text-right">{totalVotosValidos > 0 ? ((totalVotosElectos / totalVotosValidos) * 100).toFixed(2) : '0.00'}%</td>
                          </tr>
                          <tr className="bg-purple-50 font-semibold text-xs">
                            <td className="px-3 py-2" colSpan="3">TOTAL VOTOS VÁLIDOS</td>
                            <td className="px-3 py-2 text-right">{totalVotosValidos.toLocaleString('es-CL')}</td>
                            <td className="px-3 py-2 text-right">100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Consolidado Lista 2 */}
          {candidatosLista2.length > 0 && (() => {
            const totalEscanos = candidatosLista2.length
            const totalVotosElectos = candidatosLista2.reduce((sum, c) => sum + (c.votos_reales_cantidad || 0), 0)
            const totalVotosValidos = totalVotosValidosLista2
            
            // Consolidado por Pacto - USAR TODOS LOS CANDIDATOS
            const consolidadoPacto = {}
            todosCandidatosLista2.forEach(c => {
              if (!consolidadoPacto[c.pacto]) {
                consolidadoPacto[c.pacto] = { votos: 0, escanos: 0 }
              }
              consolidadoPacto[c.pacto].votos += c.votos_reales_cantidad || 0
            })
            // Contar escaños solo de electos
            candidatosLista2.forEach(c => {
              if (consolidadoPacto[c.pacto]) {
                consolidadoPacto[c.pacto].escanos += 1
              }
            })

            // Consolidado por Partido - USAR TODOS LOS CANDIDATOS
            const consolidadoPartido = {}
            todosCandidatosLista2.forEach(c => {
              if (!consolidadoPartido[c.partido]) {
                consolidadoPartido[c.partido] = { votos: 0, escanos: 0 }
              }
              consolidadoPartido[c.partido].votos += c.votos_reales_cantidad || 0
            })
            // Contar escaños solo de electos
            candidatosLista2.forEach(c => {
              if (consolidadoPartido[c.partido]) {
                consolidadoPartido[c.partido].escanos += 1
              }
            })

            return (
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
                <div className="mb-4 p-3 rounded-lg bg-blue-50">
                  <h2 className="text-xl font-bold text-blue-800">Consolidado Lista 2</h2>
                  <p className="text-sm text-blue-600">{getTipoCalculoNombre(tipoCalculo2)}</p>
                </div>

                <div className="space-y-6">
                  {/* Consolidado por Pacto */}
                  <div>
                    <h3 className="text-lg font-bold text-blue-800 mb-3">Por Pacto</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-blue-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-blue-900">Pacto</th>
                            <th className="px-3 py-2 text-right font-semibold text-blue-900">Escaños</th>
                            <th className="px-3 py-2 text-right font-semibold text-blue-900">% Escaños</th>
                            <th className="px-3 py-2 text-right font-semibold text-blue-900">Votos</th>
                            <th className="px-3 py-2 text-right font-semibold text-blue-900">% Votos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(consolidadoPacto)
                            .sort((a, b) => b[1].escanos - a[1].escanos)
                            .map(([pacto, data]) => (
                            <tr key={pacto} className="border-b border-gray-200 hover:bg-blue-25">
                              <td className="px-3 py-2">
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPactoColor(pacto)}`}>
                                  {pacto}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-medium">{data.escanos}</td>
                              <td className="px-3 py-2 text-right text-blue-600 font-medium">
                                {((data.escanos / totalEscanos) * 100).toFixed(1)}%
                              </td>
                              <td className="px-3 py-2 text-right">{data.votos.toLocaleString('es-CL')}</td>
                              <td className="px-3 py-2 text-right text-blue-600">
                                {totalVotosValidos > 0 ? ((data.votos / totalVotosValidos) * 100).toFixed(2) : '0.00'}%
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-blue-100 font-bold">
                            <td className="px-3 py-2">TOTAL ELECTOS</td>
                            <td className="px-3 py-2 text-right">{totalEscanos}</td>
                            <td className="px-3 py-2 text-right">100%</td>
                            <td className="px-3 py-2 text-right">{totalVotosElectos.toLocaleString('es-CL')}</td>
                            <td className="px-3 py-2 text-right">{totalVotosValidos > 0 ? ((totalVotosElectos / totalVotosValidos) * 100).toFixed(2) : '0.00'}%</td>
                          </tr>
                          <tr className="bg-blue-50 font-semibold text-xs">
                            <td className="px-3 py-2" colSpan="3">TOTAL VOTOS VÁLIDOS</td>
                            <td className="px-3 py-2 text-right">{totalVotosValidos.toLocaleString('es-CL')}</td>
                            <td className="px-3 py-2 text-right">100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Consolidado por Partido */}
                  <div className="border-t-2 border-blue-200 pt-4">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">Por Partido</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-blue-50">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-blue-900">Partido</th>
                            <th className="px-3 py-2 text-right font-semibold text-blue-900">Escaños</th>
                            <th className="px-3 py-2 text-right font-semibold text-blue-900">% Escaños</th>
                            <th className="px-3 py-2 text-right font-semibold text-blue-900">Votos</th>
                            <th className="px-3 py-2 text-right font-semibold text-blue-900">% Votos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(consolidadoPartido)
                            .sort((a, b) => b[1].escanos - a[1].escanos)
                            .map(([partido, data]) => (
                            <tr key={partido} className="border-b border-gray-200 hover:bg-blue-25">
                              <td className="px-3 py-2">
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPartidoColor(partido)}`}>
                                  {partido}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-medium">{data.escanos}</td>
                              <td className="px-3 py-2 text-right text-blue-600 font-medium">
                                {((data.escanos / totalEscanos) * 100).toFixed(1)}%
                              </td>
                              <td className="px-3 py-2 text-right">{data.votos.toLocaleString('es-CL')}</td>
                              <td className="px-3 py-2 text-right text-blue-600">
                                {totalVotosValidos > 0 ? ((data.votos / totalVotosValidos) * 100).toFixed(2) : '0.00'}%
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-blue-100 font-bold">
                            <td className="px-3 py-2">TOTAL ELECTOS</td>
                            <td className="px-3 py-2 text-right">{totalEscanos}</td>
                            <td className="px-3 py-2 text-right">100%</td>
                            <td className="px-3 py-2 text-right">{totalVotosElectos.toLocaleString('es-CL')}</td>
                            <td className="px-3 py-2 text-right">{totalVotosValidos > 0 ? ((totalVotosElectos / totalVotosValidos) * 100).toFixed(2) : '0.00'}%</td>
                          </tr>
                          <tr className="bg-blue-50 font-semibold text-xs">
                            <td className="px-3 py-2" colSpan="3">TOTAL VOTOS VÁLIDOS</td>
                            <td className="px-3 py-2 text-right">{totalVotosValidos.toLocaleString('es-CL')}</td>
                            <td className="px-3 py-2 text-right">100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default ComparativaPactosFicticiosHemiciclo
