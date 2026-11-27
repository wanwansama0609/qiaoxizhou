import { useEffect, useId, useRef, useState } from 'react';
import { ProjectCard, ProjectVisual } from './ProjectCard.jsx';
import { projectTitle } from './localization.js';
import { useMotionSettings } from './effects/PortfolioMotion.jsx';
import './project-showcase.css';

export const SHOWCASE_INTERVAL = 5200;
const wrap = (index, count) => (index % count + count) % count;
const distanceFrom = (index, active, count) => wrap(index - active + Math.floor(count / 2), count) - Math.floor(count / 2);

// A project-specific coverflow inspired by React Bits Circular Carousel.
// Native cards, thumbnail navigation, and pausable timing keep the portfolio accessible.
export default function ProjectShowcase({ items, t, onSelect, suspended = false }) {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const rootRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const remainingRef = useRef(SHOWCASE_INTERVAL);
  const cycleRef = useRef('');
  const dragRef = useRef(null);
  const suppressClickUntil = useRef(0);
  const focusSlide = useRef(false);
  const stageId = useId();
  const { reduced, finePointer } = useMotionSettings();
  const playing = items.length > 1 && !reduced && !hovered && !focused && !suspended && inView && pageVisible;
  const current = items[active] || items[0];

  useEffect(() => {
    if (!window.IntersectionObserver) { setInView(true); return; }
    const observer = new IntersectionObserver(entries => setInView(entries.some(entry => entry.isIntersecting && (entry.intersectionRatio ?? 1) >= 0.2)), { threshold: [0, 0.2] });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    const key = `${active}:${cycle}`;
    if (cycleRef.current !== key) { remainingRef.current = SHOWCASE_INTERVAL; cycleRef.current = key; }
    if (!playing) return;
    const started = performance.now();
    const timer = window.setTimeout(() => { setActive(index => wrap(index + 1, items.length)); setCycle(value => value + 1); }, remainingRef.current);
    return () => { window.clearTimeout(timer); remainingRef.current = Math.max(0, remainingRef.current - (performance.now() - started)); };
  }, [active, cycle, playing, items.length]);

  useEffect(() => {
    const bar = thumbnailsRef.current;
    const thumb = bar?.children[active];
    if (thumb) bar.scrollTo?.({ left: Math.max(0, thumb.offsetLeft - (bar.clientWidth - thumb.offsetWidth) / 2), behavior: reduced ? 'auto' : 'smooth' });
    if (focusSlide.current) {
      rootRef.current?.querySelector('.showcase-card.is-current')?.focus({ preventScroll: true });
      focusSlide.current = false;
    }
  }, [active, reduced]);

  function go(index) { setActive(wrap(index, items.length)); setCycle(value => value + 1); }
  function onKeyDown(event) {
    if (event.target !== event.currentTarget && !event.target.closest('.showcase-card')) return;
    const destination = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: items.length - 1 }[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    focusSlide.current = Boolean(event.target.closest('.showcase-card'));
    go(destination);
  }
  function endDrag(event) {
    const start = dragRef.current; dragRef.current = null;
    if (!start) return;
    const dx = event.clientX - start.x; const dy = event.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.35) {
      suppressClickUntil.current = performance.now() + 300;
      go(active + (dx < 0 ? 1 : -1));
    }
  }

  return <div ref={rootRef} className="project-showcase" data-active-project={current.id} data-playing={playing} data-reduced={reduced}
    onPointerEnter={event => { if (finePointer && event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => { setHovered(false); dragRef.current = null; }}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="showcase-topline"><span className="mono"><i className={`showcase-live-dot ${playing ? 'is-playing' : ''}`} />{t('全部作品 · 自动预览', 'ALL WORK · PROJECT REEL')}</span><span className="mono">{reduced ? t('手动浏览', 'MANUAL BROWSING') : playing ? t('自动播放', 'AUTOPLAY') : t('浏览时暂停', 'PAUSED WHILE BROWSING')}</span></div>
    <div className="showcase-navigation">
      <div className="showcase-position mono" aria-live={playing ? 'off' : 'polite'}><strong>{String(active + 1).padStart(2, '0')}</strong><span>/ {String(items.length).padStart(2, '0')}</span></div>
      <input className="showcase-slider" type="range" min="0" max={Math.max(0, items.length - 1)} step="1" value={active}
        aria-label={t('项目预览位置', 'Project preview position')} aria-controls={stageId}
        aria-valuetext={t(`第 ${active + 1} 项，共 ${items.length} 项：${projectTitle(current, t)}`, `Project ${active + 1} of ${items.length}: ${current.title}`)}
        style={{ '--showcase-progress': `${items.length > 1 ? active / (items.length - 1) * 100 : 0}%` }}
        onPointerDown={event => event.currentTarget.focus({ preventScroll: true })}
        onChange={event => go(Number(event.currentTarget.value))} />
      <span className="showcase-hint mono">{t('拖动切换项目', 'DRAG TO PREVIEW')}</span>
    </div>
    <div className="showcase-stage" id={stageId} role="region" aria-roledescription={t('轮播', 'carousel')} aria-label={t('全部项目预览，使用左右方向键浏览', 'All projects preview. Use left and right arrows to browse.')} tabIndex={0} onKeyDown={onKeyDown}
      onPointerDown={event => { if (event.button === 0) dragRef.current = { x: event.clientX, y: event.clientY }; }} onPointerUp={endDrag} onPointerCancel={() => { dragRef.current = null; }}
      onClickCapture={event => { if (performance.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}>
      <div className="showcase-ambient" aria-hidden="true" /><div className="showcase-floor" aria-hidden="true" />
      {items.map((project, index) => {
        const offset = distanceFrom(index, active, items.length); const depth = Math.abs(offset);
        return <ProjectCard key={project.id} project={project} t={t} onSelect={onSelect} imageSizeHint="showcase" className={`showcase-card ${index === active ? 'is-current' : ''}`}
          tabIndex={index === active ? 0 : -1} aria-hidden={index !== active} data-cursor-lock={index === active ? undefined : 'false'}
          style={{ '--slide-x': `${offset * 72}%`, '--slide-angle': `${-offset * 10}deg`, '--slide-depth': `${-Math.min(depth, 3) * 170}px`, '--slide-scale': depth ? Math.max(0.7, 1 - depth * 0.12) : 1, opacity: depth === 0 ? 1 : depth === 1 ? 0.38 : 0, visibility: depth > 1 ? 'hidden' : 'visible', zIndex: items.length - depth }} />;
      })}
    </div>
    <div className="showcase-thumbnails" ref={thumbnailsRef} role="group" aria-label={t('选择要预览的项目', 'Choose a project to preview')}>
      {items.map((project, index) => <button key={project.id} type="button" className={index === active ? 'is-current' : ''} data-preview-id={project.id} aria-pressed={index === active} aria-label={t(`预览：${projectTitle(project, t)}`, `Preview: ${project.title}`)} title={projectTitle(project, t)} onClick={() => go(index)}><ProjectVisual project={project} t={t} variant="cover" sizeHint="strip" /></button>)}
    </div>
  </div>;
}
