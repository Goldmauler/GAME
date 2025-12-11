"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import type { TeamRating } from "@/lib/team-rating"

interface AIInsightsProps {
  rating: TeamRating
}

export default function AIInsights({ rating }: AIInsightsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("insights")

  const sections = [
    { id: "insights", label: "Key Insights", items: rating.insights, icon: "*", color: "blue" },
    { id: "strengths", label: "Strengths", items: rating.strengths, icon: "+", color: "green" },
    { id: "weaknesses", label: "Weaknesses", items: rating.weaknesses, icon: "-", color: "red" },
    { id: "recommendations", label: "Recommendations", items: rating.recommendations, icon: ">", color: "orange" },
  ]

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-${section.color}-500/10 border border-${section.color}-500/30 rounded-lg overflow-hidden`}
        >
          <button
            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{section.icon}</span>
              <span className={`font-bold text-${section.color}-400`}>{section.label}</span>
            </div>
            <motion.span
              animate={{ rotate: expandedSection === section.id ? 180 : 0 }}
              className={`text-${section.color}-400`}
            >
              ▼
            </motion.span>
          </button>

          <AnimatePresence>
            {expandedSection === section.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`border-t border-${section.color}-500/20 px-4 py-3 space-y-2`}
              >
                {section.items.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-start gap-2 text-${section.color}-300 text-sm`}
                  >
                    <span
                      className="w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `rgb(var(--color-${section.color}-400))` }}
                    ></span>
                    <p>{item}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}
