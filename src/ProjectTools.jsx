import { BookOpen, MousePointer2, Brain, PencilRuler, Palette, ChartNoAxesCombined, Wrench } from 'lucide-react';
import { translateTerm } from './localization.js';

const definitions = {
  'UNREAL ENGINE': { name: ['虚幻引擎', 'Unreal Engine'], image: '/icons/tools/unreal-engine.svg', kind: 'software' },
  UNITY: { name: ['Unity', 'Unity'], image: '/icons/tools/unity.svg', kind: 'software' },
  BLENDER: { name: ['Blender', 'Blender'], image: '/icons/tools/blender.svg', kind: 'software' },
  'SUBSTANCE 3D PAINTER': { name: ['Adobe Substance 3D Painter', 'Adobe Substance 3D Painter'], image: '/icons/tools/substance-painter.png', kind: 'software' },
  POWERPOINT: { name: ['Microsoft PowerPoint', 'Microsoft PowerPoint'], image: '/icons/tools/powerpoint.svg', kind: 'software' },
  TABLETOPIA: { name: ['Tabletopia', 'Tabletopia'], image: '/icons/tools/tabletopia.png', kind: 'software' },
  PHOTOSHOP: { name: ['Adobe Photoshop', 'Adobe Photoshop'], image: '/icons/tools/photoshop.png', kind: 'software' },
  ILLUSTRATOR: { name: ['Adobe Illustrator', 'Adobe Illustrator'], image: '/icons/tools/illustrator.svg', kind: 'software' },
  'AFTER EFFECTS': { name: ['Adobe After Effects', 'Adobe After Effects'], image: '/icons/tools/after-effects.svg', kind: 'software' },
  'PREMIERE PRO': { name: ['Adobe Premiere Pro', 'Adobe Premiere Pro'], image: '/icons/tools/premiere-pro.svg', kind: 'software' },
  CAPCUT: { name: ['CapCut（剪映国际版）', 'CapCut'], image: '/icons/tools/capcut.png', kind: 'software' },
  WORD: { name: ['Microsoft Word', 'Microsoft Word'], image: '/icons/tools/word.svg', kind: 'software' },
  EXCEL: { name: ['Microsoft Excel', 'Microsoft Excel'], image: '/icons/tools/excel.svg', kind: 'software' },
  FIGMA: { name: ['Figma', 'Figma'], image: '/icons/tools/figma.svg', kind: 'software' },
  PROCREATE: { name: ['Procreate', 'Procreate'], image: '/icons/tools/procreate.png', kind: 'software' },
  'GOOGLE SHEETS': { name: ['Google 表格', 'Google Sheets'], image: '/icons/tools/google-sheets.svg', kind: 'software' },
  RESEARCH: { name: ['研究', 'Research'], Icon: BookOpen, kind: 'focus' },
  HCI: { name: ['人机交互（HCI）', 'Human-computer interaction (HCI)'], Icon: MousePointer2, kind: 'focus' },
  'GAME PSYCHOLOGY': { name: ['游戏心理学', 'Game psychology'], Icon: Brain, kind: 'focus' },
  SKETCH: { name: ['草图绘制', 'Sketching'], Icon: PencilRuler, kind: 'focus' },
  'CONCEPT ART': { name: ['概念设计', 'Concept art'], Icon: Palette, kind: 'focus' },
  'GAMEPLAY ANALYSIS': { name: ['玩法分析', 'Gameplay analysis'], Icon: ChartNoAxesCombined, kind: 'focus' },
};

const aliases = {
  'ADOBE SUBSTANCE 3D PAINTER': 'SUBSTANCE 3D PAINTER',
  'ADOBE PHOTOSHOP': 'PHOTOSHOP', 'ADOBE ILLUSTRATOR': 'ILLUSTRATOR',
  'ADOBE AFTER EFFECTS': 'AFTER EFFECTS', 'ADOBE PREMIERE PRO': 'PREMIERE PRO',
  'MICROSOFT WORD': 'WORD', 'MICROSOFT EXCEL': 'EXCEL', 'MICROSOFT POWERPOINT': 'POWERPOINT',
};

function ToolIconList({ items, t, label, className = '' }) {
  return <ul className={`project-tool-icons ${className}`} aria-label={label}>
    {items.map(({ key, name, image, Icon }) => <li className="project-tool-item" key={key}>
      <span className="project-tool-icon" tabIndex={0} role="img" aria-label={t(...name)}>
        {image ? <img src={image} alt="" aria-hidden="true" draggable="false" /> : <Icon size={25} strokeWidth={1.4} aria-hidden="true" />}
      </span>
      <span className="project-tool-tooltip" aria-hidden="true">{t(...name)}</span>
    </li>)}
  </ul>;
}

export function SkillTools({ tools, t }) {
  const software = [];
  const text = [];
  for (const tool of tools) {
    const key = aliases[tool.toUpperCase()] || tool.toUpperCase();
    const definition = definitions[key];
    if (definition?.kind === 'software') software.push({ key, ...definition });
    else text.push(tool);
  }
  return <div className="skill-toolset">
    {text.length > 0 && <div className="skill-tools">{text.map(tool => <span key={tool}>{translateTerm(tool, t)}</span>)}</div>}
    {software.length > 0 && <ToolIconList items={software} t={t} label={t('软件工具', 'Software tools')} className="skill-software-icons" />}
  </div>;
}

export default function ProjectTools({ engine, t }) {
  const entries = [...new Set((engine || '').split('/').map(value => value.trim()).filter(Boolean))].map(key => ({ key, ...(definitions[key] || { name: [key, key], Icon: Wrench, kind: 'software' }) }));
  return <>{['software', 'focus'].map(kind => {
    const items = entries.filter(entry => entry.kind === kind);
    if (!items.length) return null;
    return <div className="project-tools-meta" key={kind}>
      <span className="mono">{kind === 'software' ? t('制作工具', 'TOOLS') : t('研究方向', 'FOCUS')}</span>
      <ToolIconList items={items} t={t} label={kind === 'software' ? t('制作工具', 'Software tools') : t('创作与研究方向', 'Creative and research focus')} />
    </div>;
  })}</>;
}
