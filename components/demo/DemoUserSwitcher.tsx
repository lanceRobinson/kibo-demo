import { useState } from 'react'

import { Box, Button, ButtonGroup, Chip, CircularProgress, Typography } from '@mui/material'
import { useRouter } from 'next/router'

import { useAuthContext } from '@/context'

const DEMO_USERS = [
  { key: 'guest', label: 'Guest' },
  { key: 'tim', label: 'Tim Allen' },
  { key: 'jordan', label: 'Jordan Romero' },
]

export default function DemoUserSwitcher() {
  const { user, isAuthenticated } = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const activeKey = !isAuthenticated
    ? 'guest'
    : user?.firstName === 'Tim'
    ? 'tim'
    : user?.firstName === 'Jordan'
    ? 'jordan'
    : null

  const switchUser = async (userKey: string) => {
    if (userKey === activeKey || loading) return
    setLoading(userKey)
    try {
      await fetch('/api/demo/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userKey }),
      })
      router.reload()
    } catch {
      setLoading(null)
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 0.75,
      }}
    >
      <Chip
        label="DEMO"
        size="small"
        sx={{
          backgroundColor: '#F25C05',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.65rem',
          letterSpacing: '0.08em',
          height: 20,
        }}
      />
      <Box
        sx={{
          backgroundColor: '#fff',
          border: '2px solid #F25C05',
          borderRadius: 2,
          p: 1.5,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          minWidth: 180,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: '#5A6B7A', fontWeight: 600, letterSpacing: '0.05em' }}
        >
          Switch User
        </Typography>
        <ButtonGroup orientation="vertical" fullWidth size="small">
          {DEMO_USERS.map(({ key, label }) => {
            const isActive = key === activeKey
            const isLoading = loading === key
            return (
              <Button
                key={key}
                onClick={() => switchUser(key)}
                disabled={!!loading}
                sx={{
                  justifyContent: 'flex-start',
                  fontWeight: isActive ? 700 : 400,
                  backgroundColor: isActive ? '#1F2A44' : 'transparent',
                  color: isActive ? '#fff' : '#1F2A44',
                  borderColor: '#1F2A44 !important',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: isActive ? '#2F4A6D' : '#E6E9ED',
                  },
                }}
              >
                {isLoading ? <CircularProgress size={14} sx={{ mr: 1, color: 'inherit' }} /> : null}
                {label}
              </Button>
            )
          })}
        </ButtonGroup>
      </Box>
    </Box>
  )
}
