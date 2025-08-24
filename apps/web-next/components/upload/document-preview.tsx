"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Edit3, Check, X } from "lucide-react"
import type { DocumentUploadResponse } from "@/lib/api"

interface DocumentPreviewProps {
  documentData: DocumentUploadResponse
  onFieldUpdate: (field: string, value: any) => void
  onConsent: (consented: boolean) => void
  hasConsented: boolean
}

export function DocumentPreview({ documentData, onFieldUpdate, onConsent, hasConsented }: DocumentPreviewProps) {
  const [maskedFields, setMaskedFields] = useState<Record<string, boolean>>({
    name: true,
    income: true,
    taxPaid: true,
  })
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, any>>({})

  const toggleMask = (field: string) => {
    setMaskedFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const startEditing = (field: string, currentValue: any) => {
    setEditingField(field)
    setEditValues({ ...editValues, [field]: currentValue })
  }

  const saveEdit = (field: string) => {
    onFieldUpdate(field, editValues[field])
    setEditingField(null)
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValues({})
  }

  const maskValue = (value: any, field: string) => {
    if (!maskedFields[field]) return value

    if (typeof value === "string") {
      return "*".repeat(Math.min(value.length, 8))
    }
    if (typeof value === "number") {
      return "****"
    }
    return "****"
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-500"
    if (confidence >= 0.7) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Analysis Results</CardTitle>
          <CardDescription>Review the extracted information and make any necessary corrections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(documentData.extracted_fields).map(([field, value]) => {
            const confidence = documentData.confidence[field] || 0
            const isEditing = editingField === field

            return (
              <div key={field} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label className="capitalize font-medium">{field.replace(/([A-Z])/g, " $1")}</Label>
                    <Badge variant="outline" className="text-xs">
                      <div className={cn("w-2 h-2 rounded-full mr-1", getConfidenceColor(confidence))} />
                      {Math.round(confidence * 100)}% confident
                    </Badge>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={editValues[field] || ""}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [field]: typeof value === "number" ? Number(e.target.value) : e.target.value,
                          })
                        }
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => saveEdit(field)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">{maskValue(value, field)}</span>
                      <Button size="sm" variant="ghost" onClick={() => toggleMask(field)} className="h-6 w-6 p-0">
                        {maskedFields[field] ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(field, value)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox id="consent" checked={hasConsented} onCheckedChange={onConsent} />
            <div className="space-y-1">
              <Label
                htmlFor="consent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I consent to processing this information
              </Label>
              <p className="text-sm text-muted-foreground">
                I understand that this information will be used to generate zero-knowledge proofs and will not be stored
                permanently on any server.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
