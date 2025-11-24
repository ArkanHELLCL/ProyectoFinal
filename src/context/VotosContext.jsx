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
  } catch (error) {
    console.error('Error al cargar desde localStorage:', error)
    return {}
  }
}

// Función para guardar en localStorage
const guardarEnLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Error al guardar en localStorage:', error)
  }
}

export const VotosProvider = ({ children }) => {
  const [tipoVotos, setTipoVotos] = useState('reales') // 'encuesta', 'reales' o 'comparativa'
  const [tipoCalculo, setTipoCalculo] = useState('normal') // 'normal', 'derecha', 'izquierda'
  
  // Cache de datos por distrito - inicializar desde localStorage
  const [cacheDistritos, setCacheDistritos] = useState(() => cargarDesdeLocalStorage(CACHE_KEY))
  
  // Estado de carga de distritos - inicializar desde localStorage
  const [distritosEstado, setDistritosEstado] = useState(() => cargarDesdeLocalStorage(CACHE_STATE_KEY))

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
    } catch (error) {
      console.error(`Error al cargar distrito ${distrito}:`, error)
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

  const limpiarCache = useCallback(() => {
    setCacheDistritos({})
    setDistritosEstado({})
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_STATE_KEY)
  }, [])

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
      limpiarCache
    }}>
      {children}
    </VotosContext.Provider>
  )
}
