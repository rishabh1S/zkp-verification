"use client";

import { cn } from "@/lib/utils";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Edit3, Check, X } from "lucide-react";
import type { DocumentUploadResponse } from "@/lib/api";

interface DocumentPreviewProps {
  documentData: DocumentUploadResponse;
  onFieldUpdate: (field: string, value: any) => void;
  onConsent: (consented: boolean) => void;
  hasConsented: boolean;
}

export function DocumentPreview({
  documentData,
  onFieldUpdate,
  onConsent,
  hasConsented,
}: Readonly<DocumentPreviewProps>) {
  const [masked, setMasked] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    documentData.fields.dobPreview || ""
  );

  const toggleMask = () => setMasked((prev) => !prev);

  const startEditing = () => setIsEditing(true);

  const saveEdit = () => {
    onFieldUpdate("dobPreview", editValue);
    setIsEditing(false);
  };
  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue(documentData.fields.dobPreview || "");
  };

  const maskValue = (value: string | undefined) => {
    if (!value) return "";
    if (!masked) return value;
    return "*".repeat(Math.min(value.length, 8));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-500";
    if (confidence >= 0.7) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Analysis Results</CardTitle>
          <CardDescription>
            Review the extracted information and make any necessary corrections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-5 border rounded-lg">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <Label className="font-medium">Date of Birth</Label>
                <Badge variant="outline" className="text-xs">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mr-1",
                      getConfidenceColor(documentData.confidence)
                    )}
                  />
                  {Math.round(documentData.confidence * 100)}% confident
                </Badge>
              </div>

              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={saveEdit}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="font-mono">
                    {maskValue(documentData.fields.dobPreview)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMask}
                    className="h-6 w-6 p-0"
                  >
                    {masked ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={startEditing}
                    className="h-6 w-6 p-0"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="px-6 py-2 flex items-start space-x-3">
        <Checkbox
          id="consent"
          checked={hasConsented}
          onCheckedChange={onConsent}
        />
        <div className="space-y-1">
          <Label
            htmlFor="consent"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I consent to processing this information
          </Label>
          <p className="text-sm text-muted-foreground">
            I understand that this information will be used to generate
            zero-knowledge proofs and will not be stored permanently on any
            server.
          </p>
        </div>
      </div>
    </div>
  );
}
