import { Box } from '@mui/system'
import { StaticImageData } from 'next/image'

import KiboImage from '../KiboImage/KiboImage'
import Logo from '@/public/midpoint-logo.png'

interface KiboLogoProps {
  logo?: string | StaticImageData // URL or File
  alt?: string
  small?: boolean
}

const styles = {
  logoContainer: {
    width: {
      xs: 140,
      md: 220,
    },
    height: {
      xs: 48,
      md: 72,
    },
  },
  smallLogo: {
    width: 140,
    height: 48,
  },
}

const KiboLogo = ({ logo = Logo, alt = 'midpoint-logo', small }: KiboLogoProps) => {
  return (
    <Box sx={{ position: 'relative', ...(small ? styles.smallLogo : styles.logoContainer) }}>
      <KiboImage src={logo} alt={alt} fill loading="eager" />
    </Box>
  )
}

export default KiboLogo
