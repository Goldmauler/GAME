"use client"

import { useCallback, useRef } from 'react'

export function useAuctionAudio() {
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

    const speak = useCallback((text: string, priority: 'high' | 'normal' = 'normal') => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return

        // Cancel current speech if high priority (like SOLD!)
        if (priority === 'high') {
            window.speechSynthesis.cancel()
        } else if (window.speechSynthesis.speaking) {
            // If something is already speaking and this is normal priority, maybe skip or queue
            // For fast bidding, we might want to skip outdated bid announcements
            return
        }

        const utterance = new SpeechSynthesisUtterance(text)

        // Pick a good voice if available
        const voices = window.speechSynthesis.getVoices()
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'))
        if (preferredVoice) utterance.voice = preferredVoice

        utterance.rate = 1.1 // Slightly faster
        utterance.pitch = 1.0
        utterance.volume = 0.8

        speechRef.current = utterance
        window.speechSynthesis.speak(utterance)
    }, [])

    const announceBid = useCallback((teamName: string, amount: number) => {
        speak(`${amount} Crores by ${teamName}`)
    }, [speak])

    const announceSold = useCallback((teamName: string, playerName: string, amount: number) => {
        speak(`Sold! ${playerName} to ${teamName} for ${amount} Crores!`, 'high')
    }, [speak])

    const announceUnsold = useCallback((playerName: string) => {
        speak(`${playerName} remains unsold.`, 'high')
    }, [speak])

    const announceNewPlayer = useCallback((playerName: string, role: string) => {
        speak(`Next player. ${playerName}. ${role}.`, 'normal')
    }, [speak])

    return {
        announceBid,
        announceSold,
        announceUnsold,
        announceNewPlayer
    }
}
