# Datos de Residencias Médicas - Integración Simplificada

Este documento explica cómo usar los datos de residencias médicas que se han incorporado al proyecto de manera simplificada.

## 🎯 Enfoque Simplificado

En lugar de crear dashboards separados, hemos integrado los datos directamente en tu sistema existente:

1. **Un botón simple** en el registro de residencias para importar datos oficiales
2. **Los datos se integran** automáticamente en tu sistema actual
3. **El mapa interactivo** funciona con estos datos
4. **Puedes agregar contactos** a las residencias importadas

## 📁 Archivos Creados

### 1. `lib/residencias-data.json`
Contiene todos los datos de residencias en formato JSON:
- **112 residencias** distribuidas en 22 provincias
- **1,049 cupos totales** disponibles
- Información detallada por provincia e institución

### 2. `lib/residencias-service.ts`
Servicio con funciones para acceder a los datos:

```typescript
import { getListadoCompleto, getResumen } from '@/lib/residencias-service'

// Obtener todas las residencias
const residencias = getListadoCompleto()

// Obtener el resumen
const resumen = getResumen()
```

### 3. `lib/residencias-migration.ts`
Servicio para convertir los datos al formato de tu sistema:

```typescript
import { migrarTodasLasResidencias } from '@/lib/residencias-migration'

// Migrar todas las residencias al formato del sistema
const residenciasMigradas = migrarTodasLasResidencias()
```

## 🚀 Cómo Usar

### Paso 1: Importar Datos Oficiales
1. Ve a tu aplicación principal
2. Navega a la pestaña "Registro de Residencias"
3. Haz clic en el botón **"Importar Datos Oficiales"**
4. ¡Listo! Las 112 residencias estarán disponibles en tu sistema

### Paso 2: Usar las Residencias
- **Agregar contactos**: Ve a "Gestión de Contactos" y selecciona una residencia importada
- **Ver en el mapa**: Las residencias aparecerán en el mapa interactivo
- **Editar información**: Puedes modificar cualquier residencia importada
- **Filtrar**: Usa los filtros existentes para encontrar residencias específicas

## 🔧 Funciones Disponibles

### Servicio de Datos (`lib/residencias-service.ts`)
- `getResidenciasData()` - Todos los datos
- `getResumen()` - Resumen general
- `getListadoCompleto()` - Lista completa de residencias
- `getResidenciasPorProvincia(provincia)` - Filtrar por provincia
- `getResidenciasPorFinanciamiento(tipo)` - Filtrar por financiamiento
- `getResidenciasConCupos()` - Solo con cupos disponibles
- `buscarResidencias(texto)` - Búsqueda por texto

### Servicio de Migración (`lib/residencias-migration.ts`)
- `migrarTodasLasResidencias()` - Migrar todas las residencias
- `migrarResidenciasConCupos()` - Migrar solo con cupos
- `migrarResidenciasPorProvincia(provincia)` - Migrar por provincia
- `getEstadisticasMigracion()` - Estadísticas de migración

## 🎨 Integración con el Sistema Existente

### Mapeo Automático
- **Provincias**: Se mapean automáticamente al formato del sistema
- **Financiamiento**: 
  - `nacional` → `public`
  - `Mixto` → `mixed`
  - `sin especificar` → `other`
- **Estado**: Todas las residencias se marcan como `active`
- **Vacantes**: Se calculan automáticamente según los cupos disponibles

### Funcionalidades Mantenidas
- ✅ **Búsqueda y filtros** funcionan con residencias importadas
- ✅ **Mapa interactivo** muestra las residencias importadas
- ✅ **Gestión de contactos** disponible para residencias importadas
- ✅ **Reportes** incluyen residencias importadas
- ✅ **Edición** de residencias importadas

## 📊 Datos Incluidos

### Resumen General
- **112 residencias** totales
- **1,049 cupos** disponibles
- **22 provincias** cubiertas

### Distribución por Provincia
- **Buenos Aires**: 9 residencias, 273 cupos
- **C.A.B.A.**: 7 residencias, 137 cupos
- **Santa Fe**: 18 residencias, 164 cupos
- **Y más...**

### Tipos de Financiamiento
- **Nacional**: 408 cupos
- **Mixto**: 6 cupos
- **Sin especificar**: 635 cupos

## 🔄 Actualización de Datos

Para actualizar los datos:
1. Modifica el archivo `lib/residencias-data.json`
2. Los cambios se reflejarán automáticamente
3. No es necesario reiniciar el servidor

## ✅ Ventajas de esta Implementación

1. **Simplicidad**: Un solo botón para importar todo
2. **Integración completa**: Funciona con todo tu sistema existente
3. **Sin duplicación**: No hay dashboards separados
4. **Mantenimiento fácil**: Todo en un lugar
5. **Performance**: Datos en memoria, muy rápido
6. **Flexibilidad**: Puedes editar y personalizar las residencias importadas

## 🎯 Resultado Final

Ahora tienes:
- **112 residencias oficiales** integradas en tu sistema
- **Mapa interactivo** que muestra todas las residencias
- **Sistema de contactos** funcionando con residencias oficiales
- **Filtros y búsqueda** que incluyen datos oficiales
- **Todo en una sola aplicación** sin complejidad adicional 