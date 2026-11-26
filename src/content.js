export const profile = {
  name: 'Qiaoxi Zhou',
  chineseName: '周巧兮',
  portrait: '/media/portrait.webp',
  email: 'qiaoxiz0469@outlook.com',
  phone: '+1 815-830-7679',
  artstation: 'https://www.artstation.com/wanwansama',
  itch: 'https://josiez.itch.io/',
  bilibili: 'https://space.bilibili.com/388507690',
  paper: 'https://doi.org/10.54254/2753-7048/54/20241603',
};

// Text comes from the supplied CV and creative portfolio list.
// Dates follow the latest supplied CV and the user's corrections.
// Only One More Move displays a month range; other projects display a year.
export const categories = [
  { id: 'all', label: ['全部', 'All'], description: ['自动预览全部作品，或按创作方向筛选。', 'Preview all projects in the reel, or filter by creative discipline.'] },
  { id: 'modeling', label: ['3D 建模', '3D Modeling'], description: ['角色、场景、材质与风格化道具。', 'Characters, environments, materials, and stylized props.'] },
  { id: 'level', label: ['关卡设计', 'Level Design'], description: ['通过空间、动线与解谜机制组织游玩体验。', 'Spaces, traversal, and puzzles that shape the player experience.'] },
  { id: 'analysis', label: ['游戏分析', 'Game Analysis'], description: ['对玩法、体验与市场定位的观察和研究。', 'Research into gameplay, player experience, and market positioning.'] },
  { id: 'animation', label: ['动画与绑定', 'Animation & Rigging'], description: ['角色绑定、动作制作与引擎内测试。', 'Character rigs, animation sets, and in-engine tests.'] },
  { id: 'game', label: ['卡牌游戏', 'Card Games'], description: ['卡牌机制、规则设计与可玩桌游原型。', 'Card mechanics, rules, and playable tabletop prototypes.'] },
  { id: 'sketch', label: ['草图', 'Sketch'], description: ['角色与生物设计的绘画探索。', 'Drawing explorations in character and creature design.'] },
];

export function isProjectInCategory(project, categoryId) {
  return categoryId === 'all' || (project.categories || [project.category]).includes(categoryId);
}

export const projects = [
  {
    id: 'one-more-move', number: '01', title: 'One More Move',
    subtitle: ['未落定 · 在成长与记忆之间，再走一步。', 'One more move, between memory and growing up.'],
    category: 'modeling', categories: ['modeling', 'level'], year: '2026.05–2026.10',
    type: ['独立游戏 / 叙事解谜', 'INDEPENDENT GAME / NARRATIVE PUZZLE'],
    role: ['独立开发者', 'Sole developer'], engine: 'UNREAL ENGINE / BLENDER / SUBSTANCE 3D PAINTER / PHOTOSHOP / FIGMA / PROCREATE',
    image: '/media/one-more-move.webp', alt: ['《One More Move》双主角与城堡场景封面', 'One More Move cover featuring its two protagonists and castle'],
    tags: ['Narrative', 'Puzzle', 'Blueprints'],
    intro: ['一款完整可玩的 3D 叙事解谜游戏。两位具有不同机制的角色，在城堡探索、围棋光影谜题与艺术体操节奏挑战中，逐渐解锁同一段成长记忆。', 'A complete, playable 3D narrative puzzle game. Switch between two characters with distinct mechanics to uncover memories through castle exploration, Go-inspired light puzzles, and rhythmic gymnastics challenges.'],
    details: [
      ['完整的创作链路', 'End-to-end development', '独立完成叙事、机制与关卡设计、建模及 Blueprint 实现，将故事节奏落实到可玩的空间与交互中。', 'Independently handled narrative, gameplay, level design, modeling, and Blueprint implementation, translating story beats into playable spaces and interactions.'],
      ['让机制承载记忆', 'Mechanics that carry memory', '四个章节、16 件记忆物品。将围棋“提子”、有限资源与镜面光路结合，通过记忆排序重建楼梯，连接空间推进与人物成长。', 'Four chapters and 16 memory items connect Go capture rules, limited resources, and mirror-based light puzzles. Ordering memories reconstructs a staircase and connects spatial progression to personal growth.'],
      ['两种视角，一段故事', 'Two perspectives, one story', '为节奏玩法实现点击、长按和同时输入；通过角色切换与重试进度保留，让不同机制共同服务叙事。', 'Implemented tap, hold, and simultaneous rhythm inputs, character switching, and progress preservation across retries to support the narrative.'],
    ],
    gallery: ['/media/hall.webp', '/media/go-room.webp', '/media/rhythm-room.webp'],
    link: 'https://josiez.itch.io/one-more-move', linkLabel: ['查看并下载游戏', 'View & download game'],
    resources: [
      { id: 'design-development', label: ['设计与开发全览（19 页）', 'Design & Development Breakdown (19 pages)'], url: 'https://drive.google.com/file/d/1XObn9lEN5BThhQJL4J2wFfPXYAnCuJ0v/view?usp=sharing' },
    ],
  },
  {
    id: 'time-puzzle', number: '02', title: 'Time-Shifting Puzzle Level',
    subtitle: ['让昼夜切换，成为解开空间的钥匙。', 'A change of time. A new way through.'],
    category: 'level', year: '2025',
    type: ['关卡设计 / 可玩白盒', 'LEVEL DESIGN / PLAYABLE BLOCKOUT'],
    role: ['关卡设计与蓝图开发', 'Level designer & Blueprint developer'], engine: 'UNREAL ENGINE',
    tags: ['Level Design', 'Day / Night', 'Blueprints'],
    intro: ['一个围绕昼夜切换、平台跳跃与房间谜题构建的可玩 Unreal Engine 白盒。用时间状态的变化，组织玩家对空间的观察与探索。', 'A playable Unreal Engine blockout built around day/night switching, platforming, and room puzzles, using changes in time state to shape spatial exploration.'],
    details: [
      ['从机制到可玩原型', 'From mechanic to playable prototype', '负责关卡设计与 Blueprint 开发，实现昼夜切换、按钮交互以及钥匙与门的逻辑。', 'Designed the level and implemented day/night switching, button interactions, and key-and-door logic in Blueprints.'],
      ['以空间组织谜题', 'Spatial puzzle design', '将平台移动与房间内的解谜交互结合，形成可探索、可验证的完整原型。', 'Combined platform traversal with room-based puzzle interactions in a playable prototype.'],
    ],
    link: 'https://www.artstation.com/artwork/31bwDm', linkLabel: ['在 ArtStation 查看项目', 'View project on ArtStation'],
  },
  {
    id: 'infiltration', number: '03', title: 'Infiltrate & Escape Level',
    subtitle: ['同一处空间，另一种高度。', 'The same space, seen from a different height.'],
    category: 'level', year: '2024',
    type: ['关卡设计 / 可玩白盒', 'LEVEL DESIGN / PLAYABLE BLOCKOUT'],
    role: ['关卡设计师', 'Level designer'], engine: 'UNREAL ENGINE',
    tags: ['Level Design', 'Traversal', 'Blockout'],
    intro: ['基于课程提供的玩法系统构建 Unreal Engine 白盒，探索建筑内外的垂直移动，以及让玩家重新理解同一空间的回环路线。', 'An Unreal Engine blockout built with course-provided gameplay systems, exploring vertical traversal inside and outside a building and a loop that recontextualizes a familiar space.'],
    details: [
      ['垂直动线', 'Vertical traversal', '将车辆、广告牌、家具与外部通风管道作为可通行表面，组织建筑周围的立体探索。', 'Used vehicles, billboards, furniture, and exterior ducts as traversal surfaces around the building.'],
      ['空间回环', 'A spatial loop', '设计从地下室返回入口上方天花板开口的路线，让玩家从新的高度重访原有空间。', 'Designed a basement loop returning through a ceiling opening above the entry gate, allowing players to revisit the space from a new elevation.'],
    ],
    link: 'https://www.artstation.com/artwork/b0BVba', linkLabel: ['在 ArtStation 查看项目', 'View project on ArtStation'],
  },
  {
    id: 'neon-alley', number: '04', title: 'Neon Alley: Cyberpunk Environment',
    category: 'modeling', year: '2026', type: ['3D 建模 / 材质制作', '3D MODELING / TEXTURING'],
    subtitle: ['霓虹、雨痕与潮湿巷道。', 'Neon, rain streaks, and a weathered alley.'],
    role: ['3D 建模与材质制作', '3D modeler & material artist'], engine: 'UNREAL ENGINE / BLENDER / SUBSTANCE 3D PAINTER',
    tags: ['3D Modeling', 'PBR', 'Trim Sheets'],
    intro: ['高级 3D 建模与材质课程作品。搭建赛博朋克巷道与道具，通过雨痕、污渍、发光招牌、粗糙度和灯光营造潮湿、老旧的环境。', 'Advanced 3D modeling and texturing coursework: a cyberpunk alley with props, rain streaks, grime, emissive signs, material roughness, and lighting to create a damp, aged atmosphere.'],
    details: [['材质与场景', 'Materials & environment', '为墙面与天花板使用 Trim Sheet，并制作两种可平铺地面材质，在 Unreal Engine 中呈现。', 'Used trim sheets for walls and ceilings and two tileable floor materials, with the final scene presented in Unreal Engine.']],
  },
  {
    id: 'potion-shop-sign', number: '05', title: 'Stylized Potion Shop Sign',
    category: 'modeling', year: '2026', type: ['3D 建模 / 材质制作', '3D MODELING / TEXTURING'],
    subtitle: ['木、石与金属的风格化练习。', 'A stylized study in wood, stone, and metal.'],
    role: ['3D 建模与材质制作', '3D modeler & material artist'], engine: 'BLENDER / SUBSTANCE 3D PAINTER / UNREAL ENGINE',
    tags: ['3D Modeling', 'Stylized', 'Texturing'],
    intro: ['药水店路牌的建模与材质练习，完成高低模、UV 展开和木、石、金属材质，最终在 Unreal Engine 中展示。', 'A potion shop sign study covering high- and low-poly models, UV unwrapping, wood, stone, and metal materials, and final presentation in Unreal Engine.'],
    details: [['表面细节', 'Surface detail', '通过木纹、色彩变化与表面细节表现材质之间的差异。', 'Used grain, color variation, and surface detail to distinguish the materials.']],
  },
  {
    id: 'sci-fi-blaster', number: '06', title: 'Stylized Sci-Fi Blaster',
    category: 'modeling', year: '2026', type: ['3D 建模 / 材质制作', '3D MODELING / TEXTURING'],
    subtitle: ['风格化科幻武器建模与材质练习。', 'A stylized sci-fi weapon modeling and texturing study.'],
    role: ['3D 建模与材质制作', '3D modeler & material artist'], engine: 'BLENDER / SUBSTANCE 3D PAINTER / UNREAL ENGINE',
    tags: ['3D Modeling', 'Stylized', 'Texturing'],
    intro: ['3D 建模与材质课程中的风格化科幻武器作品，涵盖模型、UV 与纹理制作，以及引擎内呈现。', 'A stylized sci-fi blaster from 3D modeling and texturing coursework, covering modeling, UVs, textures, and in-engine presentation.'], details: [],
  },
  {
    id: 'stylized-props', number: '07', title: 'Stylized Props',
    category: 'modeling', year: '2026', type: ['3D 建模 / 材质制作', '3D MODELING / TEXTURING'],
    subtitle: ['箱子、木桶与环境道具。', 'Crates, barrels, and environmental props.'],
    role: ['3D 建模与材质制作', '3D modeler & material artist'], engine: 'BLENDER / SUBSTANCE 3D PAINTER / UNREAL ENGINE',
    tags: ['3D Modeling', 'Stylized', 'Texturing'],
    intro: ['风格化道具组的课程练习，完成模型、UV 和纹理，在 Unreal Engine 中组合展示。', 'A coursework study of stylized props, with models, UVs, textures, and a combined presentation in Unreal Engine.'], details: [],
  },
  {
    id: 'character-animation', number: '08', title: 'Character Animation Set',
    category: 'animation', year: '2026', type: ['角色动画 / 动作练习', 'CHARACTER ANIMATION / MOTION STUDY'],
    subtitle: ['角色动作与节奏的手工动画练习。', 'Hand-keyed studies of character motion and timing.'],
    role: ['动画制作', 'Animator'], engine: 'BLENDER', tags: ['Animation', 'Character', 'Motion'],
    intro: ['角色动画作品集，包含手工制作的年轻法师动作组。', 'A character animation collection including a hand-animated young mage set.'], details: [],
  },
  {
    id: 'character-rigging', number: '09', title: 'Game Character Rigging and Animation',
    category: 'animation', year: '2026', type: ['角色绑定 / 动画测试', 'CHARACTER RIGGING / ANIMATION TEST'],
    subtitle: ['从已有角色模型，到可测试的动作。', 'From an existing model to playable animation tests.'],
    role: ['绑定与动画制作', 'Rigger & animator'], engine: 'BLENDER / UNITY', tags: ['Rigging', 'Animation', 'Unity'],
    intro: ['MI 347 课程作品。为已有模型完成绑定，制作待机与攻击动画，并搭建可玩的 Unity 动画测试。', 'MI 347 coursework: rigged an existing model, created idle and attack animations, and built a playable Unity animation test.'],
    details: [['制作范围', 'Scope', '负责绑定、动画和引擎内测试；角色模型为已有资源。', 'Responsible for rigging, animation, and in-engine testing; the character model was an existing asset.']],
  },
  {
    id: 'water-fire-monsters', number: '10', title: 'Game Monster Design | Water and Fire',
    category: 'sketch', year: '2024', type: ['草图 / 生物设计', 'SKETCH / CREATURE DESIGN'],
    subtitle: ['水与火主题的游戏生物设计。', 'Game creature designs inspired by water and fire.'],
    role: ['生物概念设计', 'Creature concept designer'], engine: 'PROCREATE', tags: ['Creature Design', 'Sketch', 'Concept'],
    intro: ['以水和火为主题的游戏怪物设计，探索不同元素对应的造型与视觉表达。', 'Water- and fire-themed game monster designs, exploring forms and visual expression for contrasting elements.'], details: [],
  },
  {
    id: 'cs2-valorant', number: '11', title: 'Counter-Strike 2 & VALORANT',
    category: 'analysis', year: '2024', type: ['游戏分析 / 对比研究', 'GAME ANALYSIS / COMPARATIVE RESEARCH'],
    subtitle: ['玩法、社区与商业模式的对比研究。', 'A comparison of gameplay, communities, and business models.'],
    role: ['作者与研究者', 'Author & researcher'], engine: 'RESEARCH / HCI / GAME PSYCHOLOGY', tags: ['Game Analysis', 'HCI', 'Research'],
    intro: ['从 HCI 和游戏心理学角度，对比 CS2 与 VALORANT 的玩法、社区互动和商业模式。论文发表于 Lecture Notes in Education Psychology and Public Media（2024）。', 'A comparison of CS2 and VALORANT through HCI and game psychology, examining gameplay, community interaction, and business models. Published in Lecture Notes in Education Psychology and Public Media (2024).'],
    details: [['研究背景', 'Research context', '在 Geoff Kaufman 教授指导下完成相关研究。论文 DOI：10.54254/2753-7048/54/20241603。', 'Research supervised by Prof. Geoff Kaufman. DOI: 10.54254/2753-7048/54/20241603.']],
    linkLabel: ['阅读研究论文', 'Read the paper'],
  },
  {
    id: 'valorant-mobile', number: '12', title: 'VALORANT Mobile Analysis (Chinese)',
    linkLabel: ['查看分析报告', 'View analysis report'],
    category: 'analysis', year: '2025', type: ['游戏分析 / 竞品研究', 'GAME ANALYSIS / COMPETITIVE RESEARCH'],
    subtitle: ['战术深度如何适配移动端？', 'How does tactical depth translate to mobile?'],
    role: ['游戏设计实习生', 'Game design intern'], engine: 'GAMEPLAY ANALYSIS / POWERPOINT', tags: ['Game Analysis', 'Mobile', 'Market Positioning'],
    intro: ['腾讯 IEG-K9 彩虹六号项目组实习期间完成的分析演示，讨论市场定位、战术深度与移动端操作，并向团队分享设计取舍。', 'An analysis presentation created during my internship with Tencent’s IEG-K9 Rainbow Six team, examining market positioning, tactical depth, mobile controls, and design trade-offs.'], details: [],
  },
  {
    id: 'elemental-magic', number: '13', title: 'Elemental Magic',
    linkLabel: ['开始游玩', 'Play on Tabletopia'],
    resources: [
      { id: 'rules', label: ['查看规则', 'View rules'], url: 'https://docs.google.com/document/d/1t7Lmcbn_QfuBPTsXPK5QUo0pzAphLRevJPti-dHLzQY/edit?usp=sharing' },
      { id: 'cards', label: ['查看卡牌', 'View cards'], url: 'https://docs.google.com/spreadsheets/d/1KriYEg_VCgEKGOMHgTVkAZn4RITMtZeClA5iyL2GfNk/edit?usp=sharing' },
    ],
    category: 'game', year: '2024', type: ['桌游 / 卡牌机制', 'TABLETOP GAME / CARD MECHANICS'],
    subtitle: ['骰子、元素与多种得分策略。', 'Dice, elements, and multiple scoring strategies.'],
    role: ['游戏设计', 'Game designer'], engine: 'TABLETOPIA / GOOGLE SHEETS', tags: ['Card Game', 'Systems', 'Playtesting'],
    intro: ['原创卡牌游戏，将骰子行动、元素卡、交易、偷取及地块事件结合；完成规则、美术资源与 Tabletopia 可玩原型。', 'An original card game combining dice actions, elemental cards, trading, stealing, and tile events, with rules, assets, and a playable Tabletopia prototype.'],
    details: [['迭代与测试', 'Iteration & playtesting', '设计技能卡和多种得分策略，通过两轮测试调整机制。', 'Designed skill cards and multiple scoring strategies, refining the mechanics through two rounds of playtesting.']],
  },
];

export const experiences = [
  { date: '2025.05 — 2025.08', company: 'Tencent Games', summary: ['参与彩虹六号国服预约流程设计与手游竞品分析。', 'Pre-registration user flows and mobile game analysis for the Rainbow Six team.'], title: ['游戏设计实习生 · IEG-K9 彩虹六号项目组', 'Game Design Intern · IEG-K9 Rainbow Six'], description: ['参与国服预约页面与用户流程设计，协同美术、程序推进上线；完成《VALORANT Mobile》市场与玩法分析并向团队汇报。', 'Designed pre-registration layouts and user flows for the China launch, collaborated with artists and programmers, and presented a VALORANT Mobile market and gameplay analysis.'] },
  { date: '2022.08 — 2026.05', company: 'Michigan State University', title: ['游戏与交互媒体本科 · 计算机科学辅修', 'B.A. Games & Interactive Media · Computer Science minor'], description: ['以游戏设计为主线，持续探索机制、空间叙事与实时 3D 制作。GPA 3.728 / 4.00。', 'A practice spanning game mechanics, spatial narrative, and real-time 3D production. GPA 3.728 / 4.00.'] },
];

export const skills = [
  { icon: 'design', number: '01', en: 'Game design', title: ['游戏设计', 'Game design'], description: ['在课程与个人项目中练习关卡、机制、叙事和原型设计。', 'Practicing level, mechanics, narrative, and prototype design through coursework and personal projects.'], tools: ['Level Design', 'Game Mechanics', 'Narrative Design', 'Prototyping'] },
  { icon: 'art', number: '02', en: 'Art & 3D', title: ['美术与 3D', 'Art & 3D'], description: ['用于建模、材质制作、图像处理和视觉内容创作。', 'Tools for modeling, material creation, image editing, and visual work.'], tools: ['Blender', 'Adobe Substance 3D Painter', 'Photoshop', 'Illustrator', 'After Effects'] },
  { icon: 'engine', number: '03', en: 'Game development', title: ['游戏开发', 'Game development'], description: ['用游戏引擎搭建场景、实现交互与制作可玩原型。', 'Building scenes, interactions, and playable prototypes in game engines.'], tools: ['Unreal Engine', 'Unity'] },
  { icon: 'code', number: '04', en: 'Programming', title: ['编程', 'Programming'], description: ['计算机科学辅修与项目实践中的编程语言。', 'Programming languages from my Computer Science minor and project practice.'], tools: ['Python', 'C++'] },
  { icon: 'media', number: '05', en: 'Media production', title: ['视频制作', 'Media production'], description: ['用于游戏视频剪辑、作品展示与内容创作。', 'Editing game videos, project presentations, and creative content.'], tools: ['Premiere Pro', 'CapCut'] },
  { icon: 'language', number: '06', en: 'Languages & office', title: ['语言与办公', 'Languages & office'], description: ['中文（母语）· 英语（流利）。', 'Chinese (native) · English (fluent).'], tools: ['Microsoft Word', 'Excel', 'PowerPoint'] },
];
