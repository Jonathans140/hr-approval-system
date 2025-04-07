"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { SignaturePad } from "@/components/signature-pad"

export function RequestForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!signature) {
      toast({
        title: "Tanda tangan diperlukan",
        description: "Harap tambahkan tanda tangan Anda pada form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulasi pengiriman data
    try {
      // Di sini akan ada kode untuk mengirim data ke server
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Pengajuan berhasil dibuat",
        description: "Pengajuan Anda telah dikirim dan menunggu approval",
      })

      router.push("/requester")
    } catch (error) {
      toast({
        title: "Gagal membuat pengajuan",
        description: "Terjadi kesalahan saat membuat pengajuan",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Pengajuan</Label>
            <Input id="title" placeholder="Masukkan judul pengajuan" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Departemen</Label>
            <Select required>
              <SelectTrigger id="department">
                <SelectValue placeholder="Pilih departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="production">Produksi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" placeholder="Masukkan nama lengkap" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Posisi/Jabatan</Label>
            <Input id="position" placeholder="Masukkan posisi/jabatan" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi Pengajuan</Label>
          <Textarea id="description" placeholder="Jelaskan detail pengajuan Anda" className="min-h-[120px]" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signature">Tanda Tangan</Label>
          <SignaturePad onChange={setSignature} value={signature} />
          <p className="text-xs text-muted-foreground">Buat tanda tangan Anda dengan mouse atau sentuhan layar</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
        </Button>
      </div>
    </form>
  )
}

