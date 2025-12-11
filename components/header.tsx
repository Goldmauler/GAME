"use client"

import Link from "next/link"
import { Trophy, Home, Users } from "lucide-react"
import MobileMenu from "./mobile-menu"

interface HeaderProps {
  gamePhase: string
  onReset?: () => void
}

export default function Header({ gamePhase, onReset }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 py-3">
      <div className="max-w-[1600px] mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-orange-500">IPL AUCTION</h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-3 items-center">
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors text-sm"
            >
              <Home className="h-4 w-4" />
              Menu
            </button>
          )}
          
          <Link 
            href="/teams"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors text-sm"
          >
            <Users className="h-4 w-4" />
            Teams
          </Link>
          
          <Link 
            href="/leaderboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors text-sm"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>
          
          <div className="flex gap-1 ml-2 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
            <span className={`px-2 py-1 rounded text-xs font-medium ${gamePhase === 'lobby' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500'}`}>
              Lobby
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${gamePhase === 'auction' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500'}`}>
              Auction
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${gamePhase === 'results' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500'}`}>
              Results
            </span>
          </div>
        </div>

        <MobileMenu onReset={onReset} />
      </div>
    </header>
  )
}
