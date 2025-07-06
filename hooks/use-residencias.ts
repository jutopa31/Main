import { useState, useMemo } from 'react'
import {
  getResumen,
  getListadoCompleto,
  getEstadisticasPorProvincia,
  getProvincias,
  getTiposFinanciamiento,
  buscarResidencias,
  getResidenciasPorProvincia,
  getResidenciasPorFinanciamiento,
  type ResidenciaItem
} from '@/lib/residencias-service'

export function useResidencias() {
  const [filtros, setFiltros] = useState({
    busqueda: '',
    provincia: '',
    financiamiento: '',
    soloConCupos: false
  })

  // Datos base
  const resumen = useMemo(() => getResumen(), [])
  const estadisticas = useMemo(() => getEstadisticasPorProvincia(), [])
  const provincias = useMemo(() => getProvincias(), [])
  const tiposFinanciamiento = useMemo(() => getTiposFinanciamiento(), [])

  // Residencias filtradas
  const residenciasFiltradas = useMemo(() => {
    let residencias = getListadoCompleto()

    // Aplicar filtro de búsqueda
    if (filtros.busqueda) {
      residencias = buscarResidencias(filtros.busqueda)
    }

    // Aplicar filtro de provincia
    if (filtros.provincia) {
      residencias = residencias.filter(r => r.provincia === filtros.provincia)
    }

    // Aplicar filtro de financiamiento
    if (filtros.financiamiento) {
      residencias = residencias.filter(r => r.financiamiento === filtros.financiamiento)
    }

    // Aplicar filtro de solo con cupos
    if (filtros.soloConCupos) {
      residencias = residencias.filter(r => r.cantidad_cupos > 0)
    }

    return residencias
  }, [filtros])

  // Estadísticas de las residencias filtradas
  const estadisticasFiltradas = useMemo(() => {
    const stats = {
      total: residenciasFiltradas.length,
      conCupos: residenciasFiltradas.filter(r => r.cantidad_cupos > 0).length,
      totalCupos: residenciasFiltradas.reduce((sum, r) => sum + r.cantidad_cupos, 0),
      porFinanciamiento: {} as Record<string, number>,
      porProvincia: {} as Record<string, number>
    }

    // Contar por financiamiento
    residenciasFiltradas.forEach(r => {
      stats.porFinanciamiento[r.financiamiento] = (stats.porFinanciamiento[r.financiamiento] || 0) + 1
    })

    // Contar por provincia
    residenciasFiltradas.forEach(r => {
      stats.porProvincia[r.provincia] = (stats.porProvincia[r.provincia] || 0) + 1
    })

    return stats
  }, [residenciasFiltradas])

  // Funciones para actualizar filtros
  const actualizarFiltros = (nuevosFiltros: Partial<typeof filtros>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }))
  }

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      provincia: '',
      financiamiento: '',
      soloConCupos: false
    })
  }

  return {
    // Datos base
    resumen,
    estadisticas,
    provincias,
    tiposFinanciamiento,
    
    // Datos filtrados
    residencias: residenciasFiltradas,
    estadisticasFiltradas,
    
    // Filtros
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    
    // Funciones de utilidad
    buscarResidencias,
    getResidenciasPorProvincia,
    getResidenciasPorFinanciamiento
  }
} 