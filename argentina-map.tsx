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
    region: "Norte",
    description: "Known for its mining industry and archaeological sites.",
  },
  chaco: {
    id: "chaco",
    name: "Chaco",
    capital: "Resistencia",
    population: "1.2 million",
    area: "99,633 km²",
    region: "Noreste",
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
    region: "Noreste",
    description: "Known for its wetlands and traditional folk music.",
  },
  "entre-rios": {
    id: "entre-rios",
    name: "Entre Ríos",
    capital: "Paraná",
    population: "1.4 million",
    area: "78,781 km²",
    region: "Noreste",
    description: "Agricultural province between the Paraná and Uruguay rivers.",
  },
  formosa: {
    id: "formosa",
    name: "Formosa",
    capital: "Formosa",
    population: "606,000",
    area: "72,066 km²",
    region: "Noreste",
    description: "Subtropical province bordering Paraguay.",
  },
  jujuy: {
    id: "jujuy",
    name: "Jujuy",
    capital: "San Salvador de Jujuy",
    population: "770,000",
    area: "53,219 km²",
    region: "Norte",
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
    region: "Norte",
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
    region: "Noreste",
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
    region: "Norte",
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
    region: "Norte",
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
    region: "Norte",
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
  Norte: "#ef4444", // red-500
  Noreste: "#22c55e", // green-500
  Cuyo: "#f59e0b", // amber-500
  Center: "#3b82f6", // blue-500
  Patagonia: "#8b5cf6", // violet-500
}

export default function ArgentinaMap() {
  // Ordenar provincias alfabéticamente por nombre
  const sortedProvinces = Object.values(provinces).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Provincias de Argentina</h1>
        <p className="text-gray-600">Listado alfabético de provincias y CABA</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedProvinces.map((province) => (
          <div
            key={province.id}
            className="bg-white rounded-lg border shadow-sm p-4 flex items-center justify-center text-lg font-medium text-gray-800 hover:bg-blue-50 transition"
          >
            {province.name}
          </div>
        ))}
      </div>
    </div>
  )
}
