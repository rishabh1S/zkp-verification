"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Navbar } from "@/components/layout/navbar";
import toast from "react-hot-toast";
import { CheckCircle, Download, QrCode, Wallet, ArrowLeft } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { ProofResponse } from "@/lib/api";

export default function ProofViewPage() {
  const params = useParams();
  const router = useRouter();
  const proofId = params.proofId as string;
  const [proofRes, setProofRes] = useState<ProofResponse | null>(null);
  const [showQr, setShowQr] = useState(false);

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!proofId) return;

    // Load proof from localStorage (set after generation)
    const stored = localStorage.getItem("lastGeneratedProof");
    if (stored) {
      setProofRes(JSON.parse(stored));
    } else {
      toast.error("No proof found");
      router.push("/upload");
    }
  }, [proofId, router]);

  const handleDownload = () => {
    if (!proofRes) return;

    const blob = new Blob([JSON.stringify(proofRes.token, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zkverify-proof-${proofId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadQr = () => {
    if (!qrCanvasRef.current) return;

    const url = qrCanvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `zkverify-proof-${proofId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!proofRes) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/upload">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Upload
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle>Proof Generated Successfully</CardTitle>
              <CardDescription>Your proof is ready to use</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Proof Details</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Claim:</span>{" "}
                    {proofRes.token.claim?.claimType} (≥{" "}
                    {proofRes.token.claim?.threshold})
                  </p>
                  <p>
                    <span className="font-medium">Issued:</span>{" "}
                    {new Date(proofRes.token.issued_on).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Expires:</span>{" "}
                    {new Date(proofRes.token.expires_on).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Verifier Contract:</span>{" "}
                    {proofRes.token.verifier_contract}
                  </p>
                  <p>
                    <span className="font-medium">Issuer:</span>{" "}
                    {proofRes.token.issuer}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => {}} className="flex-1">
                  <Wallet className="mr-2 h-4 w-4" />
                  Save to Wallet
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex-1 bg-transparent"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowQr(true)}
                  className="flex-1 bg-transparent"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Show QR
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showQr} onOpenChange={setShowQr}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Proof QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <QRCodeCanvas
              value={JSON.stringify(proofRes.token)}
              size={256}
              ref={qrCanvasRef}
            />
            <Button
              onClick={handleDownloadQr}
              variant="outline"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
