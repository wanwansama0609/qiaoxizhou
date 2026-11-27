import TargetCursor from './reactbits/TargetCursor.jsx';
import { useMotionSettings } from './PortfolioMotion.jsx';

export default function PortfolioCursor({ disabled = false, container }) {
  const { reduced, finePointer } = useMotionSettings();
  if (disabled || reduced || !finePointer) return null;
  return <TargetCursor
    container={container}
    targetSelector={'a[href], button:not(:disabled):not([aria-disabled="true"]), [role="button"]:not([aria-disabled="true"])'}
    cursorColor="#d1acff" cursorColorOnTarget="#ff9de8"
    blendMode="normal" size={44} cornerSize={12} thickness={2.5}
    dotSize={6} padding={9} spinDuration={4} hoverDuration={0.2}
    parallaxOn={false} matchRadius showLabel={false} clickEffect
  />;
}
