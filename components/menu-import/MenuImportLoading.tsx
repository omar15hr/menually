"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import WandIcon from "../icons/WandIcon"
import Image from "next/image"

interface AIFileUploadProps {
  fileName?: string
  onCancel?: () => void
}

const AI_STATUS_MESSAGES = [
  "Analizando estructura del menú y detectando precios...",
  "Extrayendo información de productos...",
  "Identificando categorías del documento...",
  "Procesando imágenes y tablas...",
  "Validando datos extraídos...",
  "Organizando información del archivo...",
  "Aplicando modelo de IA para clasificación...",
  "Finalizando análisis del documento...",
]

export function MenuImportLoading({
  fileName = "nombre.pdf",
  onCancel
}: AIFileUploadProps) {
  const [progress, setProgress] = useState(0)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // AI status message rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) =>
        prev >= AI_STATUS_MESSAGES.length - 1 ? 0 : prev + 1
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto rounded-xl border border-[#E2E8F0] bg-card p-6 h-53">
      {/* AI Processing Badge */}
      <div className="mb-4 w-fit rounded-lg border border-[#CDF545]">
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8FFE1] px-4 py-2">
          <WandIcon />
          <h1 className="bg-[#009B2D] bg-clip-text text-transparent text-sm font-medium">
            Procesando con IA
          </h1>
        </div>
      </div>

      {/* File Info Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* PDF Icon */}
          <Image src="/images/pdf-image.png" alt="Imagen de icono pdf" width={30} height={30} />

          {/* File Name and Status */}
          <div className="flex flex-col text-sm">
            <span className="font-medium text-[#1C1C1C]">{fileName}</span>
            <span className="text-[#58606E]">
              El archivo se está subiendo
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Cancelar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#114821] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* AI Status Message */}
      <div className="mt-4 flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-foreground" />
        <span className="text-sm text-muted-foreground">
          {AI_STATUS_MESSAGES[currentMessageIndex]}
        </span>
      </div>
    </div>
  )
}
