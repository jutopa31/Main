"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, Users, DollarSign, GraduationCap, Building, Filter } from "lucide-react"
import type { MedicalResidency, Contact, RegistryFilters } from "../types/residency"

interface EnhancedReportsProps {
  residencies: MedicalResidency[]
  contacts: Contact[]
  onGenerateReport: (config: any) => void
}

export default function EnhancedReports({ residencies, contacts, onGenerateReport }: EnhancedReportsProps) {
  const [filters, setFilters] = useState<RegistryFilters>({
    provinces: [],
    specialties: [],
    fundingSources: [],
    vacancyStatus: [],
    registryStatus: [],
    surveyStatus: [],
    verificationStatus: [],
  })

  const [reportConfig, setReportConfig] = useState({
    title: "",
    includeContacts: true,
    includeVacancies: true,
    includeFunding: true,
    includeNotes: false,
  })

  // Extract unique values for filters
  const uniqueProvinces = [...new Set(residencies.map((r) => r.province))].sort()
  const uniqueSpecialties = [...new Set(residencies.map((r) => r.specialty))].sort()
  const uniqueFundingSources = [...new Set(residencies.map((r) => r.fundingSource))]

  // Apply filters to residencies
  const filteredResidencies = useMemo(() => {
    return residencies.filter((residency) => {
      const provinceMatch = filters.provinces.length === 0 || filters.provinces.includes(residency.province)
      const specialtyMatch = filters.specialties.length === 0 || filters.specialties.includes(residency.specialty)
      const fundingMatch =
        filters.fundingSources.length === 0 || filters.fundingSources.includes(residency.fundingSource)
      const vacancyMatch = filters.vacancyStatus.length === 0 || filters.vacancyStatus.includes(residency.vacancyStatus)
      const registryMatch =
        filters.registryStatus.length === 0 || filters.registryStatus.includes(residency.registryStatus)
      const surveyMatch = filters.surveyStatus.length === 0 || filters.surveyStatus.includes(residency.surveyStatus)
      const hasVacanciesMatch =
        filters.hasVacancies === undefined ||
        (filters.hasVacancies ? residency.availableVacancies > 0 : residency.availableVacancies === 0)

      return (
        provinceMatch &&
        specialtyMatch &&
        fundingMatch &&
        vacancyMatch &&
        registryMatch &&
        surveyMatch &&
        hasVacanciesMatch
      )
    })
  }, [residencies, filters])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredResidencies.length
    const active = filteredResidencies.filter((r) => r.registryStatus === "active").length
    const totalVacancies = filteredResidencies.reduce((sum, r) => sum + r.availableVacancies, 0)
    const totalPositions = filteredResidencies.reduce((sum, r) => sum + r.totalPositions, 0)
    const withSalary = filteredResidencies.filter((r) => r.salary && r.salary > 0)
    const averageSalary =
      withSalary.length > 0 ? withSalary.reduce((sum, r) => sum + (r.salary || 0), 0) / withSalary.length : 0

    const byProvince = filteredResidencies.reduce(
      (acc, r) => {
        acc[r.province] = (acc[r.province] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const bySpecialty = filteredResidencies.reduce(
      (acc, r) => {
        acc[r.specialty] = (acc[r.specialty] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const byFunding = filteredResidencies.reduce(
      (acc, r) => {
        acc[r.fundingSource] = (acc[r.fundingSource] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const byVacancyStatus = filteredResidencies.reduce(
      (acc, r) => {
        acc[r.vacancyStatus] = (acc[r.vacancyStatus] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const bySurveyStatus = filteredResidencies.reduce(
      (acc, r) => {
        acc[r.surveyStatus] = (acc[r.surveyStatus] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total,
      active,
      totalVacancies,
      totalPositions,
      averageSalary,
      byProvince,
      bySpecialty,
      byFunding,
      byVacancyStatus,
      bySurveyStatus,
    }
  }, [filteredResidencies])

  const handleFilterChange = (filterType: keyof RegistryFilters, value: string, checked: boolean) => {
    setFilters((prev) => {
      const currentValues = prev[filterType] as string[]
      if (checked) {
        return { ...prev, [filterType]: [...currentValues, value] }
      } else {
        return { ...prev, [filterType]: currentValues.filter((v) => v !== value) }
      }
    })
  }

  const clearFilters = () => {
    setFilters({
      provinces: [],
      specialties: [],
      fundingSources: [],
      vacancyStatus: [],
      registryStatus: [],
      surveyStatus: [],
      verificationStatus: [],
    })
  }

  const exportToCSV = () => {
    const headers = [
      "Nombre",
      "Hospital",
      "Provincia",
      "Ciudad",
      "Especialidad",
      "Duración",
      "Posiciones Totales",
      "Vacantes Disponibles",
      "Estado Vacantes",
      "Financiamiento",
      "Salario",
      "Estado Registro",
      "Estado Relevamiento",
    ]

    if (reportConfig.includeContacts) {
      headers.push("Contacto Principal", "Email Contacto", "Teléfono Contacto")
    }

    const csvData = [
      headers.join(","),
      ...filteredResidencies.map((r) => {
        const primaryContact = contacts.find((c) => c.residencyId === r.id && c.isPrimaryContact)
        const row = [
          r.name,
          r.hospital,
          r.province,
          r.city,
          r.specialty,
          r.duration.toString(),
          r.totalPositions.toString(),
          r.availableVacancies.toString(),
          r.vacancyStatus,
          r.fundingSource,
          r.salary?.toString() || "",
          r.registryStatus,
          r.surveyStatus,
        ]

        if (reportConfig.includeContacts) {
          row.push(primaryContact?.name || "", primaryContact?.email || "", primaryContact?.phone || "")
        }

        return row.map((field) => `"${field}"`).join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte-residencias-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generatePDFReport = () => {
    const reportData = {
      title: reportConfig.title || "Reporte de Residencias Médicas",
      filters,
      stats,
      residencies: filteredResidencies,
      contacts: reportConfig.includeContacts ? contacts : [],
      generatedAt: new Date(),
      config: reportConfig,
    }
    onGenerateReport(reportData)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reportes y Análisis</h2>
          <p className="text-gray-600">Análisis detallado del registro de residencias médicas</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="filters">Filtros Avanzados</TabsTrigger>
          <TabsTrigger value="analytics">Análisis Detallado</TabsTrigger>
          <TabsTrigger value="export">Exportar Datos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-gray-600">Total Residencias</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalVacancies}</p>
                    <p className="text-sm text-gray-600">Vacantes Disponibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.active}</p>
                    <p className="text-sm text-gray-600">Programas Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.averageSalary > 0 ? `$${Math.round(stats.averageSalary).toLocaleString()}` : "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">Salario Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Especialidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.bySpecialty)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([specialty, count]) => (
                      <div key={specialty} className="flex items-center justify-between">
                        <span className="text-sm">{specialty}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Provincia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byProvince)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([province, count]) => (
                      <div key={province} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{province}</span>
                          <span>{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="filters" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros Avanzados
                </CardTitle>
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar Filtros
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Province Filters */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Provincias</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uniqueProvinces.map((province) => (
                      <div key={province} className="flex items-center space-x-2">
                        <Checkbox
                          id={`province-${province}`}
                          checked={filters.provinces.includes(province)}
                          onCheckedChange={(checked) => handleFilterChange("provinces", province, checked as boolean)}
                        />
                        <Label htmlFor={`province-${province}`} className="text-sm">
                          {province} ({stats.byProvince[province] || 0})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specialty Filters */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Especialidades</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uniqueSpecialties.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox
                          id={`specialty-${specialty}`}
                          checked={filters.specialties.includes(specialty)}
                          onCheckedChange={(checked) =>
                            handleFilterChange("specialties", specialty, checked as boolean)
                          }
                        />
                        <Label htmlFor={`specialty-${specialty}`} className="text-sm">
                          {specialty} ({stats.bySpecialty[specialty] || 0})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Filters */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Estados</Label>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-gray-500 mb-2 block">Estado de Registro</Label>
                      <div className="space-y-2">
                        {["active", "inactive", "suspended", "under_review"].map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`registry-${status}`}
                              checked={filters.registryStatus.includes(status)}
                              onCheckedChange={(checked) =>
                                handleFilterChange("registryStatus", status, checked as boolean)
                              }
                            />
                            <Label htmlFor={`registry-${status}`} className="text-sm capitalize">
                              {status.replace("_", " ")}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500 mb-2 block">Estado de Vacantes</Label>
                      <div className="space-y-2">
                        {["open", "closed", "pending", "unknown"].map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`vacancy-${status}`}
                              checked={filters.vacancyStatus.includes(status)}
                              onCheckedChange={(checked) =>
                                handleFilterChange("vacancyStatus", status, checked as boolean)
                              }
                            />
                            <Label htmlFor={`vacancy-${status}`} className="text-sm capitalize">
                              {status}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredResidencies.length} de {residencies.length} residencias
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Financiamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.byFunding).map(([funding, count]) => (
                    <div key={funding} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm capitalize">{funding}</span>
                        <span className="text-sm font-medium">
                          {count} ({Math.round((count / stats.total) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado del Relevamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.bySurveyStatus).map(([status, count]) => (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm capitalize">{status.replace("_", " ")}</span>
                        <span className="text-sm font-medium">
                          {count} ({Math.round((count / stats.total) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Vacantes por Provincia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Provincia</th>
                      <th className="text-right p-2">Residencias</th>
                      <th className="text-right p-2">Posiciones Totales</th>
                      <th className="text-right p-2">Vacantes Disponibles</th>
                      <th className="text-right p-2">% Ocupación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.byProvince)
                      .sort(([, a], [, b]) => b - a)
                      .map(([province, count]) => {
                        const provinceResidencies = filteredResidencies.filter((r) => r.province === province)
                        const totalPositions = provinceResidencies.reduce((sum, r) => sum + r.totalPositions, 0)
                        const availableVacancies = provinceResidencies.reduce((sum, r) => sum + r.availableVacancies, 0)
                        const occupationRate =
                          totalPositions > 0 ? ((totalPositions - availableVacancies) / totalPositions) * 100 : 0

                        return (
                          <tr key={province} className="border-b">
                            <td className="p-2 font-medium">{province}</td>
                            <td className="p-2 text-right">{count}</td>
                            <td className="p-2 text-right">{totalPositions}</td>
                            <td className="p-2 text-right">{availableVacancies}</td>
                            <td className="p-2 text-right">{Math.round(occupationRate)}%</td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Exportación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reportTitle">Título del Reporte</Label>
                <Input
                  id="reportTitle"
                  value={reportConfig.title}
                  onChange={(e) => setReportConfig({ ...reportConfig, title: e.target.value })}
                  placeholder="ej. Reporte Mensual de Residencias Médicas"
                />
              </div>

              <div className="space-y-3">
                <Label>Incluir en el Reporte:</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeContacts"
                      checked={reportConfig.includeContacts}
                      onCheckedChange={(checked) =>
                        setReportConfig({ ...reportConfig, includeContacts: checked as boolean })
                      }
                    />
                    <Label htmlFor="includeContacts">Información de Contactos</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeVacancies"
                      checked={reportConfig.includeVacancies}
                      onCheckedChange={(checked) =>
                        setReportConfig({ ...reportConfig, includeVacancies: checked as boolean })
                      }
                    />
                    <Label htmlFor="includeVacancies">Detalles de Vacantes</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeFunding"
                      checked={reportConfig.includeFunding}
                      onCheckedChange={(checked) =>
                        setReportConfig({ ...reportConfig, includeFunding: checked as boolean })
                      }
                    />
                    <Label htmlFor="includeFunding">Información de Financiamiento</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeNotes"
                      checked={reportConfig.includeNotes}
                      onCheckedChange={(checked) =>
                        setReportConfig({ ...reportConfig, includeNotes: checked as boolean })
                      }
                    />
                    <Label htmlFor="includeNotes">Notas y Observaciones</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={exportToCSV} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
                <Button
                  onClick={generatePDFReport}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <FileText className="w-4 h-4" />
                  Generar Reporte PDF
                </Button>
              </div>

              <div className="text-sm text-gray-600 pt-2">
                <p>El reporte incluirá {filteredResidencies.length} residencias basadas en los filtros aplicados.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
