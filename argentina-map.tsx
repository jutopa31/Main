"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Province {
  id: string
  name: string
  capital: string
  population: string
  area: string
  region: string
  description: string
}

const provinces: Record<string, Province> = {
  "buenos-aires": {
    id: "buenos-aires",
    name: "Buenos Aires",
    capital: "La Plata",
    population: "17.5 million",
    area: "307,571 km²",
    region: "Center",
    description: "The most populous province, surrounding the federal capital.",
  },
  catamarca: {
    id: "catamarca",
    name: "Catamarca",
    capital: "San Fernando del Valle de Catamarca",
    population: "415,000",
    area: "102,602 km²",
    region: "Northwest",
    description: "Known for its mining industry and archaeological sites.",
  },
  chaco: {
    id: "chaco",
    name: "Chaco",
    capital: "Resistencia",
    population: "1.2 million",
    area: "99,633 km²",
    region: "Northeast",
    description: "Agricultural province known for cotton and livestock.",
  },
  chubut: {
    id: "chubut",
    name: "Chubut",
    capital: "Rawson",
    population: "618,000",
    area: "224,686 km²",
    region: "Patagonia",
    description: "Patagonian province famous for whale watching and Welsh heritage.",
  },
  cordoba: {
    id: "cordoba",
    name: "Córdoba",
    capital: "Córdoba",
    population: "3.8 million",
    area: "165,321 km²",
    region: "Center",
    description: "Industrial and educational hub, known for its universities.",
  },
  corrientes: {
    id: "corrientes",
    name: "Corrientes",
    capital: "Corrientes",
    population: "1.1 million",
    area: "88,199 km²",
    region: "Northeast",
    description: "Known for its wetlands and traditional folk music.",
  },
  "entre-rios": {
    id: "entre-rios",
    name: "Entre Ríos",
    capital: "Paraná",
    population: "1.4 million",
    area: "78,781 km²",
    region: "Northeast",
    description: "Agricultural province between the Paraná and Uruguay rivers.",
  },
  formosa: {
    id: "formosa",
    name: "Formosa",
    capital: "Formosa",
    population: "606,000",
    area: "72,066 km²",
    region: "Northeast",
    description: "Subtropical province bordering Paraguay.",
  },
  jujuy: {
    id: "jujuy",
    name: "Jujuy",
    capital: "San Salvador de Jujuy",
    population: "770,000",
    area: "53,219 km²",
    region: "Northwest",
    description: "Mountainous province known for colorful landscapes and indigenous culture.",
  },
  "la-pampa": {
    id: "la-pampa",
    name: "La Pampa",
    capital: "Santa Rosa",
    population: "366,000",
    area: "143,440 km²",
    region: "Center",
    description: "Agricultural province in the heart of the Pampas region.",
  },
  "la-rioja": {
    id: "la-rioja",
    name: "La Rioja",
    capital: "La Rioja",
    population: "384,000",
    area: "89,680 km²",
    region: "Northwest",
    description: "Wine-producing province with desert landscapes.",
  },
  mendoza: {
    id: "mendoza",
    name: "Mendoza",
    capital: "Mendoza",
    population: "2.0 million",
    area: "148,827 km²",
    region: "Cuyo",
    description: "World-famous wine region at the foot of the Andes.",
  },
  misiones: {
    id: "misiones",
    name: "Misiones",
    capital: "Posadas",
    population: "1.3 million",
    area: "29,801 km²",
    region: "Northeast",
    description: "Subtropical province home to Iguazu Falls.",
  },
  neuquen: {
    id: "neuquen",
    name: "Neuquén",
    capital: "Neuquén",
    population: "664,000",
    area: "94,078 km²",
    region: "Patagonia",
    description: "Energy province with significant oil and gas reserves.",
  },
  "rio-negro": {
    id: "rio-negro",
    name: "Río Negro",
    capital: "Viedma",
    population: "747,000",
    area: "203,013 km²",
    region: "Patagonia",
    description: "Known for fruit production and beautiful lake districts.",
  },
  salta: {
    id: "salta",
    name: "Salta",
    capital: "Salta",
    population: "1.4 million",
    area: "155,488 km²",
    region: "Northwest",
    description: "Colonial architecture and stunning Andean landscapes.",
  },
  "san-juan": {
    id: "san-juan",
    name: "San Juan",
    capital: "San Juan",
    population: "738,000",
    area: "89,651 km²",
    region: "Cuyo",
    description: "Wine and mining province with desert climate.",
  },
  "san-luis": {
    id: "san-luis",
    name: "San Luis",
    capital: "San Luis",
    population: "508,000",
    area: "76,748 km²",
    region: "Cuyo",
    description: "Known for its sierras and technology industry.",
  },
  "santa-cruz": {
    id: "santa-cruz",
    name: "Santa Cruz",
    capital: "Río Gallegos",
    population: "374,000",
    area: "243,943 km²",
    region: "Patagonia",
    description: "Patagonian province with glaciers and fossil sites.",
  },
  "santa-fe": {
    id: "santa-fe",
    name: "Santa Fe",
    capital: "Santa Fe",
    population: "3.5 million",
    area: "133,007 km²",
    region: "Center",
    description: "Industrial and agricultural powerhouse.",
  },
  "santiago-del-estero": {
    id: "santiago-del-estero",
    name: "Santiago del Estero",
    capital: "Santiago del Estero",
    population: "978,000",
    area: "136,351 km²",
    region: "Northwest",
    description: "Argentina's oldest city and folklore capital.",
  },
  "tierra-del-fuego": {
    id: "tierra-del-fuego",
    name: "Tierra del Fuego",
    capital: "Ushuaia",
    population: "173,000",
    area: "21,263 km²",
    region: "Patagonia",
    description: "The southernmost province, known as 'End of the World'.",
  },
  tucuman: {
    id: "tucuman",
    name: "Tucumán",
    capital: "San Miguel de Tucumán",
    population: "1.7 million",
    area: "22,524 km²",
    region: "Northwest",
    description: "Sugar capital and birthplace of Argentine independence.",
  },
  caba: {
    id: "caba",
    name: "Ciudad Autónoma de Buenos Aires",
    capital: "Buenos Aires",
    population: "3.1 million",
    area: "203 km²",
    region: "Center",
    description: "Federal capital and largest city of Argentina.",
  },
}

const regionColors = {
  Northwest: "#ef4444", // red-500
  Northeast: "#22c55e", // green-500
  Cuyo: "#f59e0b", // amber-500
  Center: "#3b82f6", // blue-500
  Patagonia: "#8b5cf6", // violet-500
}

export default function ArgentinaMap() {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (provinceId: string, event: React.MouseEvent) => {
    setHoveredProvince(provinceId)
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredProvince(null)
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Interactive Map of Argentina</h1>
        <p className="text-gray-600">Hover over provinces to see detailed information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Legend */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Regions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(regionColors).map(([region, color]) => (
              <div key={region} className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                <span className="text-sm font-medium">{region}</span>
              </div>
            ))}
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                Argentina is divided into 23 provinces and 1 autonomous city (CABA)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <div className="lg:col-span-3 relative">
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <svg viewBox="0 0 400 600" className="w-full h-auto max-h-[600px]" onMouseMove={handleMouseMove}>
              {/* Argentina Outline - Geometric Simplified Shape */}
              <defs>
                <clipPath id="argentina-outline">
                  <path d="M80 40 L320 40 L340 80 L350 120 L360 160 L370 200 L375 240 L380 280 L385 320 L390 360 L395 400 L390 440 L380 480 L360 520 L330 550 L280 570 L220 580 L160 575 L120 565 L90 550 L70 530 L60 500 L55 460 L50 420 L45 380 L40 340 L35 300 L30 260 L35 220 L40 180 L50 140 L65 100 L80 60 Z" />
                </clipPath>
              </defs>

              <g clipPath="url(#argentina-outline)">
                {/* Jujuy - Top left corner */}
                <path
                  id="jujuy"
                  d="M80 40 L140 40 L120 80 L80 80 Z"
                  fill={regionColors["Northwest"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("jujuy", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Salta - Northwest region */}
                <path
                  id="salta"
                  d="M80 80 L120 80 L140 40 L200 40 L180 120 L120 120 Z"
                  fill={regionColors["Northwest"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("salta", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Formosa - Northeast border */}
                <path
                  id="formosa"
                  d="M200 40 L320 40 L340 80 L280 80 L240 60 Z"
                  fill={regionColors["Northeast"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("formosa", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Chaco - Central northeast */}
                <path
                  id="chaco"
                  d="M240 60 L280 80 L340 80 L350 120 L300 120 L260 100 Z"
                  fill={regionColors["Northeast"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("chaco", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Misiones - Eastern tip */}
                <path
                  id="misiones"
                  d="M300 120 L350 120 L360 160 L320 160 L310 140 Z"
                  fill={regionColors["Northeast"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("misiones", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Corrientes - East central */}
                <path
                  id="corrientes"
                  d="M260 100 L300 120 L310 140 L320 160 L280 180 L240 160 Z"
                  fill={regionColors["Northeast"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("corrientes", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Tucumán - Small northwest */}
                <path
                  id="tucuman"
                  d="M120 120 L180 120 L160 160 L100 160 Z"
                  fill={regionColors["Northwest"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("tucuman", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Santiago del Estero - Central northwest */}
                <path
                  id="santiago-del-estero"
                  d="M160 160 L180 120 L240 120 L260 100 L240 160 L200 180 Z"
                  fill={regionColors["Northwest"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("santiago-del-estero", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Catamarca - West central */}
                <path
                  id="catamarca"
                  d="M80 120 L120 120 L100 160 L160 160 L140 200 L80 200 Z"
                  fill={regionColors["Northwest"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("catamarca", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* La Rioja - West */}
                <path
                  id="la-rioja"
                  d="M80 200 L140 200 L120 240 L70 240 Z"
                  fill={regionColors["Northwest"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("la-rioja", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* San Juan - Western Cuyo */}
                <path
                  id="san-juan"
                  d="M70 240 L120 240 L100 280 L60 280 Z"
                  fill={regionColors["Cuyo"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("san-juan", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Mendoza - Central Cuyo */}
                <path
                  id="mendoza"
                  d="M60 280 L100 280 L120 240 L160 240 L140 320 L80 320 Z"
                  fill={regionColors["Cuyo"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("mendoza", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* San Luis - Eastern Cuyo */}
                <path
                  id="san-luis"
                  d="M160 240 L200 240 L180 280 L140 320 L160 240 Z"
                  fill={regionColors["Cuyo"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("san-luis", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Entre Ríos - Eastern */}
                <path
                  id="entre-rios"
                  d="M240 160 L280 180 L320 160 L360 160 L340 200 L300 220 L260 200 Z"
                  fill={regionColors["Northeast"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("entre-rios", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Santa Fe - Central east */}
                <path
                  id="santa-fe"
                  d="M200 180 L240 160 L260 200 L300 220 L280 260 L240 240 Z"
                  fill={regionColors["Center"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("santa-fe", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Córdoba - Central */}
                <path
                  id="cordoba"
                  d="M140 200 L200 180 L240 240 L200 240 L180 280 L160 240 Z"
                  fill={regionColors["Center"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("cordoba", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* La Pampa - Central south */}
                <path
                  id="la-pampa"
                  d="M140 320 L180 280 L200 240 L240 240 L220 320 L180 360 Z"
                  fill={regionColors["Center"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("la-pampa", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Buenos Aires - Large eastern province */}
                <path
                  id="buenos-aires"
                  d="M240 240 L280 260 L300 220 L340 200 L370 200 L375 240 L380 280 L385 320 L360 360 L320 380 L280 360 L240 340 L220 320 Z"
                  fill={regionColors["Center"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("buenos-aires", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* CABA - Small circle within Buenos Aires */}
                <circle
                  id="caba"
                  cx="340"
                  cy="300"
                  r="8"
                  fill={regionColors["Center"]}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("caba", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Neuquén - Northern Patagonia */}
                <path
                  id="neuquen"
                  d="M80 320 L140 320 L180 360 L160 400 L120 420 L80 400 Z"
                  fill={regionColors["Patagonia"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("neuquen", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Río Negro - Central Patagonia */}
                <path
                  id="rio-negro"
                  d="M180 360 L220 320 L240 340 L280 360 L260 400 L220 420 L180 400 L160 400 Z"
                  fill={regionColors["Patagonia"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("rio-negro", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Chubut - Central-south Patagonia */}
                <path
                  id="chubut"
                  d="M120 420 L160 400 L180 400 L220 420 L200 480 L160 500 L120 480 Z"
                  fill={regionColors["Patagonia"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("chubut", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Santa Cruz - Southern Patagonia */}
                <path
                  id="santa-cruz"
                  d="M120 480 L160 500 L200 480 L220 420 L260 400 L280 360 L320 380 L300 520 L260 540 L220 550 L180 545 L140 535 L100 520 L80 500 L70 480 Z"
                  fill={regionColors["Patagonia"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("santa-cruz", e)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Tierra del Fuego - Southernmost */}
                <path
                  id="tierra-del-fuego"
                  d="M160 575 L220 580 L200 590 L140 585 Z"
                  fill={regionColors["Patagonia"]}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:opacity-80 transition-all duration-200 hover:stroke-gray-400"
                  onMouseEnter={(e) => handleMouseEnter("tierra-del-fuego", e)}
                  onMouseLeave={handleMouseLeave}
                />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredProvince && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: "translateY(-100%)",
          }}
        >
          <Card className="w-80 shadow-lg border-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{provinces[hoveredProvince].name}</CardTitle>
                <Badge
                  style={{
                    backgroundColor: regionColors[provinces[hoveredProvince].region as keyof typeof regionColors],
                  }}
                  className="text-white"
                >
                  {provinces[hoveredProvince].region}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Capital:</span>
                  <p className="text-gray-600">{provinces[hoveredProvince].capital}</p>
                </div>
                <div>
                  <span className="font-medium">Population:</span>
                  <p className="text-gray-600">{provinces[hoveredProvince].population}</p>
                </div>
                <div>
                  <span className="font-medium">Area:</span>
                  <p className="text-gray-600">{provinces[hoveredProvince].area}</p>
                </div>
              </div>
              <div>
                <span className="font-medium">Description:</span>
                <p className="text-gray-600 text-sm mt-1">{provinces[hoveredProvince].description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
