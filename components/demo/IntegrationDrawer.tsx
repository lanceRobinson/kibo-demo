import { useCallback, useEffect, useRef, useState } from 'react'

import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'

type IntegrationPayload = {
  receivedAt: string
  payload: Record<string, unknown>
} | null

type Status = { erp: IntegrationPayload; wms: IntegrationPayload }

const POLL_INTERVAL = 3000

const sectionColors = {
  erp: { accent: '#1565C0', light: '#E3F2FD', label: 'ERP' },
  wms: { accent: '#2E7D32', light: '#E8F5E9', label: 'WMS' },
}

function PulsingDot({ active }: { active: boolean }) {
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: active ? '#4CAF50' : '#9E9E9E',
        boxShadow: active ? '0 0 0 0 rgba(76,175,80,0.4)' : 'none',
        animation: active ? 'pulse 1.4s ease-out 3' : 'none',
        '@keyframes pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(76,175,80,0.6)' },
          '70%': { boxShadow: '0 0 0 8px rgba(76,175,80,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(76,175,80,0)' },
        },
      }}
    />
  )
}

function PayloadSection({
  title,
  accent,
  light,
  data,
}: {
  title: string
  accent: string
  light: string
  data: IntegrationPayload
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <Box sx={{ mb: 1 }}>
      <Box
        onClick={() => setExpanded((v) => !v)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          backgroundColor: light,
          borderLeft: `4px solid ${accent}`,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PulsingDot active={!!data} />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: accent, fontSize: '0.8rem' }}
          >
            {title}
          </Typography>
          {data && (
            <Chip
              label="RECEIVED"
              size="small"
              sx={{
                height: 16,
                fontSize: '0.6rem',
                fontWeight: 700,
                backgroundColor: accent,
                color: '#fff',
                letterSpacing: '0.05em',
              }}
            />
          )}
        </Box>
        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.65rem' }}>
          {expanded ? '▲' : '▼'}
        </Typography>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ p: 1.5, backgroundColor: '#FAFAFA' }}>
          {data ? (
            <>
              <Typography
                variant="caption"
                sx={{ display: 'block', color: '#9E9E9E', mb: 0.5, fontSize: '0.65rem' }}
              >
                {new Date(data.receivedAt).toLocaleTimeString()}
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  backgroundColor: '#1E1E1E',
                  color: '#D4D4D4',
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  lineHeight: 1.6,
                  overflow: 'auto',
                  maxHeight: 280,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {JSON.stringify(data.payload, null, 2)}
              </Box>
            </>
          ) : (
            <Typography
              variant="caption"
              sx={{ color: '#BDBDBD', fontStyle: 'italic', fontSize: '0.72rem' }}
            >
              Waiting for {title} call…
            </Typography>
          )}
        </Box>
      </Collapse>
      <Divider />
    </Box>
  )
}

export default function IntegrationDrawer() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>({ erp: null, wms: null })
  const [hasActivity, setHasActivity] = useState(false)
  const prevStatus = useRef<Status>({ erp: null, wms: null })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/demo/integration-status')
      if (!res.ok) return
      const data: Status = await res.json()
      const prev = prevStatus.current
      if (
        (data.erp && !prev.erp) ||
        (data.wms && !prev.wms) ||
        data.erp?.receivedAt !== prev.erp?.receivedAt ||
        data.wms?.receivedAt !== prev.wms?.receivedAt
      ) {
        setHasActivity(true)
        setTimeout(() => setHasActivity(false), 5000)
      }
      prevStatus.current = data
      setStatus(data)
    } catch {
      // silently ignore poll errors
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchStatus])

  const handleClear = async () => {
    await fetch('/api/demo/integration-clear', { method: 'DELETE' })
    const cleared: Status = { erp: null, wms: null }
    prevStatus.current = cleared
    setStatus(cleared)
    setHasActivity(false)
  }

  return (
    <>
      {/* Vertical tab on right edge */}
      <Box
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          right: 0,
          bottom: 160,
          zIndex: 1200,
          backgroundColor: '#1F2A44',
          color: '#fff',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          px: 0.75,
          py: 1.5,
          borderRadius: '6px 0 0 6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          boxShadow: '-2px 0 8px rgba(0,0,0,0.2)',
          '&:hover': { backgroundColor: '#2F4A6D' },
          userSelect: 'none',
        }}
      >
        {hasActivity && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#4CAF50',
              animation: 'tabPulse 1s ease-in-out infinite',
              '@keyframes tabPulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.3 },
              },
            }}
          />
        )}
        <Typography
          sx={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#fff',
            lineHeight: 1,
          }}
        >
          INTEGRATIONS
        </Typography>
      </Box>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 400,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: '#1F2A44',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
              Integration Showcase
            </Typography>
            <Chip
              label="LIVE"
              size="small"
              sx={{
                height: 16,
                fontSize: '0.6rem',
                fontWeight: 700,
                backgroundColor: '#4CAF50',
                color: '#fff',
                letterSpacing: '0.08em',
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Clear all payloads">
              <Button
                size="small"
                onClick={handleClear}
                sx={{
                  color: '#90CAF9',
                  fontSize: '0.65rem',
                  textTransform: 'none',
                  minWidth: 0,
                  px: 1,
                }}
              >
                Clear
              </Button>
            </Tooltip>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
              <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>✕</Typography>
            </IconButton>
          </Box>
        </Box>

        {/* Subheader */}
        <Box sx={{ px: 2, py: 1, backgroundColor: '#F5F5F5', borderBottom: '1px solid #E0E0E0' }}>
          <Typography variant="caption" sx={{ color: '#757575', fontSize: '0.7rem' }}>
            Polling every {POLL_INTERVAL / 1000}s · Place an order to trigger integrations
          </Typography>
        </Box>

        {/* Sections */}
        <Box sx={{ flex: 1, overflow: 'auto', pt: 1 }}>
          <PayloadSection
            title={sectionColors.erp.label}
            accent={sectionColors.erp.accent}
            light={sectionColors.erp.light}
            data={status.erp}
          />
          <PayloadSection
            title={sectionColors.wms.label}
            accent={sectionColors.wms.accent}
            light={sectionColors.wms.light}
            data={status.wms}
          />
        </Box>
      </Drawer>
    </>
  )
}
