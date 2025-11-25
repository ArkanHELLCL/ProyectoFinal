import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'

/**
 * ComparativaPactosFicticiosDistritos
 * 
 * Este componente muestra la comparación por distritos entre dos tipos de cálculo
 * de pactos ficticios (JK = Toda la Derecha, AH = Toda la Izquierda).
 * 
 * Características:
 * - Recibe dos parámetros de URL: calculo1 y calculo2
 * - Cada cálculo puede ser: 'normal', 'derecha' (JK), o 'izquierda' (AH)
 * - Muestra tablas comparativas por distrito con candidatos electos
 * - Incluye análisis de diferencias entre ambos cálculos
 * - Usa filtros independientes (no relacionados con los filtros globales del contexto)
 * 
 * Flujo de datos:
 * 1. Extrae tipoCalculo1 y tipoCalculo2 de los parámetros URL
 * 2. Carga datos de 'reales' con cada tipo de cálculo desde VotosContext
 * 3. Procesa y compara los resultados por pacto y partido
 * 4. Muestra solo candidatos electos con sus tarjetas y fotos
 */

const ComparativaPactosFicticiosDistritos = () => {
  const [searchParams] = useSearchParams()
  const tipoCalculo1 = searchParams.get('calculo1') || 'normal'
  const tipoCalculo2 = searchParams.get('calculo2') || 'normal'

  const getTipoCalculoNombre = (tipo) => {
    const nombres = {
      normal: "Cálculo Normal",
      derecha: "JK = Toda la Derecha",
      izquierda: "AH = Toda la Izquierda"
    }
    return nombres[tipo] || tipo
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Comparativa de Pactos Ficticios por Distrito
          </h1>
          <p className="text-gray-600 mb-4">
            Análisis comparativo entre dos configuraciones de cálculo
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
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

          <Link 
            to="/" 
            className="inline-block px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors shadow-md"
          >
            ← Volver al Inicio
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Componente en Desarrollo
            </h2>
            
            <div className="max-w-2xl mx-auto text-left space-y-4 text-gray-700">
              <p className="text-lg font-semibold text-indigo-600">
                Funcionalidad Planificada:
              </p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Selector de distrito con dropdown</li>
                <li>Carga de datos para ambos tipos de cálculo desde el contexto (verificando cache)</li>
                <li>Tablas comparativas lado a lado (Lista 1 vs Lista 2)</li>
                <li>Agrupación por Pacto y por Partido con acordeones</li>
                <li>Tarjetas de candidatos electos con:
                  <ul className="list-circle list-inside ml-6 mt-1">
                    <li>Foto del candidato</li>
                    <li>Nombre con truncamiento</li>
                    <li>Badges de pacto y partido</li>
                    <li>Barra de progreso de votos</li>
                  </ul>
                </li>
                <li>Sección de análisis con diferencias entre ambos cálculos</li>
                <li>Leyendas de colores para pactos y partidos</li>
              </ul>

              <p className="text-sm text-gray-500 italic mt-6 pt-4 border-t border-gray-200">
                Este componente es completamente independiente de ComparativaDistritos.jsx
                y utiliza sus propios filtros basados en parámetros URL.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComparativaPactosFicticiosDistritos
