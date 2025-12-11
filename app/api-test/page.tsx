"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function APITestPage() {
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [playerData, setPlayerData] = useState<any>(null)
  const [searchName, setSearchName] = useState("Virat Kohli")
  const [loading, setLoading] = useState(false)

  const testAPIKey = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/players', { method: 'POST' })
      const data = await response.json()
      setApiStatus(data)
    } catch (error) {
      setApiStatus({ error: 'Failed to connect' })
    }
    setLoading(false)
  }

  const searchPlayer = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/players?name=${encodeURIComponent(searchName)}`)
      const data = await response.json()
      setPlayerData(data)
    } catch (error) {
      setPlayerData({ error: 'Failed to fetch player data' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl"> Cricket API Test</CardTitle>
            <CardDescription>
              Test your Cricket API connection (API Key: 3a9d8ee5-d5fc-49a6-820e-f1b2422952a3)
            </CardDescription>
          </CardHeader>
        </Card>

        {/* API Status Test */}
        <Card>
          <CardHeader>
            <CardTitle>1. Test API Key Status</CardTitle>
            <CardDescription>Check if your API key is valid and see usage stats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testAPIKey} disabled={loading} className="w-full">
              {loading ? "Testing..." : "Test API Connection"}
            </Button>
            
            {apiStatus && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Status:</span>
                  {apiStatus.apiKeyValid ? (
                    <Badge className="bg-green-600">✓ Valid</Badge>
                  ) : (
                    <Badge variant="destructive">✗ Invalid</Badge>
                  )}
                </div>
                
                {apiStatus.info && (
                  <div className="space-y-1 text-sm">
                    <p>Hits Today: <strong>{apiStatus.info.hitsToday || 0}</strong> / {apiStatus.info.hitsLimit || 0}</p>
                    <p>Credits Remaining: <strong>{apiStatus.info.credits || 0}</strong></p>
                    <p>Server: <strong>#{apiStatus.info.server || 'N/A'}</strong></p>
                    <p>Total Rows: <strong>{apiStatus.info.totalRows || 0}</strong></p>
                  </div>
                )}
                
                {apiStatus.message && (
                  <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-400">
                    {apiStatus.message}
                  </p>
                )}
                
                {apiStatus.error && (
                  <p className="text-sm text-red-600 dark:text-red-400">{apiStatus.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Player Search Test */}
        <Card>
          <CardHeader>
            <CardTitle>2. Search Player Data</CardTitle>
            <CardDescription>Search for any cricket player by name</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchName(e.target.value)}
                placeholder="Enter player name..."
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && searchPlayer()}
              />
              <Button onClick={searchPlayer} disabled={loading || !searchName}>
                Search
              </Button>
            </div>

            {playerData && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg max-h-96 overflow-auto">
                {playerData.success ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-green-600">✓ Found {playerData.data?.length || 0} results</Badge>
                    </div>
                    
                    {playerData.data?.map((player: any, index: number) => (
                      <div key={index} className="mb-4 p-3 bg-white dark:bg-slate-900 rounded border">
                        <h3 className="font-bold text-lg">{player.name}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                          <p>Role: <strong>{player.playerRole || 'N/A'}</strong></p>
                          <p>Country: <strong>{player.country || 'N/A'}</strong></p>
                          <p>DOB: <strong>{player.dateOfBirth || 'N/A'}</strong></p>
                          <p>Birthplace: <strong>{player.placeOfBirth || 'N/A'}</strong></p>
                          {player.battingStyle && (
                            <p>Batting: <strong>{player.battingStyle}</strong></p>
                          )}
                          {player.bowlingStyle && (
                            <p>Bowling: <strong>{player.bowlingStyle}</strong></p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {playerData.info && (
                      <div className="text-xs text-muted-foreground mt-4">
                        Query time: {playerData.info.queryTime}ms | 
                        Server: #{playerData.info.server}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-red-600 dark:text-red-400">
                    {playerData.error || 'No results found'}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>3. Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
              Go to Main Auction
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/rooms'}>
              Go to Room-Based Auction
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
