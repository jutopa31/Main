"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, BarChart3, Users, MapPin, Calendar } from "lucide-react"
import type { MedicalResidency } from "../types/residency"

interface SurveyReportsProps {
  residencies: MedicalResidency[]
  onGenerateReport: (config: any) => void
}

export default function SurveyReports({ residencies, onGenerateReport }: SurveyReportsProps) {
  const [reportConfig, setReportConfig] = useState({
    title: "",
    provinces: [] as string[],
    specialties: [] as string[],
    status: "all",
  })

  const provinces = [...new Set(residencies.map((r) => r.province))]
  const specialties = [...new Set(residencies.map((r) => r.specialty))]

  const getFilteredResidencies = () => {
    return residencies.filter((r) => {
      const provinceMatch = reportConfig.provinces.length === 0 || reportConfig.provinces.includes(r.province)
      const specialtyMatch = reportConfig.specialties.length === 0 || reportConfig.specialties.includes(r.specialty)
      const statusMatch = reportConfig.status === "all" || r.status === reportConfig.status
      return provinceMatch && specialtyMatch && statusMatch
    })
  }

  const filteredResidencies = getFilteredResidencies()

  const stats = {
    total: filteredResidencies.length,
    pending: filteredResidencies.filter((r) => r.status === "pending").length,
    contacted: filteredResidencies.filter((r) => r.status === "contacted").length,
    visited: filteredResidencies.filter((r) => r.status === "visited").length,
    completed: filteredResidencies.filter((r) => r.status === "completed").length,
  }

  const specialtyStats = specialties
    .map((specialty) => ({
      name: specialty,
      count: filteredResidencies.filter((r) => r.specialty === specialty).length,
    }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)

  const provinceStats = provinces
    .map((province) => ({
      name: province,
      count: filteredResidencies.filter((r) => r.province === province).length,
      completed: filteredResidencies.filter((r) => r.province === province && r.status === "completed").length,
    }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count)

  const handleGenerateReport = () => {
    const report = {
      ...reportConfig,
      summary: stats,
      residencies: filteredResidencies,
      specialtyBreakdown: specialtyStats,
      provinceBreakdown: provinceStats,
      generatedAt: new Date(),
    }
    onGenerateReport(report)
  }

  const exportToCSV = () => {
    const headers = [
      "Nombre",
      "Hospital",
      "Provincia",
      "Ciudad",
      "Especialidad",
      "Estado",
      "Contacto",
      "Email",
      "Teléfono",
    ]
    const csvData = [
      headers.join(","),
      ...filteredResidencies.map((r) =>
        [
          r.name,
          r.hospital,
          r.province,
          r.city,
          r.specialty,
          r.status,
          r.contact.name,
          r.contact.email,
          r.contact.phone,
        ]
          .map((field) => `"${field}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relevamiento-residencias-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Configuración de Reporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Título del reporte"
            value={reportConfig.title}
            onChange={(e) => setReportConfig({ ...reportConfig, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Provincias</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar provincias" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select
                value={reportConfig.status}
                onValueChange={(value) => setReportConfig({ ...reportConfig, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="contacted">Contactados</SelectItem>
                  <SelectItem value="visited">Visitados</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerateReport}>
              <FileText className="w-4 h-4 mr-2" />
              Generar Reporte
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
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
              <Calendar className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-gray-600">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.visited}</p>
                <p className="text-sm text-gray-600">Visitadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Residencias por Especialidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {specialtyStats.slice(0, 10).map((specialty, index) => (
                <div key={specialty.name} className="flex items-center justify-between">
                  <span className="text-sm">{specialty.name}</span>
                  <Badge variant="secondary">{specialty.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progreso por Provincia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {provinceStats.slice(0, 10).map((province) => (
                <div key={province.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{province.name}</span>
                    <span>
                      {province.completed}/{province.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(province.completed / province.count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
