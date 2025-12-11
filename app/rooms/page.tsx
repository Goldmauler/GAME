"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy } from "lucide-react"
import AuctionRoomApp from "@/components/auction-room-app"

export default function RoomPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            size="sm"
            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Home
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-orange-500" />
            </div>
            <h1 className="font-bold text-lg text-orange-500">Multiplayer Rooms</h1>
          </div>
        </div>
      </div>

      <main className="relative z-10">
        <AuctionRoomApp />
      </main>
    </div>
  )
}
