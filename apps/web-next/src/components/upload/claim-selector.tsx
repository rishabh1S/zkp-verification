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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

export interface Claim {
  id: string;
  type: string;
  label: string;
  threshold: number;
  operator: "gte" | "lte" | "eq";
  field: string;
}

interface ClaimSelectorProps {
  extractedFields: Record<string, any>;
  selectedClaims: Claim[];
  onClaimsChange: (claims: Claim[]) => void;
}

const presetClaims = [
  {
    id: "age_18",
    type: "age_verification",
    label: "Age ≥ 18 years",
    threshold: 18,
    operator: "gte" as const,
    field: "dobPreview",
    description: "Prove you are 18 years or older",
  },
  {
    id: "age_21",
    type: "age_verification",
    label: "Age ≥ 21 years",
    threshold: 21,
    operator: "gte" as const,
    field: "dobPreview",
    description: "Prove you are 21 years or older",
  },
  {
    id: "income_10l",
    type: "income_verification",
    label: "Income ≥ ₹10,00,000",
    threshold: 1000000,
    operator: "gte" as const,
    field: "income",
    description: "Prove annual income is 10 lakhs or more",
  },
  {
    id: "tax_1l",
    type: "tax_verification",
    label: "Tax Paid ≥ ₹1,00,000",
    threshold: 100000,
    operator: "gte" as const,
    field: "taxPaid",
    description: "Prove tax paid is 1 lakh or more",
  },
];

export function ClaimSelector({
  extractedFields,
  selectedClaims,
  onClaimsChange,
}: Readonly<ClaimSelectorProps>) {
  const [customClaim, setCustomClaim] = useState({
    label: "",
    field: "",
    operator: "gte" as const,
    threshold: 0,
  });
  const [showCustomForm, setShowCustomForm] = useState(false);

  const availableFields = Object.keys(extractedFields).filter(
    (field) => typeof extractedFields[field] === "number"
  );

  const togglePresetClaim = (preset: any) => {
    const exists = selectedClaims.find((c) => c.id === preset.id);
    if (exists) {
      onClaimsChange(selectedClaims.filter((c) => c.id !== preset.id));
    } else {
      // Check if the required field exists
      if (!extractedFields[preset.field]) {
        return; // Can't add claim without required field
      }
      onClaimsChange([...selectedClaims, { ...preset }]);
    }
  };

  const addCustomClaim = () => {
    if (!customClaim.label || !customClaim.field) return;

    const newClaim: Claim = {
      id: `custom_${Date.now()}`,
      type: "custom_verification",
      label: customClaim.label,
      threshold: customClaim.threshold,
      operator: customClaim.operator,
      field: customClaim.field,
    };

    onClaimsChange([...selectedClaims, newClaim]);
    setCustomClaim({ label: "", field: "", operator: "gte", threshold: 0 });
    setShowCustomForm(false);
  };

  const removeClaim = (claimId: string) => {
    onClaimsChange(selectedClaims.filter((c) => c.id !== claimId));
  };

  const canAddPreset = (preset: any) => {
    return extractedFields[preset.field] !== undefined;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Claims to Prove</CardTitle>
          <CardDescription>
            Choose which eligibility requirements you want to prove with your
            document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {presetClaims.map((preset) => {
              const isSelected = selectedClaims.some((c) => c.id === preset.id);
              const canAdd = canAddPreset(preset);

              return (
                <div
                  key={preset.id}
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-lg transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border",
                    !canAdd && "opacity-50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => togglePresetClaim(preset)}
                      disabled={!canAdd}
                    />
                    <div>
                      <p className="font-medium">{preset.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {preset.description}
                      </p>
                      {!canAdd && (
                        <Badge variant="secondary" className="mt-1">
                          Required field not found
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedClaims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedClaims.map((claim) => (
                <Badge
                  key={claim.id}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  {claim.label}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeClaim(claim.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Custom Claim</CardTitle>
          <CardDescription>Create a custom eligibility claim</CardDescription>
        </CardHeader>
        <CardContent>
          {!showCustomForm ? (
            <Button variant="outline" onClick={() => setShowCustomForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Claim
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Claim Label</Label>
                  <Input
                    placeholder="e.g., High Income Earner"
                    value={customClaim.label}
                    onChange={(e) =>
                      setCustomClaim({ ...customClaim, label: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Field</Label>
                  <Select
                    value={customClaim.field}
                    onValueChange={(value) =>
                      setCustomClaim({ ...customClaim, field: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field.replace(/([A-Z])/g, " $1")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Select
                    value={customClaim.operator}
                    onValueChange={(value: "gte" | "lte" | "eq") =>
                      setCustomClaim({ ...customClaim, operator: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gte">
                        Greater than or equal (≥)
                      </SelectItem>
                      <SelectItem value="lte">
                        Less than or equal (≤)
                      </SelectItem>
                      <SelectItem value="eq">Equal to (=)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Threshold</Label>
                  <Input
                    type="number"
                    placeholder="Enter threshold value"
                    value={customClaim.threshold}
                    onChange={(e) =>
                      setCustomClaim({
                        ...customClaim,
                        threshold: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={addCustomClaim}
                  disabled={!customClaim.label || !customClaim.field}
                >
                  Add Claim
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCustomForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
