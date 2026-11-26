import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, X, Menu, Copy, Check, Route, Palette, Gamepad2, Code2, Clapperboard, UserRound, Globe2, Mail } from 'lucide-react';
import { profile, projects, experiences, skills, categories, isProjectInCategory } from './content';
import ProjectGallery, { ProjectVisual } from './ProjectGallery';
import ProjectTools, { SkillTools } from './ProjectTools';
import FavoriteGamesSection from './FavoriteGamesSection.jsx';
import { LANGUAGE_STORAGE_KEY, projectTitle, translateTerm } from './localization.js';
import { AccentText, HeroAtmosphere, HeroTilt, Reveal, SkillSpotlight } from './effects/PortfolioMotion.jsx';

function projectCategoryOrder(project) {
  return categories.findIndex(category => category.id !== 'all' && isProjectInCategory(project, category.id));
}

function Mark({ className = '' }) {
  return <svg className={`brand-mark ${className}`} viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M6 7h26v20H18v8H6z" stroke="currentColor" strokeWidth="2" /><path d="m23 22 12 13" stroke="currentColor" strokeWidth="2" /></svg>;
}

function SectionLabel({ number, children }) {
  return <Reveal className="section-label" distance={10}><span className="section-number">{number}</span><span>{children}</span><span className="label-line" /></Reveal>;
}

function Hero({ t, project, onOpenProject }) {
  return <section className="hero" id="home" aria-labelledby="hero-title">
    <div className="hero-topography" aria-hidden="true"><HeroAtmosphere /></div>
    <div className="container hero-inner">
      <div className="hero-topline mono"><span><i className="status-dot" />{t('游戏设计', 'GAME DESIGN')}</span></div>
      <div className="hero-grid">
        <div className="hero-main">
          <div className="hero-intro"><span className="short-rule" />{t('周巧兮', 'QIAOXI ZHOU')}</div>
          <h1 id="hero-title">{t('游戏设计', 'GAME DESIGN')}<br /><AccentText text={t('与开发。', '& DEVELOPMENT.')} /></h1>
          <div className="hero-description"><p>{t('游戏设计与开发、关卡设计、3D 美术、动画和游戏分析作品集。', 'A portfolio of game design and development, level design, 3D art, animation, and game analysis.')}</p></div>
          <div className="hero-actions"><a className="button button-accent" href="#work">{t('看看我的作品', 'Explore my projects')}<ArrowUpRight size={18} /></a><a className="text-link" href="#about">{t('认识一下我', 'A little about me')}<ArrowDown size={16} /></a></div>
        </div>
        <HeroTilt><button className="hero-project" onClick={onOpenProject} aria-label={t(`查看游戏项目《${projectTitle(project, t)}》`, 'View game project One More Move')}>
          <span className="hero-project-tab mono">{t('精选项目', 'SELECTED PROJECT')}</span>
          <span className="project-poster"><ProjectVisual project={project} t={t} variant="cover" loading="eager" fetchPriority="high" /></span>
          <span className="hero-project-caption"><span><small className="mono">{t('个人游戏项目', 'PERSONAL GAME PROJECT')}</small><strong>{projectTitle(project, t)}</strong></span><span className="poster-arrow"><ArrowUpRight size={26} /></span></span>
          <span className="hero-project-note mono">{t('虚幻引擎 / 叙事解谜', 'UNREAL ENGINE / NARRATIVE PUZZLE')}</span>
        </button></HeroTilt>
      </div>
      <div className="hero-bottom"><a href="#about" className="scroll-cue"><span className="mono">{t('向下探索', 'SCROLL TO EXPLORE')}</span><ArrowDown size={15} /></a></div>
    </div>
  </section>;
}

function ProjectDialog({ project, t, onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);

  return <dialog ref={dialogRef} className="project-dialog" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="dialog-title">
    <div className="dialog-shell"><div className="dialog-top"><span className="mono">{project.year}</span><button className="icon-button" onClick={onClose} aria-label={t('关闭项目详情', 'Close project details')}><X size={22} /></button></div>
      <div className="dialog-cover"><ProjectVisual project={project} t={t} /></div>
      <div className="dialog-body"><span className="project-type mono">{t(...project.type)}</span><h2 id="dialog-title">{projectTitle(project, t)}</h2><p className="dialog-intro">{t(...project.intro)}</p>
        <div className="dialog-actions">
          {project.link && <a className="button button-accent" href={project.link} target="_blank" rel="noreferrer">{t(...(project.linkLabel || ['打开作品链接', 'Open project page']))}<ArrowUpRight size={18} /></a>}
          {(project.resources || []).filter(resource => /^https?:\/\//i.test(resource.url)).map(resource => <a className="button button-secondary" key={resource.id} data-resource={resource.id} href={resource.url} target="_blank" rel="noreferrer">{t(...resource.label)}<ArrowUpRight size={17} /></a>)}
          <a className="text-link" href={`mailto:${profile.email}?subject=${encodeURIComponent(t(`关于《${projectTitle(project, t)}》`, `Let’s talk about ${project.title}`))}`}>{t('聊聊这个项目', 'Let’s talk about this project')}<Mail size={17} /></a>
        </div>
        <div className="dialog-meta"><div><span className="mono">{t('负责内容', 'ROLE')}</span><strong>{t(...project.role)}</strong></div><ProjectTools engine={project.engine} t={t} /></div>
        <div className="dialog-details">{project.details.map((detail, i) => <article key={detail[1]}><span className="mono">0{i + 1}</span><div><h3>{t(detail[0], detail[1])}</h3><p>{t(detail[2], detail[3])}</p></div></article>)}</div>
        {project.gallery && <div className="dialog-gallery">{project.gallery.map((src, i) => <figure key={src}><img src={src} alt={t(['城堡大厅场景','围棋光影谜题场景','艺术体操场景'][i], ['Castle hall environment','Go-inspired light puzzle room','Rhythmic gymnastics room'][i])} loading="lazy" /><figcaption className="mono">0{i + 1} / {t(['城堡大厅', '围棋与光影', '艺术体操房间'][i], ['CASTLE HALL', 'GO & LIGHT', 'RHYTHM ROOM'][i])} — {t('引擎内画面', 'IN-ENGINE')}</figcaption></figure>)}</div>}
      </div>
    </div>
  </dialog>;
}

export default function App() {
  const [language, setLanguage] = useState(() => { try { return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'zh' ? 'zh' : 'en'; } catch { return 'en'; } });
  const [active, setActive] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [projectMedia, setProjectMedia] = useState({});
  const [mediaError, setMediaError] = useState(false);
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const copyTimer = useRef(null);
  const t = (zh, en) => language === 'zh' ? zh : en;
  const resolvedProjects = projects.map(project => {
    const media = projectMedia[project.id];
    const link = media?.link ?? project.link ?? '';
    return { ...project, image: media?.image ?? (project.id === 'one-more-move' ? project.image : ''), thumbnail: media?.thumbnail || '', link: /^https?:\/\//i.test(link) ? link : '' };
  }).sort((left, right) => projectCategoryOrder(left) - projectCategoryOrder(right));
  const filtered = resolvedProjects.filter(project => isProjectInCategory(project, filter));
  const selectedCategory = categories.find(category => category.id === filter);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/content/project-media.json', { signal: controller.signal, cache: 'no-store' })
      .then(response => { if (!response.ok) throw new Error('Media unavailable'); return response.json(); })
      .then(media => { setProjectMedia(media); setMediaError(false); })
      .catch(error => { if (error.name !== 'AbortError') setMediaError(true); });
    return () => controller.abort();
  }, []);
  const nav = [['about', '关于我', 'About'], ['work', '精选作品', 'Work'], ['approach', '我的技能', 'Skills'], ['games', '喜欢的游戏', 'Games I Love']];
  const skillIcons = { design: Route, art: Palette, engine: Gamepad2, code: Code2, media: Clapperboard, language: Globe2 };

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = t('周巧兮 — 游戏设计与开发', 'Qiaoxi Zhou — Game Design & Development');
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = t('周巧兮的个人作品集：游戏设计与开发、关卡设计、3D 美术、动画与绑定和游戏分析。', 'Qiaoxi Zhou’s portfolio of game design and development, level design, 3D art, animation, rigging, and game analysis.');
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* Browser storage may be disabled. */ }
  }, [language]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const sections = ['home', 'about', 'work', 'approach', 'games', 'contact'];
      for (const id of sections.reverse()) {
        if (document.getElementById(id).getBoundingClientRect().top <= window.innerHeight * 0.38) { setActive(id); break; }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleEscape = e => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', handleEscape);
    return () => { window.removeEventListener('keydown', handleEscape); clearTimeout(copyTimer.current); };
  }, []);

  async function copyEmail() {
    clearTimeout(copyTimer.current);
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true); setCopyError(false);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch { setCopyError(true); }
  }

  return <>
    <a className="skip-link" href="#main">{t('跳转到主要内容', 'Skip to content')}</a>
    <header className={`site-header ${scrolled || menuOpen ? 'is-scrolled' : ''}`}>
      <div className="container header-inner"><a className="brand" href="#home" aria-label={t("周巧兮 — 首页", "Qiaoxi Zhou — Home")}><Mark /><span>{t("周巧兮", "QIAOXI ZHOU")}<small>{t("游戏设计", "GAME DESIGN")}</small></span></a>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} id="main-navigation" aria-label={t('主导航', 'Main navigation')}>{nav.map(([id, zh, en, href], index) => <a key={id} className={active === id ? 'is-active' : ''} href={href || `#${id}`} onClick={() => setMenuOpen(false)} aria-current={active === id ? 'location' : undefined}><span className="mono">0{index + 1}</span>{t(zh, en)}</a>)}</nav>
        <div className="header-actions"><button className="language-switch" onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')} aria-label={t('Switch to English', '切换为中文')}><Globe2 size={14} /><span>{language === 'zh' ? 'EN' : '中'}</span></button><a className="contact-nav" href="#contact" onClick={() => setMenuOpen(false)}>{t('联系我', 'Let’s talk')}<ArrowUpRight size={17} /></a><button className="mobile-menu icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-navigation" aria-label={t('切换导航菜单', 'Toggle navigation menu')}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
      </div>
    </header>
    <main id="main">
      <Hero t={t} project={resolvedProjects[0]} onOpenProject={() => setSelected(resolvedProjects[0])} />

      <section className="about section-space" id="about" aria-labelledby="about-title"><div className="container">
        <SectionLabel number="01">{t('关于我 / 个人经历', 'ABOUT ME / A LITTLE ABOUT ME')}</SectionLabel>
        <div className="about-grid">
          <figure className="about-visual"><div className="portrait-frame">
            {profile.portrait ? <img className="personal-photo" src={profile.portrait} alt={t('周巧兮的个人照片', 'Portrait of Qiaoxi Zhou')} loading="lazy" /> : <div className="photo-placeholder"><span className="photo-corner top-left" /><span className="photo-corner bottom-right" /><UserRound size={66} strokeWidth={.7} /><span className="mono">{t("个人照片 / 周巧兮", "PORTRAIT / QIAOXI")}</span><p>{t('个人照片待添加', 'Personal photo coming soon')}</p></div>}
            <span className="portrait-index mono">{t("个人档案_01", "PROFILE_01")}</span>
          </div><figcaption><span>{t("周巧兮", "QIAOXI ZHOU")}</span><span className="mono">{t("游戏设计师", "GAME DESIGNER")}</span></figcaption></figure>
          <div className="about-content"><h2 id="about-title">{t('你好，我是', 'Hello, I’m')}<br /><span>{t('周巧兮。', 'Qiaoxi.')}</span></h2>
            <p className="about-lead">{t('游戏设计师', 'Game Designer')}</p>
            <p className="body-copy">{t('我毕业于密歇根州立大学游戏与交互媒体专业，辅修计算机科学。喜欢叙事游戏、竞技游戏和关卡探索，也喜欢把小想法做成可以亲手玩的东西。', 'I graduated from Michigan State University with a B.A. in Games and Interactive Media and a minor in Computer Science. I enjoy narrative and competitive games, exploring levels, and turning small ideas into something playable.')}</p>
            <p className="body-copy">{t('这个网站收录了我的个人项目、课程作品与分析研究，也记录了从想法到实践的过程。', 'This portfolio collects my personal projects, coursework, and game analyses, documenting how ideas take shape through practice.')}</p>
            <a href={`mailto:${profile.email}`} className="about-email">{profile.email}<ArrowUpRight size={16} /></a>
            <div className="about-meta mono"><span>{t("密歇根州立大学 / 游戏与交互媒体", "MSU / GAMES & INTERACTIVE MEDIA")}</span><span>{t("平均绩点", "GPA")} 3.728 / 4.00</span></div>
          </div>
          <div className="experience-list"><div className="experience-heading"><span className="eyebrow mono">{t("教育与经历", "EDUCATION & EXPERIENCE")}</span><span className="mono">2022—2026</span></div>{experiences.map(experience => <Reveal as="article" className="experience-row" key={experience.company}><span className="experience-date mono">{experience.date}</span><div><h3>{translateTerm(experience.company, t)}</h3><span className="experience-role">{t(...experience.title)}</span>{experience.summary && <p>{t(...experience.summary)}</p>}</div></Reveal>)}</div>
        </div>
      </div></section>

      <section className="work section-space" id="work" aria-labelledby="work-title"><div className="container"><SectionLabel number="02">{t('精选作品 / 作品集', 'SELECTED WORK / PROJECT ARCHIVE')}</SectionLabel>
        <Reveal className="section-heading"><div><h2 id="work-title">{t("精选", "SELECTED ")}<em>{t("作品。", "WORK.")}</em></h2><p>{t('游戏、视觉创作与分析研究。按分类探索，左右滑动翻看。', 'Games, visual work, and analysis. Choose a category and scroll to explore.')}</p></div><span className="section-count mono">{t('游戏 / 美术 / 分析', 'GAMES / ART / ANALYSIS')}<br />{t('项目', 'PROJECTS')} / {String(resolvedProjects.length).padStart(2, '0')}</span></Reveal>
        <div className="work-toolbar"><div className="filter-list" aria-label={t('项目分类', 'Filter projects')}>{categories.map(category => <button key={category.id} data-category={category.id} className={filter === category.id ? 'is-active' : ''} onClick={() => setFilter(category.id)} aria-pressed={filter === category.id}>{t(...category.label)}<span className="mono">{String(resolvedProjects.filter(project => isProjectInCategory(project, category.id)).length).padStart(2, '0')}</span></button>)}</div>
        </div>
        {mediaError && <p className="media-load-error" role="status">{t('作品图片和链接配置暂未加载，请刷新页面重试。', 'Project media could not be loaded. Please refresh to retry.')}</p>}
        <ProjectGallery key={filter} items={filtered} category={selectedCategory} t={t} onSelect={setSelected} suspended={Boolean(selected)} />
      </div></section>

      <section className="approach section-space" id="approach" aria-labelledby="approach-title"><div className="container"><SectionLabel number="03">{t('技能与工具 / 我的技能', 'SKILLS & TOOLS / WHAT I WORK WITH')}</SectionLabel>
        <Reveal className="section-heading"><div><h2 id="approach-title">{t("我的", "MY ")}<em>{t("技能。", "TOOLBOX.")}</em></h2><p>{t('在学习与项目中使用的技能和工具。', 'Skills and tools I use in my studies and projects.')}</p></div><span className="section-count mono">{t("持续学习。", "KEEP LEARNING.")}<br />{t("不断尝试。", "KEEP EXPERIMENTING.")}</span></Reveal>
        <div className="skills-grid">{skills.map(skill => { const Icon = skillIcons[skill.icon]; return <SkillSpotlight key={skill.number} data-skill={skill.icon}><div className="skill-card-top"><Icon size={24} strokeWidth={1.2} /><span className="mono">{t("技能", "SKILL")}_{skill.number}</span></div><div className="skill-title"><h3>{t(...skill.title)}</h3><span className="mono">{t(...skill.title)}</span></div><p>{t(...skill.description)}</p><SkillTools tools={skill.tools} t={t} /></SkillSpotlight>; })}</div>
        <div className="certificate-note"><span className="mono">{t("其他学习经历", "ALSO LEARNED")}</span><span>{t('心理咨询专业培训证书', 'Professional Training Certificate in Psychological Counseling')}</span><span className="mono">2025.01—03</span></div>
      </div></section>

      <FavoriteGamesSection t={t} />

      <section className="contact" id="contact" aria-labelledby="contact-title"><div className="contact-orbit" aria-hidden="true" /><div className="container contact-inner"><SectionLabel number="05">{t('保持联系 / 联系我', 'LET’S CONNECT / THE NEXT CHAPTER')}</SectionLabel><div className="contact-main"><div className="contact-kicker"><span className="status-dot" /><span className="mono">{t("欢迎交流", "ALWAYS UP FOR A CONVERSATION")}</span></div><h2 id="contact-title">{t("保持", "LET’S")}<br /><em>{t("联系。", "CONNECT.")}</em></h2><p>{t('聊聊游戏，交流想法，或给我的作品一些建议。', 'Talk games, exchange ideas, or share some feedback on my projects.')}</p><div className="contact-email-row"><a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight /></a><button className="copy-button" onClick={copyEmail} aria-label={t('复制邮箱地址', 'Copy email address')}>{copied ? <Check size={19} /> : <Copy size={19} />}</button></div><div className="copy-feedback" role="status">{copied ? t('邮箱已复制', 'Email address copied') : copyError ? t('请选中上方邮箱地址手动复制。', 'Please select and copy the email address above.') : ''}</div><div className="social-links"><a href={profile.artstation} target="_blank" rel="noreferrer">ARTSTATION<ArrowUpRight size={14} /></a><a href={profile.itch} target="_blank" rel="noreferrer">ITCH.IO<ArrowUpRight size={14} /></a><a href={profile.bilibili} target="_blank" rel="noreferrer"><span>{t("哔哩哔哩", "BILIBILI")}{t("（中国的主流视频网站）", " (a mainstream video platform in China)")}</span><ArrowUpRight size={14} /></a><a href="tel:+18158307679">{profile.phone}<ArrowUpRight size={14} /></a></div></div><footer className="footer"><a className="footer-brand" href="#home"><Mark /><span>{t("周巧兮", "QIAOXI ZHOU")}</span></a><span className="mono">© {new Date().getFullYear()} {t("周巧兮 · 游戏设计。", "QIAOXI ZHOU · GAME DESIGN.")}</span><a className="back-top" href="#home">{t('回到顶部', 'Back to top')}<ArrowUp size={16} /></a></footer></div></section>
    </main>
    {selected && <ProjectDialog project={selected} t={t} onClose={() => setSelected(null)} />}
  </>;
}
