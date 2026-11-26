// The previous key also stored the old automatic Chinese default. Start this
// version in English, then remember choices made with the language switch.
export const LANGUAGE_STORAGE_KEY = 'qz-language-v2';

export const projectTitlesZh = {
  'one-more-move': '未落定',
  'time-puzzle': '昼夜切换解谜关卡',
  infiltration: '潜入与逃脱关卡',
  'neon-alley': '霓虹巷道：赛博朋克场景',
  'potion-shop-sign': '风格化药水店招牌',
  'sci-fi-blaster': '风格化科幻枪械',
  'stylized-props': '风格化道具',
  'character-animation': '角色动画集',
  'character-rigging': '游戏角色绑定与动画',
  'water-fire-monsters': '游戏怪物设计｜水与火',
  'cs2-valorant': '《反恐精英 2》与《无畏契约》分析',
  'valorant-mobile': '《无畏契约》手游分析（中文版）',
  'elemental-magic': '元素魔法',
};

export function projectTitle(project, t) {
  return t(projectTitlesZh[project.id] || project.title, project.title);
}

// Product names without a localized name retain their official spelling.
export const termsZh = {
  Narrative: '叙事', Puzzle: '解谜', Blueprints: '蓝图开发',
  'Level Design': '关卡设计', 'Day / Night': '昼夜切换', Traversal: '空间移动', Blockout: '白盒',
  '3D Modeling': '3D 建模', PBR: '基于物理的渲染', 'Trim Sheets': '条带纹理',
  Stylized: '风格化', Texturing: '材质制作', Animation: '动画', Character: '角色', Motion: '动作',
  Rigging: '绑定', 'Creature Design': '生物设计', Sketch: '草图', Concept: '概念设计',
  'Game Analysis': '游戏分析', HCI: '人机交互', Research: '研究', Mobile: '移动端',
  'Market Positioning': '市场定位', 'Card Game': '卡牌游戏', Systems: '系统设计', Playtesting: '游玩测试',
  'Game Mechanics': '游戏机制', 'Narrative Design': '叙事设计', Prototyping: '原型开发',
  'Unreal Engine': '虚幻引擎', CapCut: 'CapCut（剪映国际版）',
  'Tencent Games': '腾讯游戏', 'Michigan State University': '密歇根州立大学',
};

export function translateTerm(value, t) {
  return t(termsZh[value] || value, value);
}

export function editorErrorMessage(message, fallback) {
  const known = {
    'image-type': ['请选择 JPG、PNG 或 WebP 图片。', 'Choose a JPG, PNG, or WebP image.'],
    'image-size': ['图片请小于 20 MB。', 'Please use an image smaller than 20 MB.'],
  };
  if (known[message]) return known[message];
  // Local editor responses carry both languages, separated by this delimiter.
  if (typeof message === 'string' && /[\u3400-\u9fff]/.test(message) && message.includes(' / ')) {
    const split = message.indexOf(' / ');
    return [message.slice(0, split), message.slice(split + 3)];
  }
  return fallback;
}
