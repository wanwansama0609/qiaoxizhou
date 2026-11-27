import { Component, Suspense, lazy, useEffect, useState } from 'react';
import AnimatedContent from './reactbits/AnimatedContent.jsx';
import SpotlightCard from './reactbits/SpotlightCard.jsx';
import TiltedCard from './reactbits/TiltedCard.jsx';
import ShinyText from './reactbits/ShinyText.jsx';
import GlareHover from './reactbits/GlareHover.jsx';
import './portfolio-motion.css';

export function useMotionSettings() {
  const read = () => ({
    reduced: typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    finePointer: typeof window !== 'undefined' && Boolean(window.matchMedia?.('(hover: hover) and (pointer: fine)').matches),
  });
  const [settings, setSettings] = useState(read);
  useEffect(() => {
    if (!window.matchMedia) return;
    const queries = ['(prefers-reduced-motion: reduce)', '(hover: hover) and (pointer: fine)'].map(query => window.matchMedia(query));
    const update = () => setSettings(read());
    queries.forEach(query => query.addEventListener?.('change', update));
    update();
    return () => queries.forEach(query => query.removeEventListener?.('change', update));
  }, []);
  return settings;
}

const Topography = lazy(() => import('./reactbits/Topography.jsx'));

class BackgroundBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export function HeroAtmosphere() {
  const { reduced, finePointer } = useMotionSettings();
  const supported = typeof window !== 'undefined' && typeof window.WebGL2RenderingContext !== 'undefined' && typeof window.ResizeObserver !== 'undefined';
  return <div className="hero-atmosphere" aria-hidden="true"><div className="hero-ambient-light" />{supported && finePointer && !reduced && <BackgroundBoundary><Suspense fallback={null}><Topography color="#b766dd" lineCount={22} lineWidth={1.2} speed={0.13} morph={0.15} glow={0.4} opacity={0.75} brightness={0.8} tilt={42} dpr={1} intro={false} mouseInteraction={false} clickEffect="none" parallax={0} className="hero-terrain" /></Suspense></BackgroundBoundary>}</div>;
}

export function AccentText({ text }) {
  const { reduced } = useMotionSettings();
  return <ShinyText text={text} color="#f36de0" shineColor="#fff0fc" speed={3.4} delay={2.6} shineWidth={45} glow={0} disabled={reduced} className="accent-shimmer" />;
}

export function CoverGlare({ children, className = '', glareOpacity = 0.22 }) {
  const { reduced, finePointer } = useMotionSettings();
  return <GlareHover className={className} width="100%" height="auto" borderRadius="0" glareColor="#f8d4ff" glareOpacity={glareOpacity} glareSize={45} softness={0.8} transitionDuration={850} mode="hover" rimGlint={false} disabled={reduced || !finePointer}>{children}</GlareHover>;
}

export function Reveal({ children, className = '', distance = 16, ...props }) {
  const { reduced } = useMotionSettings();
  return <AnimatedContent className={`motion-reveal ${className}`} distance={distance} duration={0.55} ease="power2.out" initialOpacity={0.25} threshold={0.08} once disabled={reduced} {...props}>{children}</AnimatedContent>;
}

export function HeroTilt({ children }) {
  const { reduced, finePointer } = useMotionSettings();
  return <div className="hero-project-slot" data-cursor-anchor><TiltedCard
    className="hero-project-motion" containerWidth="100%" containerHeight="auto" imageWidth="100%" imageHeight="auto"
    rotateAmplitude={0} scaleOnHover={1} perspective={1000} smoothness={0.35}
    glare={0.08} glareColor="#f6b3ed" shadow={0} parallax={0} radius={0}
    showTooltip={false} flipOnClick={false} gyroscope={false} intro={false} floating={false}
    disabled={reduced || !finePointer}
  >{children}</TiltedCard></div>;
}

export function SkillSpotlight({ children, className = '', ...props }) {
  const { reduced, finePointer } = useMotionSettings();
  return <SpotlightCard as="article" className={`skill-card ${className}`} disabled={reduced || !finePointer}
    spotlightColor="#f36de0" intensity={0.09} spotlightSize={230} softness={0.85} borderGlow={0.25}
    proximity={0} smoothing={0.2} ambient={false} flare={false} grain={0}
    style={{ '--spotlight-card-surface': '#16111c', '--spotlight-card-border': 'transparent', '--spotlight-card-shadow': 'none' }}
    {...props}>{children}</SpotlightCard>;
}
