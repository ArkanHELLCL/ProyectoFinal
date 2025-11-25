import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'

/**
 * ComparativaPactosFicticiosHemiciclo
 * 
 * Este componente muestra la comparación de hemiciclos entre dos tipos de cálculo
 * de pactos ficticios (JK = Toda la Derecha, AH = Toda la Izquierda).
 * 
 * Características:
 * - Recibe dos parámetros de URL: calculo1 y calculo2
 * - Cada cálculo puede ser: 'normal', 'derecha' (JK), o 'izquierda' (AH)
 * - Muestra dos hemiciclos lado a lado para comparación visual
 * - Incluye estadísticas comparativas por partido y pacto
 * - Usa filtros independientes (no relacionados con los filtros globales del contexto)
 * 
 * Flujo de datos:
 * 1. Extrae tipoCalculo1 y tipoCalculo2 de los parámetros URL
 * 2. Carga datos de todos los 28 distritos con tipo 'reales' para cada cálculo
 * 3. Combina los candidatos electos de todos los distritos
 * 4. Genera hemiciclos con el componente Hemiciclo
 * 5. Calcula y muestra diferencias estadísticas
 */

const ComparativaPactosFicticiosHemiciclo = () => {
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
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Comparativa de Pactos Ficticios - Hemiciclo
          </h1>
          <p className="text-gray-600 mb-4">
            Visualización comparativa de la composición del congreso
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
              <div className="inline-block p-4 bg-rose-100 rounded-full mb-4">
                <svg className="w-16 h-16 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Componente en Desarrollo
            </h2>
            
            <div className="max-w-2xl mx-auto text-left space-y-4 text-gray-700">
              <p className="text-lg font-semibold text-rose-600">
                Funcionalidad Planificada:
              </p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Carga de datos de todos los 28 distritos para ambos tipos de cálculo</li>
                <li>Barras de progreso durante la carga (una por cada lista)</li>
                <li>Grid con dos hemiciclos lado a lado:
                  <ul className="list-circle list-inside ml-6 mt-1">
                    <li>Hemiciclo izquierdo: Lista 1 (color púrpura)</li>
                    <li>Hemiciclo derecho: Lista 2 (color azul)</li>
                  </ul>
                </li>
                <li>Control para colorear por partido o por pacto</li>
                <li>Sección de estadísticas comparativas:
                  <ul className="list-circle list-inside ml-6 mt-1">
                    <li>Resumen general (total escaños y diferencia)</li>
                    <li>Tabla de diferencias por partido</li>
                    <li>Tabla de diferencias por pacto</li>
                    <li>Análisis de porcentajes</li>
                  </ul>
                </li>
                <li>Total de escaños por hemiciclo</li>
              </ul>

              <p className="text-sm text-gray-500 italic mt-6 pt-4 border-t border-gray-200">
                Este componente es completamente independiente de Comparativa.jsx
                y utiliza sus propios filtros basados en parámetros URL.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComparativaPactosFicticiosHemiciclo
