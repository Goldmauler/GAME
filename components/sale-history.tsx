"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, History, TrendingUp, TrendingDown, Users, DollarSign, Filter } from "lucide-react"

interface SaleHistoryItem {
  playerName: string
  playerRole: string
  teamName: string | null
  teamId: string | null
  price: number | null
  basePrice: number
  round: number
  category: string
  timestamp: string
  status: 'sold' | 'unsold'
}

interface SaleHistoryProps {
  saleHistory: SaleHistoryItem[]
  isOpen: boolean
  onClose: () => void
}

export default function SaleHistory({ saleHistory, isOpen, onClose }: SaleHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'sold' | 'unsold'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'price' | 'name'>('recent')

  const getRoleColor = (role: string) => {
    const roleLower = role.toLowerCase()
    if (roleLower.includes('batsman') || roleLower.includes('batter')) return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    if (roleLower.includes('bowler')) return "bg-red-500/20 text-red-400 border-red-500/30"
    if (roleLower.includes('all-rounder') || roleLower.includes('allrounder')) return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    if (roleLower.includes('keeper')) return "bg-green-500/20 text-green-400 border-green-500/30"
    return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  const filteredHistory = saleHistory.filter(item => {
    if (filter === 'all') return true
    return item.status === filter
  })

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    } else if (sortBy === 'price') {
      const priceA = a.price || 0
      const priceB = b.price || 0
      return priceB - priceA
    } else {
      return a.playerName.localeCompare(b.playerName)
    }
  })

  const stats = {
    total: saleHistory.length,
    sold: saleHistory.filter(s => s.status === 'sold').length,
    unsold: saleHistory.filter(s => s.status === 'unsold').length,
    totalSpent: saleHistory.reduce((sum, s) => sum + (s.price || 0), 0),
    avgPrice: saleHistory.filter(s => s.status === 'sold').length > 0
      ? saleHistory.reduce((sum, s) => sum + (s.price || 0), 0) / saleHistory.filter(s => s.status === 'sold').length
      : 0
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-4 sm:inset-8 md:inset-16 z-50 flex items-center justify-center"
          >
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-slate-700 p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <History className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">Sale History</h2>
                    <p className="text-sm text-gray-400">Complete auction transaction log</p>
                  </div>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-red-500/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Stats Bar */}
              <div className="bg-slate-900/50 border-b border-slate-700 p-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                    <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-green-400">Sold</p>
                    <p className="text-xl font-bold text-green-400">{stats.sold}</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                    <TrendingDown className="w-4 h-4 text-red-400 mx-auto mb-1" />
                    <p className="text-xs text-red-400">Unsold</p>
                    <p className="text-xl font-bold text-red-400">{stats.unsold}</p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
                    <DollarSign className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                    <p className="text-xs text-orange-400">Total Spent</p>
                    <p className="text-xl font-bold text-orange-400">₹{stats.totalSpent.toFixed(1)}</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                    <DollarSign className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <p className="text-xs text-blue-400">Avg Price</p>
                    <p className="text-xl font-bold text-blue-400">₹{stats.avgPrice.toFixed(1)}</p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-slate-900/30 border-b border-slate-700 p-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Filter:</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={filter === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilter('all')}
                      className={filter === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >
                      All
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === 'sold' ? 'default' : 'outline'}
                      onClick={() => setFilter('sold')}
                      className={filter === 'sold' ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      Sold
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === 'unsold' ? 'default' : 'outline'}
                      onClick={() => setFilter('unsold')}
                      className={filter === 'unsold' ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                      Unsold
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Sort:</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={sortBy === 'recent' ? 'default' : 'outline'}
                      onClick={() => setSortBy('recent')}
                      className={sortBy === 'recent' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >
                      Recent
                    </Button>
                    <Button
                      size="sm"
                      variant={sortBy === 'price' ? 'default' : 'outline'}
                      onClick={() => setSortBy('price')}
                      className={sortBy === 'price' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >
                      Price
                    </Button>
                    <Button
                      size="sm"
                      variant={sortBy === 'name' ? 'default' : 'outline'}
                      onClick={() => setSortBy('name')}
                      className={sortBy === 'name' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >
                      Name
                    </Button>
                  </div>
                </div>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {sortedHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No sale history yet</p>
                    <p className="text-gray-500 text-sm mt-2">Players will appear here as they are sold or marked unsold</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedHistory.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <Card className={`p-4 ${
                          item.status === 'sold'
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-white font-bold text-lg">{item.playerName}</h3>
                                <Badge className={`${getRoleColor(item.playerRole)} border text-xs`}>
                                  {item.playerRole}
                                </Badge>
                                <Badge className={`text-xs ${
                                  item.status === 'sold'
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}>
                                  {item.status.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Round {item.round}
                                </Badge>
                              </div>
                              {item.teamName && (
                                <p className="text-sm text-gray-300">
                                  <span className="text-gray-500">Bought by:</span> {item.teamName}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(item.timestamp).toLocaleString()}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              {item.status === 'sold' && item.price !== null ? (
                                <>
                                  <p className="text-2xl font-black text-green-400">₹{item.price}Cr</p>
                                  <p className="text-xs text-gray-500">Base: ₹{item.basePrice}Cr</p>
                                  {item.price > item.basePrice && (
                                    <p className="text-xs text-green-400 mt-1">
                                      +₹{(item.price - item.basePrice).toFixed(1)}Cr 
                                      ({(((item.price - item.basePrice) / item.basePrice) * 100).toFixed(0)}%)
                                    </p>
                                  )}
                                </>
                              ) : (
                                <>
                                  <p className="text-xl font-bold text-red-400">UNSOLD</p>
                                  <p className="text-xs text-gray-500">Base: ₹{item.basePrice}Cr</p>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Custom Scrollbar Styles */}
          <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(71, 85, 105, 0.2);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #f97316, #ea580c);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #ea580c, #dc2626);
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  )
}
