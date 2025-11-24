/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const VotosContext = createContext()

export const useVotos = () => {
  const context = useContext(VotosContext)
  if (!context) {
    throw new Error('useVotos debe ser usado dentro de un VotosProvider')
  }
  return context
}

const API_BASE_URL = import.meta.env.VITE_API_URL
const CACHE_KEY = 'votos_cache_distritos'
const CACHE_STATE_KEY = 'votos_cache_estado'

// Función para cargar datos de localStorage
const cargarDesdeLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : {}
  } catch {
    return {}
  }
}

// Función para guardar en localStorage
const guardarEnLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // Error silencioso
  }
}

export const VotosProvider = ({ children }) => {
  // Inicializar tipoVotos desde localStorage o usar 'reales' por defecto
  const [tipoVotos, setTipoVotos] = useState(() => {
    try {
      const saved = localStorage.getItem('votos_tipo_votos')
      return saved || 'reales'
    } catch {
      return 'reales'
    }
  })
  
  // Inicializar tipoCalculo para reales desde localStorage o usar 'normal' por defecto
  const [tipoCalculoReales, setTipoCalculoReales] = useState(() => {
    try {
      const saved = localStorage.getItem('votos_tipo_calculo_reales')
      return saved || 'normal'
    } catch {
      return 'normal'
    }
  })
  
  // Inicializar tipoCalculo para encuesta desde localStorage o usar 'normal' por defecto
  const [tipoCalculoEncuesta, setTipoCalculoEncuesta] = useState(() => {
    try {
      const saved = localStorage.getItem('votos_tipo_calculo_encuesta')
      return saved || 'normal'
    } catch {
      return 'normal'
    }
  })
  
  // Computed: tipoCalculo actual según tipoVotos
  const tipoCalculo = tipoVotos === 'reales' ? tipoCalculoReales : tipoCalculoEncuesta
  
  // Setter para tipoCalculo que actualiza el correcto según tipoVotos
  const setTipoCalculo = (valor) => {
    if (tipoVotos === 'reales') {
      setTipoCalculoReales(valor)
    } else {
      setTipoCalculoEncuesta(valor)
    }
  }
  
  // Cache de datos por distrito - inicializar desde localStorage
  const [cacheDistritos, setCacheDistritos] = useState(() => cargarDesdeLocalStorage(CACHE_KEY))
  
  // Estado de carga de distritos - inicializar desde localStorage
  const [distritosEstado, setDistritosEstado] = useState(() => cargarDesdeLocalStorage(CACHE_STATE_KEY))

  // Guardar tipoVotos en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('votos_tipo_votos', tipoVotos)
    } catch {
      // Error silencioso
    }
  }, [tipoVotos])

  // Guardar tipoCalculoReales en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('votos_tipo_calculo_reales', tipoCalculoReales)
    } catch {
      // Error silencioso
    }
  }, [tipoCalculoReales])

  // Guardar tipoCalculoEncuesta en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('votos_tipo_calculo_encuesta', tipoCalculoEncuesta)
    } catch {
      // Error silencioso
    }
  }, [tipoCalculoEncuesta])

  // Guardar cache en localStorage cuando cambie
  useEffect(() => {
    guardarEnLocalStorage(CACHE_KEY, cacheDistritos)
  }, [cacheDistritos])

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    guardarEnLocalStorage(CACHE_STATE_KEY, distritosEstado)
  }, [distritosEstado])

  const getCacheKey = useCallback((distrito, tipoVotosParam, tipoCalculoParam) => {
    return `${distrito}_${tipoVotosParam}_${tipoCalculoParam}`
  }, [])

  const cargarDistrito = useCallback(async (distrito, tipoVotosParam = tipoVotos, tipoCalculoParam = tipoCalculo) => {
    const cacheKey = getCacheKey(distrito, tipoVotosParam, tipoCalculoParam)
    
    // Si ya está cargado, retornar del cache
    if (cacheDistritos[cacheKey]) {
      return cacheDistritos[cacheKey]
    }

    // Si ya está en proceso de carga, esperar
    if (distritosEstado[cacheKey] === 'loading') {
      return null
    }

    // Marcar como cargando
    setDistritosEstado(prev => ({ ...prev, [cacheKey]: 'loading' }))

    try {
      let url = `${API_BASE_URL}/api/candidatos/${distrito}?votos=${tipoVotosParam}`
      if (tipoCalculoParam === 'izquierda') {
        url += '&pacto_ficticio=toda_izquierda'
      } else if (tipoCalculoParam === 'derecha') {
        url += '&pacto_ficticio=toda_derecha'
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Error al cargar distrito ${distrito}`)
      }

      const data = await response.json()
      
      const datosGuardar = {
        candidatos_electos: data.resultados?.candidatos_electos || [],
        votos_totales_reales: data.votos_totales_reales || 0,
        candidatos: data.candidatos || []
      }
      
      // Guardar en cache
      setCacheDistritos(prev => ({
        ...prev,
        [cacheKey]: datosGuardar
      }))

      // Marcar como cargado
      setDistritosEstado(prev => ({ ...prev, [cacheKey]: 'loaded' }))

      // Retornar los datos directamente, no esperar al estado
      return datosGuardar
    } catch {
      setDistritosEstado(prev => ({ ...prev, [cacheKey]: 'error' }))
      return null
    }
  }, [tipoVotos, tipoCalculo, cacheDistritos, distritosEstado, getCacheKey])

  const cargarTodosLosDistritos = useCallback(async (tipoVotosParam = tipoVotos, tipoCalculoParam = tipoCalculo) => {
    const totalDistritos = 28
    const promises = []
    
    for (let distrito = 1; distrito <= totalDistritos; distrito++) {
      promises.push(cargarDistrito(distrito, tipoVotosParam, tipoCalculoParam))
    }

    const resultados = await Promise.all(promises)
    return resultados.filter(r => r !== null)
  }, [tipoVotos, tipoCalculo, cargarDistrito])

  const getDistritoData = useCallback((distrito, tipoVotosParam = tipoVotos, tipoCalculoParam = tipoCalculo) => {
    const cacheKey = getCacheKey(distrito, tipoVotosParam, tipoCalculoParam)
    return cacheDistritos[cacheKey] || null
  }, [cacheDistritos, tipoVotos, tipoCalculo, getCacheKey])

  const getDistritoEstado = useCallback((distrito, tipoVotosParam = tipoVotos, tipoCalculoParam = tipoCalculo) => {
    const cacheKey = getCacheKey(distrito, tipoVotosParam, tipoCalculoParam)
    return distritosEstado[cacheKey] || null
  }, [distritosEstado, tipoVotos, tipoCalculo, getCacheKey])

  const getDistritosCargadosCount = useCallback((tipoVotosParam = tipoVotos, tipoCalculoParam = tipoCalculo) => {
    const totalDistritos = 28
    let cargados = 0
    for (let distrito = 1; distrito <= totalDistritos; distrito++) {
      const cacheKey = getCacheKey(distrito, tipoVotosParam, tipoCalculoParam)
      if (distritosEstado[cacheKey] === 'loaded') {
        cargados++
      }
    }
    return cargados
  }, [distritosEstado, tipoVotos, tipoCalculo, getCacheKey])

  const getDistritosCargadosPorTipo = useCallback((tipoCalculoParam = tipoCalculo) => {
    const totalDistritos = 28
    let cargadosEncuesta = 0
    let cargadosReales = 0
    
    for (let distrito = 1; distrito <= totalDistritos; distrito++) {
      const cacheKeyEncuesta = getCacheKey(distrito, 'encuesta', tipoCalculoParam)
      const cacheKeyReales = getCacheKey(distrito, 'reales', tipoCalculoParam)
      
      if (distritosEstado[cacheKeyEncuesta] === 'loaded') {
        cargadosEncuesta++
      }
      if (distritosEstado[cacheKeyReales] === 'loaded') {
        cargadosReales++
      }
    }
    
    return { encuesta: cargadosEncuesta, reales: cargadosReales }
  }, [distritosEstado, tipoCalculo, getCacheKey])

  const getDistritosCargadosPorCalculo = useCallback((tipoVotosParam) => {
    const totalDistritos = 28
    const resultados = {
      normal: 0,
      derecha: 0,
      izquierda: 0
    }
    
    for (let distrito = 1; distrito <= totalDistritos; distrito++) {
      ['normal', 'derecha', 'izquierda'].forEach(tipoCalc => {
        const cacheKey = getCacheKey(distrito, tipoVotosParam, tipoCalc)
        
        if (distritosEstado[cacheKey] === 'loaded') {
          resultados[tipoCalc]++
        }
      })
    }
    
    return resultados
  }, [distritosEstado, getCacheKey])

  const limpiarCache = useCallback((tipo = 'todo', tipoVotosParam = null) => {
    if (tipo === 'todo') {
      setCacheDistritos({})
      setDistritosEstado({})
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_STATE_KEY)
    } else if (tipo === 'derecha' || tipo === 'izquierda' || tipo === 'normal') {
      // Limpiar solo las entradas del tipoCalculo especificado para un tipoVotos específico
      const tipoVotosALimpiar = tipoVotosParam || tipoVotos
      setCacheDistritos(prev => {
        const nuevo = {}
        Object.keys(prev).forEach(key => {
          // Key format: distrito_tipoVotos_tipoCalculo
          // Solo eliminar si coincide tipoVotos Y tipoCalculo
          if (!(key.includes(`_${tipoVotosALimpiar}_`) && key.endsWith(`_${tipo}`))) {
            nuevo[key] = prev[key]
          }
        })
        guardarEnLocalStorage(CACHE_KEY, nuevo)
        return nuevo
      })
      setDistritosEstado(prev => {
        const nuevo = {}
        Object.keys(prev).forEach(key => {
          if (!(key.includes(`_${tipoVotosALimpiar}_`) && key.endsWith(`_${tipo}`))) {
            nuevo[key] = prev[key]
          }
        })
        guardarEnLocalStorage(CACHE_STATE_KEY, nuevo)
        return nuevo
      })
    } else {
      // Limpiar solo las entradas del tipoVotos especificado (reales/encuesta)
      setCacheDistritos(prev => {
        const nuevo = {}
        Object.keys(prev).forEach(key => {
          if (!key.includes(`_${tipo}_`)) {
            nuevo[key] = prev[key]
          }
        })
        guardarEnLocalStorage(CACHE_KEY, nuevo)
        return nuevo
      })
      setDistritosEstado(prev => {
        const nuevo = {}
        Object.keys(prev).forEach(key => {
          if (!key.includes(`_${tipo}_`)) {
            nuevo[key] = prev[key]
          }
        })
        guardarEnLocalStorage(CACHE_STATE_KEY, nuevo)
        return nuevo
      })
    }
  }, [tipoVotos])

  return (
    <VotosContext.Provider value={{ 
      tipoVotos, 
      setTipoVotos, 
      tipoCalculo, 
      setTipoCalculo,
      cargarDistrito,
      cargarTodosLosDistritos,
      getDistritoData,
      getDistritoEstado,
      getDistritosCargadosCount,
      getDistritosCargadosPorTipo,
      getDistritosCargadosPorCalculo,
      limpiarCache
    }}>
      {children}
    </VotosContext.Provider>
  )
}
