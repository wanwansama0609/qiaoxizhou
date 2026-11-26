import { useEffect, useState } from 'react';
import { ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { categories } from './content';
import { projectTitle, translateTerm } from './localization.js';
import { CoverGlare } from './effects/PortfolioMotion.jsx';

export function ProjectVisual({ project, t, className = '', variant = 'detail', loading = 'lazy', fetchPriority }) {
  const image = variant === 'cover' ? project.thumbnail || project.image : project.image;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image]);
  const category = categories.find(item => item.id === project.category);
  if (image && !failed) return <img className={className} src={image} alt={t(`${projectTitle(project, t)} 作品图片`, `${project.title} project image`)} loading={loading} fetchPriority={fetchPriority} draggable={false} onError={() => setFailed(true)} />;
  return <div className={`project-placeholder ${className}`} role="img" aria-label={t(`${projectTitle(project, t)} 的图片位置`, `Image space for ${project.title}`)}>
    <div className="placeholder-grid" aria-hidden="true" /><ImageIcon size={34} strokeWidth={1} aria-hidden="true" />
    <span className="mono">{category ? t(...category.label).toUpperCase() : ''}</span>
    <span>{t(failed ? '图片暂不可用' : '作品图片待添加', failed ? 'Image unavailable' : 'Project image coming soon')}</span>
  </div>;
}

export function ProjectCard({ project, t, onSelect, className = '', ...buttonProps }) {
  return <button className={`project-card ${className}`} {...buttonProps} data-project-id={project.id} onClick={() => onSelect(project)} aria-label={`${t('查看项目', 'View project')} ${projectTitle(project, t)}`}>
    <CoverGlare className="project-image"><ProjectVisual project={project} t={t} variant="cover" />
      {project.year && <span className="project-index mono">{project.year}</span>}
      <span className="project-open"><ArrowUpRight size={23} /></span>
    </CoverGlare>
    <div className="project-copy"><span className="project-type mono">{t(...project.type)}</span><h3>{projectTitle(project, t)}</h3><p>{t(...project.subtitle)}</p><div className="project-tags">{project.tags.map(tag => <span key={tag}>{translateTerm(tag, t)}</span>)}</div></div>
  </button>;
}

