import { useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import PolylineIcon from '@mui/icons-material/Polyline'
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Typography,
} from '@mui/material'

const NAV_ICON_SX = { fontSize: '0.75rem', fontWeight: 700, color: '#1F2A44' }

interface DiagramEntry {
  button_display: string
  image: string
  title: string
}

interface DiagramSpeedDialProps {
  diagrams: DiagramEntry[]
}

export default function DiagramSpeedDial({ diagrams }: DiagramSpeedDialProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<DiagramEntry | null>(null)

  const handleActionClick = (diagram: DiagramEntry) => {
    setSelected(diagram)
    setOpen(false)
  }

  const handleClose = () => setSelected(null)

  return (
    <>
      <SpeedDial
        ariaLabel="Diagram menu"
        icon={<SpeedDialIcon icon={<PolylineIcon />} />}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        open={open}
        direction="up"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          '& .MuiSpeedDial-fab': {
            backgroundColor: '#1F2A44',
            '&:hover': { backgroundColor: '#2F4A6D' },
          },
        }}
      >
        {diagrams.map((diagram, index) => (
          <SpeedDialAction
            key={diagram.image}
            icon={<Typography sx={NAV_ICON_SX}>{index + 1}</Typography>}
            tooltipTitle={diagram.button_display}
            tooltipOpen
            onClick={() => handleActionClick(diagram)}
            sx={{
              my: 0.5,
              '& .MuiSpeedDialAction-staticTooltipLabel': {
                whiteSpace: 'nowrap',
                fontSize: '0.7rem',
              },
            }}
          />
        ))}
      </SpeedDial>

      <Dialog
        open={!!selected}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { m: 2 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
            backgroundColor: '#1F2A44',
            color: '#fff',
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            {selected?.title}
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
          {selected && (
            <Box
              component="img"
              src={`/${selected.image}`}
              alt={selected.title}
              sx={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
