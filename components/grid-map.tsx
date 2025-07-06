"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Building, Phone } from "lucide-react"

interface Province {
  id: string
  name: string
  region: string
}

interface GridMapProps {
  provinces: Record<string, Province>
  regionColors: Record<string, string>
  selectedProvince: string | null
  onProvinceClick: (provinceId: string) => void
  onProvinceHover: (provinceId: string, event: React.MouseEvent) => void
  onProvinceLeave: () => void
  getProvinceStats: (provinceId: string) => {
    total: number
    active: number
    vacancies: number
    contacts: number
  }
}

export default function GridMap({
  provinces,
  regionColors,
  selectedProvince,
  onProvinceClick,
  onProvinceHover,
  onProvinceLeave,
  getProvinceStats,
}: GridMapProps) {
  // Organize provinces by region for better visual grouping
  const provincesByRegion = {
    Norte: [
      { id: "jujuy", name: "Jujuy" },
      { id: "salta", name: "Salta" },
      { id: "tucuman", name: "Tucumán" },
      { id: "catamarca", name: "Catamarca" },
      { id: "la-rioja", name: "La Rioja" },
      { id: "santiago-del-estero", name: "Santiago del Estero" },
    ],
    Noreste: [
      { id: "formosa", name: "Formosa" },
      { id: "chaco", name: "Chaco" },
      { id: "misiones", name: "Misiones" },
      { id: "corrientes", name: "Corrientes" },
      { id: "entre-rios", name: "Entre Ríos" },
    ],
    Cuyo: [
      { id: "san-juan", name: "San Juan" },
      { id: "mendoza", name: "Mendoza" },
      { id: "san-luis", name: "San Luis" },
    ],
    Centro: [
      { id: "la-pampa", name: "La Pampa" },
      { id: "cordoba", name: "Córdoba" },
      { id: "santa-fe", name: "Santa Fe" },
      { id: "buenos-aires", name: "Buenos Aires" },
      { id: "caba", name: "CABA" },
    ],
    Patagonia: [
      { id: "neuquen", name: "Neuquén" },
      { id: "rio-negro", name: "Río Negro" },
      { id: "chubut", name: "Chubut" },
      { id: "santa-cruz", name: "Santa Cruz" },
      { id: "tierra-del-fuego", name: "Tierra del Fuego" },
    ],
  }

  const ProvinceCard = ({
    provinceId,
    provinceName,
    region,
  }: { provinceId: string; provinceName: string; region: string }) => {
    const stats = getProvinceStats(provinceId)
    const isSelected = selectedProvince === provinceId
    const regionColor = regionColors[region as keyof typeof regionColors]
    const hasData = stats.total > 0

    return (
      <div
        className={`
          relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[120px]
          ${
            isSelected
              ? "border-gray-800 shadow-lg scale-105 bg-gray-50"
              : "border-gray-200 hover:border-gray-400 hover:shadow-md hover:scale-102"
          }
          ${hasData ? "bg-white" : "bg-gray-50"}
        `}
        style={{
          borderLeftColor: regionColor,
          borderLeftWidth: "4px",
        }}
        onClick={() => onProvinceClick(provinceId)}
        onMouseEnter={(e) => onProvinceHover(provinceId, e)}
        onMouseLeave={onProvinceLeave}
      >
        {/* Province Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className={`font-semibold text-sm leading-tight ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
              {provinceName}
            </h3>
            <Badge className="mt-1 text-xs" style={{ backgroundColor: regionColor }}>
              {region}
            </Badge>
          </div>
          {isSelected && (
            <div className="ml-2">
              <MapPin className="w-4 h-4 text-gray-600" />
            </div>
          )}
        </div>

        {/* Statistics */}
        {hasData ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Building className="w-3 h-3 text-blue-500" />
                <span className="font-medium">{stats.total}</span>
                <span className="text-gray-500">res.</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-green-500" />
                <span className="font-medium">{stats.vacancies}</span>
                <span className="text-gray-500">vac.</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="font-medium">{stats.active}</span>
                <span className="text-gray-500">act.</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-purple-500" />
                <span className="font-medium">{stats.contacts}</span>
                <span className="text-gray-500">cont.</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${stats.total > 0 ? (stats.active / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-16 text-gray-400">
            <div className="text-center">
              <Building className="w-6 h-6 mx-auto mb-1 opacity-50" />
              <p className="text-xs">Sin datos</p>
            </div>
          </div>
        )}

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Grid Layout by Region */}
      {Object.entries(provincesByRegion).map(([region, regionProvinces]) => (
        <div key={region} className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: regionColors[region as keyof typeof regionColors] }}
            />
            <h3 className="text-lg font-semibold text-gray-800">{region}</h3>
            <Badge variant="outline" className="text-xs">
              {regionProvinces.length} provincias
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {regionProvinces.map((province) => (
              <ProvinceCard key={province.id} provinceId={province.id} provinceName={province.name} region={region} />
            ))}
          </div>
        </div>
      ))}

      {/* Summary Statistics */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Resumen Nacional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(provincesByRegion).map(([region, regionProvinces]) => {
              const regionStats = regionProvinces.reduce(
                (acc, province) => {
                  const stats = getProvinceStats(province.id)
                  return {
                    total: acc.total + stats.total,
                    active: acc.active + stats.active,
                    vacancies: acc.vacancies + stats.vacancies,
                    contacts: acc.contacts + stats.contacts,
                  }
                },
                { total: 0, active: 0, vacancies: 0, contacts: 0 },
              )

              return (
                <div key={region} className="text-center p-3 rounded-lg border">
                  <div
                    className="w-3 h-3 rounded mx-auto mb-2"
                    style={{ backgroundColor: regionColors[region as keyof typeof regionColors] }}
                  />
                  <p className="text-sm font-medium text-gray-700">{region}</p>
                  <p className="text-2xl font-bold text-gray-900">{regionStats.total}</p>
                  <p className="text-xs text-gray-500">residencias</p>
                  {regionStats.vacancies > 0 && (
                    <p className="text-xs text-green-600 mt-1">{regionStats.vacancies} vacantes</p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
