"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Save, Edit, Trash2, DollarSign, TrendingUp, Calendar, FileText, Download, MapPin } from "lucide-react"
import type { ResidentSalary, MedicalResidency } from "../types/residency"
import ResidencySearch from "./ui/residency-search"

interface ResidentSalaryManagementProps {
  residencies: MedicalResidency[]
  salaries: ResidentSalary[]
  onAddSalary: (salary: Omit<ResidentSalary, "id" | "createdAt" | "updatedAt">) => void
  onUpdateSalary: (id: string, updates: Partial<ResidentSalary>) => void
  onDeleteSalary: (id: string) => void
}

export default function ResidentSalaryManagement({
  residencies,
  salaries,
  onAddSalary,
  onUpdateSalary,
  onDeleteSalary,
}: ResidentSalaryManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterYear, setFilterYear] = useState("all")
  const [filterProvince, setFilterProvince] = useState("all")

  const [formData, setFormData] = useState<Partial<ResidentSalary>>({
    residencyId: "",
    year: "R1",
    grossSalary: 0,
    netSalary: 0,
    currency: "ARS",
    effectiveDate: new Date(),
    notes: "",
  })

  const filteredSalaries = salaries.filter((salary) => {
    const matchesSearch = !searchTerm || (() => {
      const residency = residencies.find(r => r.id === salary.residencyId)
      return residency && (
        residency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residency.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residency.province.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })()

    const matchesYear = filterYear === "all" || salary.year === filterYear
    const matchesProvince = filterProvince === "all" || (() => {
      const residency = residencies.find(r => r.id === salary.residencyId)
      return residency && residency.province === filterProvince
    })()

    return matchesSearch && matchesYear && matchesProvince
  })

  // Obtener provincias únicas de las residencias
  const getUniqueProvinces = () => {
    const provinces = new Set(residencies.map(r => r.province))
    return Array.from(provinces).sort()
  }

  // Obtener estadísticas por provincia
  const getProvinceStats = () => {
    const stats: Record<string, { total: number; byYear: Record<string, number> }> = {}
    
    getUniqueProvinces().forEach(province => {
      const provinceResidencies = residencies.filter(r => r.province === province)
      const provinceSalaries = salaries.filter(salary => {
        const residency = residencies.find(r => r.id === salary.residencyId)
        return residency && residency.province === province
      })
      
      stats[province] = {
        total: provinceSalaries.length,
        byYear: {
          R1: provinceSalaries.filter(s => s.year === "R1").length,
          R2: provinceSalaries.filter(s => s.year === "R2").length,
          R3: provinceSalaries.filter(s => s.year === "R3").length,
          R4: provinceSalaries.filter(s => s.year === "R4").length,
        }
      }
    })
    
    return stats
  }

  // Estadísticas por año de residencia
  const getSalaryStats = () => {
    const stats = {
      R1: { count: 0, avgGross: 0, avgNet: 0 },
      R2: { count: 0, avgGross: 0, avgNet: 0 },
      R3: { count: 0, avgGross: 0, avgNet: 0 },
      R4: { count: 0, avgGross: 0, avgNet: 0 },
    }

    salaries.forEach(salary => {
      if (stats[salary.year]) {
        stats[salary.year].count++
        stats[salary.year].avgGross += salary.grossSalary
        stats[salary.year].avgNet += salary.netSalary
      }
    })

    // Calcular promedios
    Object.keys(stats).forEach(year => {
      if (stats[year as keyof typeof stats].count > 0) {
        stats[year as keyof typeof stats].avgGross = Math.round(stats[year as keyof typeof stats].avgGross / stats[year as keyof typeof stats].count)
        stats[year as keyof typeof stats].avgNet = Math.round(stats[year as keyof typeof stats].avgNet / stats[year as keyof typeof stats].count)
      }
    })

    return stats
  }

  const handleSubmit = () => {
    if (editingId) {
      onUpdateSalary(editingId, formData)
      setEditingId(null)
    } else {
      onAddSalary(formData as Omit<ResidentSalary, "id" | "createdAt" | "updatedAt">)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      residencyId: "",
      year: "R1",
      grossSalary: 0,
      netSalary: 0,
      currency: "ARS",
      effectiveDate: new Date(),
      notes: "",
    })
    setShowAddForm(false)
    setEditingId(null)
  }

  const handleEdit = (salary: ResidentSalary) => {
    setFormData(salary)
    setEditingId(salary.id)
    setShowAddForm(true)
  }

  const getResidencyName = (residencyId: string) => {
    const residency = residencies.find((r) => r.id === residencyId)
    return residency ? `${residency.name} - ${residency.hospital}` : "Residencia no encontrada"
  }

  const getResidencyProvince = (residencyId: string) => {
    const residency = residencies.find((r) => r.id === residencyId)
    return residency ? residency.province : "Provincia no encontrada"
  }

  const getYearColor = (year: string) => {
    switch (year) {
      case "R1":
        return "bg-blue-500"
      case "R2":
        return "bg-green-500"
      case "R3":
        return "bg-yellow-500"
      case "R4":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const stats = getSalaryStats()

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Remuneraciones</h2>
          <p className="text-gray-600">Administra los salarios de los residentes por año</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {/* TODO: Implementar exportación */}}
            className="flex items-center gap-2"
            disabled={salaries.length === 0}
          >
            <FileText className="w-4 h-4" />
            Exportar
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Remuneración
          </Button>
        </div>
      </div>

      {/* Estadísticas por Año */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Estadísticas por Año de Residencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["R1", "R2", "R3", "R4"] as const).map(year => (
              <div key={year} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getYearColor(year)}>{year}</Badge>
                  <span className="text-sm text-gray-600">{stats[year].count} registros</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-500">Promedio Bruto</div>
                    <div className="font-bold text-blue-600">
                      {stats[year].avgGross > 0 ? formatCurrency(stats[year].avgGross, "ARS") : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Promedio Neto</div>
                    <div className="font-bold text-green-600">
                      {stats[year].avgNet > 0 ? formatCurrency(stats[year].avgNet, "ARS") : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas por Provincia */}
      {filterProvince === "all" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Estadísticas por Provincia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getUniqueProvinces().map(province => {
                const provinceStats = getProvinceStats()[province]
                if (!provinceStats || provinceStats.total === 0) return null
                
                return (
                  <div key={province} className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-2">{province}</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Total remuneraciones:</span>
                        <span className="font-bold text-blue-600">{provinceStats.total}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center">
                        <div>
                          <div className="font-bold text-blue-500">{provinceStats.byYear.R1}</div>
                          <div className="text-gray-500">R1</div>
                        </div>
                        <div>
                          <div className="font-bold text-green-500">{provinceStats.byYear.R2}</div>
                          <div className="text-gray-500">R2</div>
                        </div>
                        <div>
                          <div className="font-bold text-yellow-500">{provinceStats.byYear.R3}</div>
                          <div className="text-gray-500">R3</div>
                        </div>
                        <div>
                          <div className="font-bold text-purple-500">{provinceStats.byYear.R4}</div>
                          <div className="text-gray-500">R4</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Buscar por residencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los años</SelectItem>
                <SelectItem value="R1">R1 - Primer Año</SelectItem>
                <SelectItem value="R2">R2 - Segundo Año</SelectItem>
                <SelectItem value="R3">R3 - Tercer Año</SelectItem>
                <SelectItem value="R4">R4 - Cuarto Año</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterProvince} onValueChange={setFilterProvince}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por provincia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las provincias</SelectItem>
                {getUniqueProvinces().map(province => {
                  const stats = getProvinceStats()[province]
                  return (
                    <SelectItem key={province} value={province}>
                      {province} ({stats?.total || 0} remuneraciones)
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Información de filtros activos */}
          {(filterProvince !== "all" || filterYear !== "all" || searchTerm) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Filtros activos:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filterProvince !== "all" && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Provincia: {filterProvince}
                  </Badge>
                )}
                {filterYear !== "all" && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Año: {filterYear}
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    Búsqueda: "{searchTerm}"
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterProvince("all")
                    setFilterYear("all")
                    setSearchTerm("")
                  }}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto text-xs"
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar Remuneración" : "Nueva Remuneración"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="residencyId">Residencia *</Label>
                <ResidencySearch
                  residencies={residencies}
                  value={formData.residencyId || ""}
                  onValueChange={(value) => setFormData({ ...formData, residencyId: value })}
                  placeholder="Buscar residencia..."
                />
              </div>

              <div>
                <Label htmlFor="year">Año de Residencia *</Label>
                <Select
                  value={formData.year || "R1"}
                  onValueChange={(value) => setFormData({ ...formData, year: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="R1">R1 - Primer Año</SelectItem>
                    <SelectItem value="R2">R2 - Segundo Año</SelectItem>
                    <SelectItem value="R3">R3 - Tercer Año</SelectItem>
                    <SelectItem value="R4">R4 - Cuarto Año</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="grossSalary">Salario Bruto *</Label>
                <Input
                  id="grossSalary"
                  type="number"
                  value={formData.grossSalary || ""}
                  onChange={(e) => setFormData({ ...formData, grossSalary: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="netSalary">Salario Neto *</Label>
                <Input
                  id="netSalary"
                  type="number"
                  value={formData.netSalary || ""}
                  onChange={(e) => setFormData({ ...formData, netSalary: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  value={formData.currency || "ARS"}
                  onValueChange={(value) => setFormData({ ...formData, currency: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARS">Pesos Argentinos (ARS)</SelectItem>
                    <SelectItem value="USD">Dólares Estadounidenses (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="effectiveDate">Fecha Efectiva</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate ? new Date(formData.effectiveDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: new Date(e.target.value) })}
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Información adicional sobre la remuneración..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit}>
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Actualizar" : "Guardar"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Salaries List */}
      <div className="space-y-4">
        {filteredSalaries.map((salary) => (
          <Card key={salary.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{getResidencyName(salary.residencyId)}</h3>
                    <Badge className={getYearColor(salary.year)}>{salary.year}</Badge>
                    <Badge variant="outline">{salary.currency}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Bruto: {formatCurrency(salary.grossSalary, salary.currency)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Neto: {formatCurrency(salary.netSalary, salary.currency)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Efectivo: {new Date(salary.effectiveDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {salary.notes && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                      {salary.notes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(salary)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDeleteSalary(salary.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredSalaries.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron remuneraciones</p>
              <p className="text-sm">Agrega remuneraciones para comenzar a gestionar los salarios</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 