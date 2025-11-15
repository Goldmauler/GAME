"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Trophy, Home, Menu, X, Users } from "lucide-react"

interface MobileMenuProps {
  onReset?: () => void
}

export default function MobileMenu({ onReset }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-500 hover:bg-orange-500/20 transition-all"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-slate-900 border-l border-orange-500/20 z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-orange-500/20">
                  <h2 className="font-bold text-orange-500 text-lg">Menu</h2>
                  <button
                    onClick={toggleMenu}
                    className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 p-4 space-y-2">
                  {onReset && (
                    <button
                      onClick={() => {
                        onReset()
                        toggleMenu()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <Home className="h-5 w-5" />
                      <span className="font-semibold">Back to Menu</span>
                    </button>
                  )}

                  <Link
                    href="/teams"
                    onClick={toggleMenu}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all"
                  >
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">Teams</span>
                  </Link>

                  <Link
                    href="/leaderboard"
                    onClick={toggleMenu}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20 transition-all"
                  >
                    <Trophy className="h-5 w-5" />
                    <span className="font-semibold">Leaderboard</span>
                  </Link>

                  <Link
                    href="/rooms"
                    onClick={toggleMenu}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-500 hover:bg-orange-500/20 transition-all"
                  >
                    <Home className="h-5 w-5" />
                    <span className="font-semibold">Home</span>
                  </Link>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-orange-500/20">
                  <p className="text-xs text-gray-500 text-center">
                    IPL Auction 2025
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
