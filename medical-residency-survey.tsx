"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, BarChart3, Phone, Building, Grid3X3, Map, Database, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MedicalResidency, Contact, ResidentSalary } from "./types/residency"
import ResidencyRegistry from "./components/residency-registry"
import ContactManagement from "./components/contact-management"
import ResidentSalaryManagement from "./components/resident-salary-management"
import EnhancedReports from "./components/enhanced-reports"
import GridMap from "./components/grid-map"
import DataImportAgent from "./components/DataImportAgent"
import PDFProcessor from "./components/PDFProcessor"
import { migrarTodasLasResidencias } from "./lib/residencias-migration"
// @ts-ignore
import jsPDF from "jspdf"

// Province mapping
const provinces: Record<string, any> = {
  "buenos-aires": { name: "Buenos Aires", region: "Centro" },
  catamarca: { name: "Catamarca", region: "Norte" },
  chaco: { name: "Chaco", region: "Noreste" },
  chubut: { name: "Chubut", region: "Patagonia" },
  cordoba: { name: "Córdoba", region: "Centro" },
  corrientes: { name: "Corrientes", region: "Noreste" },
  "entre-rios": { name: "Entre Ríos", region: "Noreste" },
  formosa: { name: "Formosa", region: "Noreste" },
  jujuy: { name: "Jujuy", region: "Norte" },
  "la-pampa": { name: "La Pampa", region: "Centro" },
  "la-rioja": { name: "La Rioja", region: "Norte" },
  mendoza: { name: "Mendoza", region: "Cuyo" },
  misiones: { name: "Misiones", region: "Noreste" },
  neuquen: { name: "Neuquén", region: "Patagonia" },
  "rio-negro": { name: "Río Negro", region: "Patagonia" },
  salta: { name: "Salta", region: "Norte" },
  "san-juan": { name: "San Juan", region: "Cuyo" },
  "san-luis": { name: "San Luis", region: "Cuyo" },
  "santa-cruz": { name: "Santa Cruz", region: "Patagonia" },
  "santa-fe": { name: "Santa Fe", region: "Centro" },
  "santiago-del-estero": { name: "Santiago del Estero", region: "Norte" },
  "tierra-del-fuego": { name: "Tierra del Fuego", region: "Patagonia" },
  tucuman: { name: "Tucumán", region: "Norte" },
  caba: { name: "Ciudad Autónoma de Buenos Aires", region: "Centro" },
}

const regionColors = {
  Norte: "#ef4444",
  Noreste: "#22c55e",
  Cuyo: "#f59e0b",
  Centro: "#3b82f6",
  Patagonia: "#8b5cf6",
}

export default function MedicalResidencySurvey() {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [residencies, setResidencies] = useState<MedicalResidency[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [salaries, setSalaries] = useState<ResidentSalary[]>([])
  const [mapView, setMapView] = useState<"grid" | "geographic">("grid")
  const [activeTab, setActiveTab] = useState("map")
  const [selectedResidencyForContacts, setSelectedResidencyForContacts] = useState<string | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedResidencies = localStorage.getItem("medical-residencies")
    const savedContacts = localStorage.getItem("medical-contacts")
    const savedSalaries = localStorage.getItem("medical-salaries")

    if (savedResidencies) {
      try {
        const parsed = JSON.parse(savedResidencies)
        setResidencies(
          parsed.map((r: any) => ({
            ...r,
            lastUpdated: new Date(r.lastUpdated),
            applicationDeadline: r.applicationDeadline ? new Date(r.applicationDeadline) : undefined,
          })),
        )
      } catch (error) {
        console.error("Error loading saved residencies:", error)
      }
    } else {
      // Si no hay residencias guardadas, cargar automáticamente los datos oficiales
      console.log("Cargando datos oficiales automáticamente...")
      const residenciasOficiales = migrarTodasLasResidencias()
      const residenciasConIds = residenciasOficiales.map((residencia) => ({
        ...residencia,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        lastUpdated: new Date(),
      }))
      setResidencies(residenciasConIds)
      console.log(`Se cargaron automáticamente ${residenciasConIds.length} residencias oficiales`)
    }

    if (savedContacts) {
      try {
        const parsed = JSON.parse(savedContacts)
        setContacts(
          parsed.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
            lastContactDate: c.lastContactDate ? new Date(c.lastContactDate) : undefined,
            contactHistory: c.contactHistory.map((h: any) => ({
              ...h,
              date: new Date(h.date),
              followUpDate: h.followUpDate ? new Date(h.followUpDate) : undefined,
            })),
          })),
        )
              } catch (error) {
          console.error("Error loading saved contacts:", error)
        }
      }

      if (savedSalaries) {
        try {
          const parsed = JSON.parse(savedSalaries)
          setSalaries(
            parsed.map((s: any) => ({
              ...s,
              createdAt: new Date(s.createdAt),
              updatedAt: new Date(s.updatedAt),
              effectiveDate: new Date(s.effectiveDate),
            })),
          )
        } catch (error) {
          console.error("Error loading saved salaries:", error)
        }
      }
    }, [])

  // Save data to localStorage whenever data changes
  useEffect(() => {
    if (residencies.length > 0) {
      localStorage.setItem("medical-residencies", JSON.stringify(residencies))
    }
  }, [residencies])

  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem("medical-contacts", JSON.stringify(contacts))
    }
  }, [contacts])

  useEffect(() => {
    if (salaries.length > 0) {
      localStorage.setItem("medical-salaries", JSON.stringify(salaries))
    }
  }, [salaries])

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

  const handleProvinceClick = (provinceId: string) => {
    setSelectedProvince(selectedProvince === provinceId ? null : provinceId)
  }

  const handleAddResidency = (residencyData: Omit<MedicalResidency, "id" | "lastUpdated">) => {
    const newResidency: MedicalResidency = {
      ...residencyData,
      id: Date.now().toString(),
      lastUpdated: new Date(),
    }
    setResidencies((prev) => [...prev, newResidency])
  }

  const handleAddResidencies = (residenciesData: Omit<MedicalResidency, "id" | "lastUpdated">[]) => {
    const newResidencies: MedicalResidency[] = residenciesData.map((residencyData) => ({
      ...residencyData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date(),
    }))
    setResidencies((prev) => [...prev, ...newResidencies])
  }

  const handleUpdateResidency = (id: string, updates: Partial<MedicalResidency>) => {
    setResidencies((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates, lastUpdated: new Date() } : r)))
  }

  const handleDeleteResidency = (id: string) => {
    setResidencies((prev) => prev.filter((r) => r.id !== id))
    // Also remove associated contacts
    setContacts((prev) => prev.filter((c) => c.residencyId !== id))
  }

  const handleAddContact = (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    const newContact: Contact = {
      ...contactData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setContacts((prev) => [...prev, newContact])
  }

  const handleUpdateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c)))
  }

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  const handleAddInteraction = (contactId: string, interaction: any) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId
          ? {
              ...c,
              contactHistory: [...c.contactHistory, { ...interaction, id: Date.now().toString() }],
              lastContactDate: interaction.date,
              updatedAt: new Date(),
            }
          : c,
      ),
    )
  }

  const handleAddSalary = (salaryData: Omit<ResidentSalary, "id" | "createdAt" | "updatedAt">) => {
    const newSalary: ResidentSalary = {
      ...salaryData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setSalaries((prev) => [...prev, newSalary])
  }

  const handleUpdateSalary = (id: string, updates: Partial<ResidentSalary>) => {
    setSalaries((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s)))
  }

  const handleDeleteSalary = (id: string) => {
    setSalaries((prev) => prev.filter((s) => s.id !== id))
  }

  const handleGenerateReport = (reportConfig: any) => {
    try {
      if (!reportConfig) {
        console.error("[Reporte] El objeto reportConfig es nulo o indefinido:", reportConfig)
        return
      }
      // Log detallado del objeto recibido
      console.log("[Reporte] Generando reporte con configuración:", JSON.stringify(reportConfig, null, 2))
      // Implementación básica de PDF
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(reportConfig.title || "Reporte de Residencias Médicas", 10, 20);
      doc.setFontSize(12);
      doc.text(`Residencias incluidas: ${reportConfig.residencies?.length ?? 0}`, 10, 35);
      doc.text(`Fecha de generación: ${(new Date(reportConfig.generatedAt)).toLocaleString()}`, 10, 45);
      // Puedes agregar más detalles aquí según lo que quieras mostrar
      doc.save("reporte-residencias.pdf");
    } catch (error) {
      console.error("[Reporte] Error inesperado al generar el reporte:", error)
    }
  }

  const handleNavigateToContacts = (residencyId?: string) => {
    setSelectedResidencyForContacts(residencyId || null)
    setActiveTab("contacts")
  }

  // Cambiar automáticamente a la pestaña de contactos cuando se navega desde una residencia
  useEffect(() => {
    if (selectedResidencyForContacts) {
      setActiveTab("contacts")
    }
  }, [selectedResidencyForContacts])

  const getProvinceStats = (provinceId: string) => {
    const provinceName = provinces[provinceId]?.name
    const provinceResidencies = residencies.filter((r) => r.province === provinceName)
    return {
      total: provinceResidencies.length,
      active: provinceResidencies.filter((r) => r.registryStatus === "active").length,
      vacancies: provinceResidencies.reduce((sum, r) => sum + r.availableVacancies, 0),
      contacts: contacts.filter((c) => provinceResidencies.some((r) => r.id === c.residencyId)).length,
    }
  }

  // Geographic SVG Map Component (simplified for demo)
  const GeographicMap = () => (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <svg viewBox="0 0 400 600" className="w-full h-auto max-h-[600px]" onMouseMove={handleMouseMove}>
        <defs>
          <clipPath id="argentina-outline">
            <path d="M80 40 L320 40 L340 80 L350 120 L360 160 L370 200 L375 240 L380 280 L385 320 L390 360 L395 400 L390 440 L380 480 L360 520 L330 550 L280 570 L220 580 L160 575 L120 565 L90 550 L70 530 L60 500 L55 460 L50 420 L45 380 L40 340 L35 300 L30 260 L35 220 L40 180 L50 140 L65 100 L80 60 Z" />
          </clipPath>
        </defs>

        <g clipPath="url(#argentina-outline)">
          {Object.entries(provinces).map(([provinceId, province]) => {
            const stats = getProvinceStats(provinceId)
            const isSelected = selectedProvince === provinceId
            const baseColor = regionColors[province.region as keyof typeof regionColors]

            // Sample province shapes - simplified for demo
            let pathData = ""
            let centerX = 200
            let centerY = 300

            switch (provinceId) {
              case "buenos-aires":
                pathData =
                  "M240 240 L280 260 L300 220 L340 200 L370 200 L375 240 L380 280 L385 320 L360 360 L320 380 L280 360 L240 340 L220 320 Z"
                centerX = 320
                centerY = 300
                break
              case "caba":
                return (
                  <g key={provinceId}>
                    <circle
                      cx="340"
                      cy="300"
                      r="8"
                      fill={isSelected ? "#1f2937" : baseColor}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? "3" : "2"}
                      className="cursor-pointer hover:opacity-80 transition-all duration-200"
                      onMouseEnter={(e) => handleMouseEnter(provinceId, e)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleProvinceClick(provinceId)}
                    />
                    {isSelected && stats.total > 0 && (
                      <text
                        x="340"
                        y="305"
                        textAnchor="middle"
                        className="fill-white text-xs font-bold pointer-events-none"
                      >
                        {stats.total}
                      </text>
                    )}
                  </g>
                )
              case "cordoba":
                pathData = "M140 200 L200 180 L240 240 L200 240 L180 280 L160 240 Z"
                centerX = 190
                centerY = 230
                break
              case "santa-fe":
                pathData = "M200 180 L240 160 L260 200 L300 220 L280 260 L240 240 Z"
                centerX = 250
                centerY = 210
                break
              case "mendoza":
                pathData = "M60 280 L100 280 L120 240 L160 240 L140 320 L80 320 Z"
                centerX = 110
                centerY = 280
                break
              default:
                // Default small rectangle for other provinces
                const x = 100 + (Object.keys(provinces).indexOf(provinceId) % 8) * 30
                const y = 100 + Math.floor(Object.keys(provinces).indexOf(provinceId) / 8) * 40
                pathData = `M${x} ${y} L${x + 25} ${y} L${x + 25} ${y + 35} L${x} ${y + 35} Z`
                centerX = x + 12
                centerY = y + 17
            }

            return (
              <g key={provinceId}>
                <path
                  d={pathData}
                  fill={isSelected ? "#1f2937" : baseColor}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? "3" : "1.5"}
                  className="cursor-pointer hover:opacity-80 transition-all duration-200"
                  onMouseEnter={(e) => handleMouseEnter(provinceId, e)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleProvinceClick(provinceId)}
                />
                {isSelected && stats.total > 0 && (
                  <text
                    x={centerX}
                    y={centerY}
                    textAnchor="middle"
                    className="fill-white text-xs font-bold pointer-events-none"
                  >
                    {stats.total}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Registro Nacional de Residencias del Equipo de Salud</h1>
        <p className="text-gray-600">
          Plataforma integral para el relevamiento y gestión de residencias médicas en Argentina
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Mapa Interactivo
          </TabsTrigger>
          <TabsTrigger value="registry" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Registro de Residencias
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Gestión de Contactos
          </TabsTrigger>
          <TabsTrigger value="salaries" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Remuneraciones
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Reportes y Análisis
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Importación Masiva
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-6">
          {/* Map View Toggle */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Vista del Mapa</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={mapView === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMapView("grid")}
                    className="flex items-center gap-2"
                  >
                    <Grid3X3 className="w-4 h-4" />
                    Vista Cuadrícula
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {mapView === "grid"
                  ? "Vista simplificada en cuadrícula organizada por regiones para mejor navegación"
                  : "Vista geográfica tradicional de Argentina con ubicaciones aproximadas"}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Legend and Selected Province Info */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Legend */}
                <div>
                  <h4 className="font-medium mb-3">Regiones</h4>
                  <div className="space-y-2">
                    {Object.entries(regionColors).map(([region, color]) => (
                      <div key={region} className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium">{region}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-2">
                    {mapView === "grid"
                      ? "Haz clic en cualquier provincia para seleccionarla y ver detalles"
                      : "Haz clic en una provincia en el mapa para seleccionarla"}
                  </p>

                  {selectedProvince && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-800">{provinces[selectedProvince]?.name}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-blue-600">
                        <div>
                          <span className="font-medium">{getProvinceStats(selectedProvince).total}</span>
                          <p>Residencias</p>
                        </div>
                        <div>
                          <span className="font-medium">{getProvinceStats(selectedProvince).vacancies}</span>
                          <p>Vacantes</p>
                        </div>
                        <div>
                          <span className="font-medium">{getProvinceStats(selectedProvince).active}</span>
                          <p>Activas</p>
                        </div>
                        <div>
                          <span className="font-medium">{getProvinceStats(selectedProvince).contacts}</span>
                          <p>Contactos</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="pt-2 border-t">
                  <h4 className="font-medium mb-2">Resumen Nacional</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Residencias:</span>
                      <span className="font-medium">{residencies.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vacantes Disponibles:</span>
                      <span className="font-medium text-green-600">
                        {residencies.reduce((sum, r) => sum + r.availableVacancies, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contactos Registrados:</span>
                      <span className="font-medium">{contacts.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Display */}
            <div className="lg:col-span-3">
              {mapView === "grid" ? (
                <GridMap
                  provinces={provinces}
                  regionColors={regionColors}
                  selectedProvince={selectedProvince}
                  onProvinceClick={handleProvinceClick}
                  onProvinceHover={handleMouseEnter}
                  onProvinceLeave={handleMouseLeave}
                  getProvinceStats={getProvinceStats}
                />
              ) : (
                <GeographicMap />
              )}
            </div>
          </div>

          {/* Tooltip for Geographic Map */}
          {hoveredProvince && mapView === "geographic" && (
            <div
              className="fixed z-50 pointer-events-none"
              style={{
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y - 10,
                transform: "translateY(-100%)",
              }}
            >
              <Card className="w-64 shadow-lg border-2">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{provinces[hoveredProvince]?.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{getProvinceStats(hoveredProvince).total}</span>
                        <p className="text-xs">Residencias</p>
                      </div>
                      <div>
                        <span className="font-medium">{getProvinceStats(hoveredProvince).vacancies}</span>
                        <p className="text-xs">Vacantes</p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600">Haz clic para seleccionar</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="registry">
          <ResidencyRegistry
            selectedProvince={selectedProvince ? provinces[selectedProvince]?.name : null}
            residencies={residencies}
            contacts={contacts}
            onAddResidency={handleAddResidency}
            onAddResidencies={handleAddResidencies}
            onUpdateResidency={handleUpdateResidency}
            onDeleteResidency={handleDeleteResidency}
            onNavigateToContacts={handleNavigateToContacts}
          />
        </TabsContent>

        <TabsContent value="contacts">
          <ContactManagement
            residencies={residencies}
            contacts={contacts}
            selectedResidencyId={selectedResidencyForContacts}
            onAddContact={handleAddContact}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
            onAddInteraction={handleAddInteraction}
          />
        </TabsContent>

        <TabsContent value="salaries">
          <ResidentSalaryManagement
            residencies={residencies}
            salaries={salaries}
            onAddSalary={handleAddSalary}
            onUpdateSalary={handleUpdateSalary}
            onDeleteSalary={handleDeleteSalary}
          />
        </TabsContent>

        <TabsContent value="reports">
          <EnhancedReports residencies={residencies} contacts={contacts} onGenerateReport={handleGenerateReport} />
        </TabsContent>

        <TabsContent value="import">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Importación Masiva de Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Utiliza nuestro agente inteligente para extraer automáticamente información de residencias médicas 
                  desde PDFs y otras fuentes externas. El sistema utiliza LLMs para procesar y estructurar los datos.
                </p>
              </CardContent>
            </Card>
            
            <DataImportAgent onImportResidencies={handleAddResidencies} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
