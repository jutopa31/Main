import residenciasData from './residencias-data.json'

export interface ResidenciaItem {
  numero: number
  provincia: string
  institucion: string
  cantidad_cupos: number
  financiamiento: string
}

export interface ProvinciaDetalle {
  cantidad_residencias: number
  total_cupos: number
  financiamiento: Record<string, number>
}

export interface ResidenciasData {
  fecha_extraccion: string
  resumen: {
    numero_total_residencias: number
    total_cupos: number
    provincias_cubiertas: number
  }
  detalle_por_provincia: Record<string, ProvinciaDetalle>
  listado_completo_residencias: ResidenciaItem[]
}

// Función para obtener todos los datos
export function getResidenciasData(): ResidenciasData {
  return residenciasData as ResidenciasData
}

// Función para obtener el resumen
export function getResumen() {
  return residenciasData.resumen
}

// Función para obtener el detalle por provincia
export function getDetallePorProvincia() {
  return residenciasData.detalle_por_provincia
}

// Función para obtener el listado completo de residencias
export function getListadoCompleto(): ResidenciaItem[] {
  return residenciasData.listado_completo_residencias
}

// Función para obtener residencias por provincia
export function getResidenciasPorProvincia(provincia: string): ResidenciaItem[] {
  return residenciasData.listado_completo_residencias.filter(
    residencia => residencia.provincia === provincia
  )
}

// Función para obtener residencias por tipo de financiamiento
export function getResidenciasPorFinanciamiento(financiamiento: string): ResidenciaItem[] {
  return residenciasData.listado_completo_residencias.filter(
    residencia => residencia.financiamiento === financiamiento
  )
}

// Función para obtener residencias con cupos disponibles
export function getResidenciasConCupos(): ResidenciaItem[] {
  return residenciasData.listado_completo_residencias.filter(
    residencia => residencia.cantidad_cupos > 0
  )
}

// Función para obtener estadísticas por provincia
export function getEstadisticasPorProvincia() {
  const estadisticas: Record<string, {
    cantidad_residencias: number
    total_cupos: number
    cupos_nacional: number
    cupos_provincial: number
    cupos_mixto: number
    cupos_sin_especificar: number
  }> = {}

  residenciasData.listado_completo_residencias.forEach(residencia => {
    if (!estadisticas[residencia.provincia]) {
      estadisticas[residencia.provincia] = {
        cantidad_residencias: 0,
        total_cupos: 0,
        cupos_nacional: 0,
        cupos_provincial: 0,
        cupos_mixto: 0,
        cupos_sin_especificar: 0
      }
    }

    estadisticas[residencia.provincia].cantidad_residencias++
    estadisticas[residencia.provincia].total_cupos += residencia.cantidad_cupos

    switch (residencia.financiamiento) {
      case 'nacional':
        estadisticas[residencia.provincia].cupos_nacional += residencia.cantidad_cupos
        break
      case 'Mixto':
        estadisticas[residencia.provincia].cupos_mixto += residencia.cantidad_cupos
        break
      case 'sin especificar':
        estadisticas[residencia.provincia].cupos_sin_especificar += residencia.cantidad_cupos
        break
      default:
        estadisticas[residencia.provincia].cupos_provincial += residencia.cantidad_cupos
    }
  })

  return estadisticas
}

// Función para buscar residencias por texto
export function buscarResidencias(texto: string): ResidenciaItem[] {
  const textoLower = texto.toLowerCase()
  return residenciasData.listado_completo_residencias.filter(
    residencia =>
      residencia.institucion.toLowerCase().includes(textoLower) ||
      residencia.provincia.toLowerCase().includes(textoLower)
  )
}

// Función para obtener las provincias únicas
export function getProvincias(): string[] {
  const provincias = new Set(
    residenciasData.listado_completo_residencias.map(r => r.provincia)
  )
  return Array.from(provincias).sort()
}

// Función para obtener los tipos de financiamiento únicos
export function getTiposFinanciamiento(): string[] {
  const tipos = new Set(
    residenciasData.listado_completo_residencias.map(r => r.financiamiento)
  )
  return Array.from(tipos).sort()
}
