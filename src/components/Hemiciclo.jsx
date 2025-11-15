import React, { useState } from 'react'

const Hemiciclo = ({ candidatosElectos, getPactoColor, getPartidoNombre, totalEscanos = 155, colorearPor = 'pacto' }) => {
  const [hoveredSeat, setHoveredSeat] = useState(null)

  // Configuración del hemiciclo
  const rows = 9 // Número de filas semicirculares
  const centerX = 300 // Centro X del SVG
  const centerY = 280 // Centro Y del SVG
  const startRadius = 80 // Radio inicial (más cercano al centro)
  const radiusIncrement = 25 // Incremento de radio entre filas
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
    
    // Calcular todas las posiciones físicas del hemiciclo
    const physicalPositions = []
    const seatsPerRow = [8, 11, 14, 17, 20, 23, 26, 29, 32]
    
    for (let row = 0; row < rows; row++) {
      const radius = startRadius + (row * radiusIncrement)
      const seatsInThisRow = seatsPerRow[row] || 20
      const angleStep = Math.PI / (seatsInThisRow + 1)
      
      for (let i = 0; i < seatsInThisRow; i++) {
        if (physicalPositions.length >= totalEscanos) break
        
        const angle = Math.PI - (angleStep * (i + 1))
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
            index: candidatoIndex
          })
          posIndex++
        }
      })
    })
    
    return positions
  }

  const seatPositions = calculateSeatPositions()

  // Obtener el color del escaño según el candidato electo
  const getSeatColor = (index) => {
    if (index < candidatosElectos.length) {
      const candidato = candidatosElectos[index]
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
        // Colores de Partidos
        'bg-red-200': '#fecaca',
        'bg-blue-200': '#bfdbfe',
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
      }
      
      // Buscar el color en colorClasses
      for (const [className, color] of Object.entries(colorMap)) {
        if (colorClasses.includes(className)) {
          return color
        }
      }
    }
    
    return '#e5e7eb' // Gris por defecto para escaños vacíos
  }

  // Obtener el color del borde (más oscuro)
  const getSeatStrokeColor = (index) => {
    if (index < candidatosElectos.length) {
      const candidato = candidatosElectos[index]
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
        // Colores de borde para Partidos
        'bg-red-200': '#991b1b',
        'bg-blue-200': '#1e40af',
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
      }
      
      for (const [className, color] of Object.entries(strokeColorMap)) {
        if (colorClasses.includes(className)) {
          return color
        }
      }
    }
    
    return '#9ca3af' // Gris oscuro por defecto
  }

  // Obtener información del candidato
  const getCandidateInfo = (index) => {
    if (index < candidatosElectos.length) {
      return candidatosElectos[index]
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
                fill={getSeatColor(pos.index)}
                stroke={getSeatStrokeColor(pos.index)}
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSeat(pos.index)}
                onMouseLeave={() => setHoveredSeat(null)}
                style={{
                  filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' : 'none'
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
          {candidatosElectos.length || totalEscanos}
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredSeat !== null && getCandidateInfo(hoveredSeat) && (
        <div
          className="absolute bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl z-10 pointer-events-none"
          style={{
            left: '50%',
            top: '10px',
            transform: 'translateX(-50%)',
            minWidth: '250px'
          }}
        >
          <div className="text-sm font-bold mb-1">
            {getCandidateInfo(hoveredSeat).nombre}
          </div>
          <div className="text-xs text-gray-300">
            <div>Partido: {getPartidoNombre(getCandidateInfo(hoveredSeat).partido)}</div>
            <div className="mt-1">
              Escaño #{hoveredSeat + 1}
            </div>
          </div>
          {/* Flecha del tooltip */}
          <div 
            className="absolute left-1/2 -bottom-2 transform -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #111827'
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Hemiciclo
