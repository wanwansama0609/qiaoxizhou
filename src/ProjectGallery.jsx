import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProjectCard } from './ProjectCard.jsx';
import ProjectShowcase from './ProjectShowcase.jsx';
export { ProjectVisual } from './ProjectCard.jsx';

function FilteredProjectGallery({ items, category, t, onSelect }) {
  const trackRef = useRef(null);
  const regionId = useId();
  const [position, setPosition] = useState({ left: 0, max: 0, start: 1, end: 1 });

  useEffect(() => {
    const track = trackRef.current;
    const measure = () => {
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 20;
      const stride = (track.firstElementChild?.getBoundingClientRect().width || track.clientWidth) + gap;
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      const left = Math.max(0, Math.min(max, track.scrollLeft));
      setPosition({ left, max, start: Math.min(items.length, Math.floor((left + 2) / stride) + 1), end: Math.min(items.length, Math.ceil((left + track.clientWidth - 2) / stride)) });
    };
    track.scrollLeft = 0;
    measure();
    track.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(track);
    return () => { observer?.disconnect(); track.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); };
  }, [items.length, category.id]);

  function move(direction) {
    const track = trackRef.current;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 20;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    track.scrollBy({ left: direction * (track.clientWidth + gap), behavior });
  }

  return <div className="project-gallery">
    <div className="gallery-heading"><div><h3>{t(...category.label)}<span className="mono">{String(items.length).padStart(2, '0')}</span></h3><p>{t(...category.description)}</p></div>
      <div className="gallery-controls"><span className="mono" aria-live="polite">{String(position.start).padStart(2, '0')}—{String(position.end).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
        <button className="gallery-arrow" onClick={() => move(-1)} disabled={position.left < 2} aria-label={t('上一组作品', 'Previous projects')} aria-controls={regionId}><ArrowLeft size={19} /></button>
        <button className="gallery-arrow" onClick={() => move(1)} disabled={position.left >= position.max - 2} aria-label={t('下一组作品', 'Next projects')} aria-controls={regionId}><ArrowRight size={19} /></button>
      </div>
    </div>
    <div ref={trackRef} id={regionId} className="project-track" role="region" aria-label={t(`${category.label[0]}作品，可左右滚动`, `${category.label[1]} projects, scroll horizontally`)} tabIndex={0} onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}>
      {items.map(project => <ProjectCard key={project.id} project={project} t={t} onSelect={onSelect} />)}
    </div>
    <div className={`gallery-scrollbar ${position.max <= 1 ? 'is-complete' : ''}`}>
      <span className="mono">{position.max > 1 ? t('拖动浏览', 'DRAG TO EXPLORE') : t('全部已显示', 'ALL IN VIEW')}</span>
      <input type="range" min="0" max="1000" step="1" value={position.max ? Math.round(position.left / position.max * 1000) : 0} disabled={position.max <= 1} aria-label={t('作品横向滚动位置', 'Horizontal project scroll position')} aria-valuetext={t(`第 ${position.start} 至 ${position.end} 项，共 ${items.length} 项`, `Projects ${position.start} to ${position.end} of ${items.length}`)} aria-controls={regionId} onChange={event => trackRef.current.scrollTo({ left: position.max * Number(event.target.value) / 1000, behavior: 'instant' })} />
      <span className="mono">{t('左右滑动 / 方向键', 'SWIPE / ARROW KEYS')}</span>
    </div>
  </div>;
}

export default function ProjectGallery(props) {
  return props.category.id === 'all' ? <ProjectShowcase {...props} /> : <FilteredProjectGallery {...props} />;
}
