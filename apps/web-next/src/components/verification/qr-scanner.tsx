"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, X, Scan } from "lucide-react"

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // In a real implementation, you would use a QR code scanning library here
      // For now, we'll simulate scanning after a delay
      setTimeout(() => {
        // Mock QR scan result
        const mockQRData = JSON.stringify({
          id: "token_mock_scan",
          type: "eligibility_proof",
          claim: { type: "age_verification", verified: true },
          issuer: "ZKVerify",
          issued_at: new Date().toISOString(),
        })
        onScan(mockQRData)
        stopScanning()
      }, 3000)
    } catch (err) {
      setError("Failed to access camera. Please check permissions.")
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const handleClose = () => {
    stopScanning()
    onClose()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {!isScanning ? (
            <div className="text-center">
              <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center mb-4">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              <Button onClick={startScanning} className="w-full">
                <Scan className="mr-2 h-4 w-4" />
                Start Scanning
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto bg-black rounded-lg overflow-hidden mb-4">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-primary rounded-lg">
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Position the QR code within the frame</p>
              <Button variant="outline" onClick={stopScanning} className="w-full bg-transparent">
                Stop Scanning
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
