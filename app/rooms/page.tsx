"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import AuctionRoomApp from "@/components/auction-room-app"
import Header from "@/components/header"

export default function RoomPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground overflow-x-hidden">
      {/* Cricket-themed background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      </div>

      <Header gamePhase="auction" />

      <main className="relative z-10">
        <AuctionRoomApp />
      </main>
    </div>
  )
}
