import React, { useState } from 'react'

const Hemiciclo = ({ candidatosElectos, getPactoColor, getPartidoNombre, totalEscanos = 155, colorearPor = 'pacto', totalVotosNacionales = 0 }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null)

  // Configuración del hemiciclo
  const rows = 6 // Número de filas semicirculares
  const centerX = 300 // Centro X del SVG
  const centerY = 280 // Centro Y del SVG
  const startRadius = 100 // Radio inicial (más cercano al centro)
  const radiusIncrement = 32 // Incremento de radio entre filas
  const seatRadius = 8 // Radio de cada círculo (escaño)

  // Calcular las posiciones de los escaños en forma de hemiciclo
  const calculateSeatPositions = () => {
    // Agrupar candidatos según el criterio seleccionado (pacto o partido)
    const candidatosPorGrupo = {}
    candidatosElectos.forEach((candidato, index) => {
      const grupo = colorearPor === 'pacto'
        ? (candidato.pacto || 'SIN_PACTO')
        : (candidato.partido || 'SIN_PARTIDO')
      if (!candidatosPorGrupo[grupo]) {
        candidatosPorGrupo[grupo] = []
      }
      candidatosPorGrupo[grupo].push(index)
    })

    // Ordenar grupos por cantidad de escaños (de mayor a menor) para mejor visualización
    const gruposOrdenados = Object.entries(candidatosPorGrupo)
      .sort((a, b) => b[1].length - a[1].length)

    // Calcular todas las posiciones físicas del hemiciclo (siempre 155)
    const physicalPositions = []
    const seatsPerRow = [16, 22, 26, 30, 33, 28]

    for (let row = 0; row < rows; row++) {
      const radius = startRadius + (row * radiusIncrement)
      const seatsInThisRow = seatsPerRow[row] || 20

      // Calcular el ángulo de apertura basado en la fila (más cerrado en las externas)
      const arcReduction = (row * 0.06) // Reducción progresiva del arco
      const arcAngle = Math.PI - arcReduction // Ángulo total disponible
      const angleStep = arcAngle / (seatsInThisRow + 1)
      const startAngle = (Math.PI - arcAngle) / 2 // Centrar el arco

      for (let i = 0; i < seatsInThisRow; i++) {
        if (physicalPositions.length >= totalEscanos) break

        const angle = Math.PI - startAngle - (angleStep * (i + 1))
        const x = centerX + radius * Math.cos(angle)
        const y = centerY - radius * Math.sin(angle)

        physicalPositions.push({ x, y, row, angle })
      }

      if (physicalPositions.length >= totalEscanos) break
    }

    // Ordenar posiciones por ángulo (izquierda a derecha) y fila (afuera a dentro)
    physicalPositions.sort((a, b) => {
      const angleDiff = b.angle - a.angle
      if (Math.abs(angleDiff) > 0.05) {
        return angleDiff
      }
      return b.row - a.row
    })

    // Asignar posiciones a candidatos agrupados
    const positions = []
    let posIndex = 0

    gruposOrdenados.forEach(([, candidatosIndices]) => {
      candidatosIndices.forEach(candidatoIndex => {
        if (posIndex < physicalPositions.length) {
          positions.push({
            x: physicalPositions[posIndex].x,
            y: physicalPositions[posIndex].y,
            index: candidatoIndex,
            hasCandidate: true
          })
          posIndex++
        }
      })
    })

    // Agregar posiciones vacías para completar los 155 escaños
    while (posIndex < physicalPositions.length) {
      positions.push({
        x: physicalPositions[posIndex].x,
        y: physicalPositions[posIndex].y,
        index: posIndex,
        hasCandidate: false
      })
      posIndex++
    }

    return positions
  }

  const seatPositions = calculateSeatPositions()

  // Obtener el color del escaño según el candidato electo
  const getSeatColor = (pos) => {
    if (pos.hasCandidate && pos.index < candidatosElectos.length) {
      const candidato = candidatosElectos[pos.index]
      const codigo = colorearPor === 'pacto' ? candidato.pacto : candidato.partido
      const colorClasses = getPactoColor(codigo)

      // Extraer el color de fondo de la clase de Tailwind
      const colorMap = {
        // Colores de Pactos
        'bg-lime-200': '#d9f99d',
        'bg-emerald-200': '#a7f3d0',
        'bg-rose-200': '#fecdd3',
        'bg-fuchsia-200': '#f5d0fe',
        'bg-amber-200': '#fde68a',
        'bg-red-300': '#fca5a5',
        'bg-teal-200': '#99f6e4',
        'bg-slate-200': '#e2e8f0',
        'bg-orange-300': '#fdba74',
        'bg-sky-300': '#7dd3fc',
        'bg-violet-300': '#c4b5fd',
        'bg-blue-500': '#3b82f6',     // JK - Toda la Derecha
        'bg-red-500': '#ef4444',      // AH - Toda la Izquierda
        // Colores de Partidos
        'bg-red-200': '#fecaca',
        'bg-blue-200': '#bfdbfe',
        'bg-blue-300': '#93c5fd',
        'bg-blue-400': '#60a5fa',
        'bg-yellow-200': '#fef08a',
        'bg-yellow-300': '#fde047',
        'bg-purple-200': '#e9d5ff',
        'bg-pink-200': '#fbcfe8',
        'bg-green-200': '#bbf7d0',
        'bg-orange-200': '#fed7aa',
        'bg-cyan-300': '#67e8f9',
        'bg-lime-300': '#bef264',
        'bg-slate-300': '#cbd5e1',
        'bg-indigo-200': '#c7d2fe',
        'bg-amber-300': '#fcd34d',
        'bg-rose-300': '#fda4af',
      }

      // Buscar el color en colorClasses
      for (const [className, color] of Object.entries(colorMap)) {
        if (colorClasses.includes(className)) {
          return color
        }
      }
    }

    return '#1f2937' // Gris oscuro casi negro para escaños vacíos
  }

  // Obtener el color del borde (más oscuro)
  const getSeatStrokeColor = (pos) => {
    if (pos.hasCandidate && pos.index < candidatosElectos.length) {
      const candidato = candidatosElectos[pos.index]
      const codigo = colorearPor === 'pacto' ? candidato.pacto : candidato.partido
      const colorClasses = getPactoColor(codigo)

      const strokeColorMap = {
        // Colores de borde para Pactos
        'bg-lime-200': '#4d7c0f',
        'bg-emerald-200': '#047857',
        'bg-rose-200': '#be123c',
        'bg-fuchsia-200': '#a21caf',
        'bg-amber-200': '#b45309',
        'bg-red-300': '#991b1b',
        'bg-teal-200': '#0f766e',
        'bg-slate-200': '#334155',
        'bg-orange-300': '#c2410c',
        'bg-sky-300': '#0369a1',
        'bg-violet-300': '#6d28d9',
        'bg-blue-500': '#1e40af',     // JK - Toda la Derecha (borde)
        'bg-red-500': '#991b1b',      // AH - Toda la Izquierda (borde)
        // Colores de borde para Partidos
        'bg-red-200': '#991b1b',
        'bg-blue-200': '#1e40af',
        'bg-blue-300': '#1e40af',
        'bg-blue-400': '#1e3a8a',
        'bg-yellow-200': '#a16207',
        'bg-yellow-300': '#a16207',
        'bg-purple-200': '#6b21a8',
        'bg-pink-200': '#be185d',
        'bg-green-200': '#15803d',
        'bg-orange-200': '#c2410c',
        'bg-cyan-300': '#0e7490',
        'bg-lime-300': '#4d7c0f',
        'bg-slate-300': '#475569',
        'bg-indigo-200': '#4338ca',
        'bg-amber-300': '#b45309',
        'bg-rose-300': '#be123c',
      }

      for (const [className, color] of Object.entries(strokeColorMap)) {
        if (colorClasses.includes(className)) {
          return color
        }
      }
    }

    return '#374151' // Gris medio oscuro para borde de escaños vacíos
  }

  // Obtener información del candidato
  const getCandidateInfo = (pos) => {
    if (pos.hasCandidate && pos.index < candidatosElectos.length) {
      return candidatosElectos[pos.index]
    }
    return null
  }

  return (
    <div className="relative">
      <svg
        width="600"
        height="320"
        viewBox="0 0 600 320"
        className="w-full h-auto"
        style={{ maxWidth: '100%' }}
      >
        {/* Líneas de fondo para dar estructura al hemiciclo */}
        {[...Array(rows)].map((_, i) => {
          const radius = startRadius + (i * radiusIncrement)
          return (
            <path
              key={`arc-${i}`}
              d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.3"
            />
          )
        })}

        {/* Dibujar los escaños */}
        {seatPositions.map((pos) => {
          const isHovered = hoveredSeat === pos.index

          return (
            <g key={`seat-${pos.index}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? seatRadius + 2 : seatRadius}
                fill={getSeatColor(pos)}
                stroke={getSeatStrokeColor(pos)}
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSeat(pos.index)}
                onMouseLeave={() => setHoveredSeat(null)}
                style={{
                  filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' : 'none',
                  pointerEvents: 'all'
                }}
              />
            </g>
          )
        })}

        {/* Número total en el centro */}
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          className="text-4xl font-bold fill-gray-700"
        >
          {totalEscanos}
        </text>
        <text
          x={centerX}
          y={centerY + 30}
          textAnchor="middle"
          className="text-sm fill-gray-500"
        >
          ESCAÑOS
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredSeat !== null && (() => {
        const hoveredPos = seatPositions.find(p => p.index === hoveredSeat)
        const candidateInfo = hoveredPos ? getCandidateInfo(hoveredPos) : null

        if (!hoveredPos) return null

        // Tooltip para escaños vacíos
        if (!hoveredPos.hasCandidate) {
          return (
            <div
              className="absolute bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl z-10 pointer-events-none"
              style={{
                left: 'calc(100% - 60px)',
                top: '0',
                minWidth: '200px'
              }}
            >
              <div className="text-sm">
                <div className="font-semibold">Escaño #{hoveredSeat + 1}</div>
                <div className="text-gray-400 mt-1">Sin diputado electo</div>
              </div>
              {/* Flecha del tooltip */}
              <div
                className="absolute -left-2 top-1/2 transform -translate-y-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderRight: '8px solid #111827'
                }}
              />
            </div>
          )
        }

        // Tooltip para escaños con candidato
        return candidateInfo && (
          <div
            className="absolute bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl z-10 pointer-events-none"
            style={{
              left: 'calc(100% - 60px)',
              top: '0',
              minWidth: '280px'
            }}
          >
            <div className="flex items-start gap-3">
              {candidateInfo.id_foto && (
                <img
                  src={`https://static.emol.cl/emol50/especiales/img/2025/elecciones/dip/${candidateInfo.id_foto}.jpg`}
                  alt={candidateInfo.nombre}
                  className="w-20 h-20 rounded-lg object-cover border-2 border-gray-600"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )}
              <div className="flex-1">
                <div className="text-base font-bold mb-1">
                  {candidateInfo.nombre}
                </div>
                <div className="text-sm text-gray-300">
                  <div>Partido: {getPartidoNombre(candidateInfo.partido)}</div>
                  <div className="mt-1">
                    Escaño #{hoveredSeat + 1}
                  </div>
                  {candidateInfo.votos_reales_cantidad > 0 && totalVotosNacionales > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-indigo-400">
                          {((candidateInfo.votos_reales_cantidad / totalVotosNacionales) * 100).toFixed(2)}%
                        </span>
                        <span className="text-xs text-gray-400">
                          del total nacional
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {candidateInfo.votos_reales_cantidad.toLocaleString('es-CL')} votos
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Flecha del tooltip */}
            <div
              className="absolute -left-2 top-1/2 transform -translate-y-1/2"
              style={{
                width: 0,
                height: 0,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: '8px solid #111827'
              }}
            />
          </div>
        )
      })()}
    </div>
  )
}

export default Hemiciclo
