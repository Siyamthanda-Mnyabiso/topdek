'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, Check, Download } from 'lucide-react'

interface ShareStoreCardProps {
    providerSlug: string
}

export function ShareStoreCard({ providerSlug }: ShareStoreCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [copied, setCopied] = useState(false)

    const shareUrl = `${window.location.origin}/professionals/${providerSlug}`

    useEffect(() => {
        if (!canvasRef.current) return

        void QRCode.toCanvas(canvasRef.current, shareUrl, {
            width: 200,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        })
    }, [shareUrl])

    function handleCopy() {
        void navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    function handleDownloadQR() {
        if (!canvasRef.current) return
        const link = document.createElement('a')
        link.download = 'topdeck-qr-code.png'
        link.href = canvasRef.current.toDataURL('image/png')
        link.click()
    }

    return (
        <div className="border border-black p-6">
            <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-black/40 mb-1">
                SHARE YOUR STORE
            </h2>
            <p className="text-sm text-black/50 mb-6">
                Let clients find you instantly via link or QR code.
            </p>

            <div className="flex flex-col sm:flex-row gap-8">

                {/* QR CODE */}
                <div className="shrink-0">
                    <div className="border border-black p-3 bg-white w-fit">
                        <canvas ref={canvasRef} />
                    </div>
                    <button
                        onClick={handleDownloadQR}
                        className="mt-3 flex items-center gap-1.5 text-xs font-bold tracking-[0.1em] uppercase text-black/50 hover:text-black transition-colors"
                    >
                        <Download className="h-3.5 w-3.5" />
                        DOWNLOAD QR
                    </button>
                </div>

                {/* LINK */}
                <div className="flex-1 flex flex-col justify-center">
                    <label className="text-xs font-bold tracking-[0.15em] uppercase text-black/40 mb-2">
                        YOUR PUBLIC LINK
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            readOnly
                            value={shareUrl}
                            className="flex-1 border border-black px-4 py-3 text-sm text-black/70 outline-none"
                        />
                        <button
                            onClick={handleCopy}
                            className={`shrink-0 border border-black px-4 py-3 text-xs font-bold tracking-[0.1em] uppercase transition-colors ${
                                copied ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
                            }`}
                        >
                            {copied ? (
                                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> COPIED
                </span>
                            ) : (
                                <span className="flex items-center gap-1.5">
                  <Copy className="h-3.5 w-3.5" /> COPY
                </span>
                            )}
                        </button>
                    </div>
                    <p className="mt-3 text-xs text-black/40 tracking-wide">
                        Share this on Instagram, WhatsApp, or print the QR code for your shop window.
                    </p>
                </div>
            </div>
        </div>
    )
}