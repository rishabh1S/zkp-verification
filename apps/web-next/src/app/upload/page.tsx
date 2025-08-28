"use client";

import { Badge } from "@/components/ui/badge";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Stepper } from "@/components/upload/stepper";
import { FileUpload } from "@/components/upload/file-upload";
import { DocumentPreview } from "@/components/upload/document-preview";
import { ClaimSelector, type Claim } from "@/components/upload/claim-selector";
import { useAuth } from "@/components/auth/auth-provider";
import { apiClient, type DocumentUploadResponse } from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const steps = [
  { id: 1, name: "Upload", description: "Upload your document" },
  { id: 2, name: "Review", description: "Review extracted data" },
  { id: 3, name: "Claims", description: "Select claims to prove" },
  { id: 4, name: "Generate", description: "Generate proof" },
];

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentData, setDocumentData] =
    useState<DocumentUploadResponse | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [selectedClaims, setSelectedClaims] = useState<Claim[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { walletSession } = useAuth();
  const router = useRouter();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setDocumentData(null);
    setCurrentStep(1);
    setCompletedSteps([]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await apiClient.uploadDocument(selectedFile);

      if (response.data) {
        setDocumentData(response.data);
        setUploadProgress(100);
        setCompletedSteps([1]);
        setCurrentStep(2);
        toast.success("Document processed successfully");
        console.log("Document upload successful:", response.data);
      } else {
        throw new Error(response.error || "Upload failed");
      }
    } catch (error) {
      console.error("Error processing document:", error);
      toast.error("Failed to process document");
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
    }
  };

  const handleFieldUpdate = (field: string, value: any) => {
    if (documentData) {
      setDocumentData({
        ...documentData,
        fields: {
          ...documentData.fields,
          [field]: value,
        },
      });
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedFile) {
      handleUpload();
    } else if (currentStep === 2 && hasConsented) {
      setCompletedSteps([...completedSteps, 2]);
      setCurrentStep(3);
    } else if (currentStep === 3 && selectedClaims.length > 0) {
      setCompletedSteps([...completedSteps, 3]);
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    // if (!documentData || !walletSession) return;
    if (!documentData) return;

    setIsGenerating(true);

    try {
      const response = await apiClient.generateProof({
        document_id: documentData.document_id,
        claim: selectedClaims,
        // wallet_address: walletSession.address,
        expires_in_days: 30,
      });

      if (response.data) {
        toast("Your proof is being generated");
        router.push(`/proofs/status/${response.data.job_id}`);
      } else {
        throw new Error(response.error || "Generation failed");
      }
    } catch (error) {
      console.error("Error generating proof:", error);
      toast.error("Failed to start proof generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedFile !== null;
      case 2:
        return hasConsented;
      case 3:
        return selectedClaims.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Generate Proof</h1>
            <p className="text-muted-foreground">
              Upload your document and create privacy-preserving eligibility
              proofs
            </p>
          </div>

          <Stepper
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />

          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].name}</CardTitle>
              <CardDescription>
                {steps[currentStep - 1].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <FileUpload
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  selectedFile={selectedFile}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                />
              )}

              {currentStep === 2 && documentData && (
                <DocumentPreview
                  documentData={documentData}
                  onFieldUpdate={handleFieldUpdate}
                  onConsent={setHasConsented}
                  hasConsented={hasConsented}
                />
              )}

              {currentStep === 3 && documentData && (
                <ClaimSelector
                  extractedFields={documentData.fields}
                  selectedClaims={selectedClaims}
                  onClaimsChange={setSelectedClaims}
                />
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Ready to Generate Proof
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Your proof will be generated for {selectedClaims.length}{" "}
                      claim(s)
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {selectedClaims.map((claim) => (
                        <Badge key={claim.id} variant="default">
                          {claim.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    size="lg"
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Proof...
                      </>
                    ) : (
                      "Generate Proof"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isUploading || isGenerating}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < 4 && (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isUploading}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
