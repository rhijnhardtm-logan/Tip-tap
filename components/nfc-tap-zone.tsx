'use client'

import { useState, useEffect } from 'react'
import { Smartphone } from 'lucide-react'

interface NFCTapZoneProps {
  isActive?: boolean
  selectedAmount?: number | null
  onTap?: () => void
  isProcessing?: boolean
}

export function NFCTapZone({
  isActive = true,
  selectedAmount = null,
  onTap,
  isProcessing = false,
}: NFCTapZoneProps) {
  const [isFrozen, setIsFrozen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleTap = () => {
    if (!isActive || isFrozen || isProcessing) return

    setIsFrozen(true)
    onTap?.()

    // Start connection animation
    setTimeout(() => {
      setIsConnecting(true)
    }, 500)
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

      {/* Tap zone container */}
      <div
        onClick={handleTap}
        className={`relative w-full h-full max-w-md max-h-md flex items-center justify-center cursor-pointer transition-all ${
          isActive && !isFrozen ? 'hover:scale-105' : ''
        }`}
      >
        {/* Ring 1 - Outermost */}
        <div
          className={`absolute rounded-full border-2 transition-all ${
            isConnecting
              ? 'scale-75 border-primary opacity-0'
              : isFrozen
              ? 'animate-none'
              : selectedAmount
              ? 'animate-pulse-intense'
              : 'animate-pulse'
          } ${selectedAmount ? 'border-primary' : 'border-primary/60'}`}
          style={{
            width: '280px',
            height: '280px',
            animation:
              isConnecting && !isFrozen
                ? 'none'
                : isFrozen
                ? 'none'
                : selectedAmount
                ? 'pulse-intense 1s ease-in-out infinite'
                : 'pulse-ring 2s ease-in-out infinite',
          }}
        />

        {/* Ring 2 - Middle */}
        <div
          className={`absolute rounded-full border-2 transition-all ${
            isConnecting
              ? 'scale-75 border-primary opacity-0'
              : isFrozen
              ? 'animate-none'
              : selectedAmount
              ? 'animate-pulse-intense'
              : 'animate-pulse'
          } ${selectedAmount ? 'border-primary' : 'border-primary/40'}`}
          style={{
            width: '200px',
            height: '200px',
            animation:
              isConnecting && !isFrozen
                ? 'none'
                : isFrozen
                ? 'none'
                : selectedAmount
                ? 'pulse-intense 1s ease-in-out infinite 0.2s'
                : 'pulse-ring 2s ease-in-out infinite 0.4s',
          }}
        />

        {/* Ring 3 - Inner */}
        <div
          className={`absolute rounded-full border-2 transition-all ${
            isConnecting
              ? 'scale-75 border-primary opacity-0'
              : isFrozen
              ? 'animate-none'
              : selectedAmount
              ? 'animate-pulse-intense'
              : 'animate-pulse'
          } ${selectedAmount ? 'border-primary' : 'border-primary/20'}`}
          style={{
            width: '120px',
            height: '120px',
            animation:
              isConnecting && !isFrozen
                ? 'none'
                : isFrozen
                ? 'none'
                : selectedAmount
                ? 'pulse-intense 1s ease-in-out infinite 0.4s'
                : 'pulse-ring 2s ease-in-out infinite 0.8s',
          }}
        />

        {/* Center Icon */}
        <div
          className={`relative z-10 transition-all ${
            selectedAmount ? 'scale-110' : 'scale-100'
          } ${isConnecting ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        >
          <div className={`p-6 rounded-full ${selectedAmount ? 'bg-primary' : 'bg-primary/10'}`}>
            <Smartphone
              className={`w-16 h-16 ${
                selectedAmount ? 'text-white' : 'text-primary'
              } transition-colors`}
            />
          </div>
        </div>

        {/* Connection status text */}
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium text-foreground">Connecting...</p>
            </div>
          </div>
        )}

        {/* Info text */}
        {!isConnecting && (
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-sm text-muted-foreground">
              {selectedAmount ? 'Hold phone to complete payment' : 'Tap and hold to send tip'}
            </p>
          </div>
        )}
      </div>

      {/* Inline styles for animations */}
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        @keyframes pulse-intense {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-intense {
          animation: pulse-intense 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
