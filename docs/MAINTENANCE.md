# Qiaoxi Zhou Portfolio

React + Vite 个人作品集，黑底与荧光粉紫风格，最大版心 1700px，支持中英文。人物介绍为 Michigan State University 游戏与交互媒体毕业生，辅修计算机科学；保留腾讯与 MSU 经历。

## 浏览网站

本地预览地址：http://127.0.0.1:5173/

```sh
pnpm install
pnpm dev
```

也可使用 `npm install` 和 `npm run dev`。

```sh
pnpm build
pnpm preview
```

生产预览地址：http://127.0.0.1:4173/。`dist/` 可以部署到静态托管服务。当前网站仅在本机运行。

## 喜欢的游戏

主页面板块：http://127.0.0.1:5173/#games 。位于技能和联系方式之间，主页导航中的“喜欢的游戏 / Games I Love”滚动到此处。

收录用户提供的 26 个游戏或系列，按竞技对战、合作冒险、社交推理与派对、叙事与解谜、动作冒险、卡牌与策略、沙盒与开放世界七组直接展示，不使用筛选。糖豆人和胡闹厨房 2 归入社交与派对；云顶之弈归入卡牌与策略；洛克王国按用户确认使用《洛克王国：世界》。桌面采用两列分组，每张缩略图约 100–160px 宽；窄屏分组竖排，组内图片自动换行。所有图片居中完整显示，避免裁掉角色或游戏名称。

- `src/favoriteGames.js`：清单、双语名称、分组和官方链接。
- `src/FavoriteGamesSection.jsx`、`src/favorite-games-section.css`：主页面板块和样式。
- `public/media/games/`：压缩后的官方图片；`sources.json` 记录原始来源。We Were Here 系列使用 Forever 的官方图片，逆转裁判系列使用 Trilogy 的官方图片。
- `games.html` 只保留旧链接跳转，会自动前往 `/#games`，不再显示独立页面。

类型描述不代表个人游玩时长、评分或通关经历。页面不依赖外部图片实时加载。

## 更新图片和链接

按用户要求，网页已移除“编辑作品 / Edit projects”入口，本地预览和正式发布都不显示。图片与链接继续保存在 `public/content/project-media.json`，可修改文件或交由助手更新。新增图片放在 `public/media/projects/`；修改素材后重新运行 `pnpm build`。

缺少封面的项目显示空白图位。缺少链接时仍可查看详情，不显示外链按钮。现有素材和原始文件均保留。

## 作品分类与翻页

共有 13 个已知项目、6 个分类，以及“全部”视图：

| 分类 | 项目 |
| --- | --- |
| 3D 建模 | One More Move、Neon Alley、Stylized Potion Shop Sign、Stylized Sci-Fi Blaster、Stylized Props |
| 动画与绑定 | Character Animation Set、Game Character Rigging and Animation |
| 关卡设计 | One More Move、Time-Shifting Puzzle Level、Infiltrate & Escape Level |
| 草图 | Game Monster Design — Water and Fire |
| 卡牌游戏 | Elemental Magic |
| 游戏分析 | Counter-Strike 2 & VALORANT、VALORANT Mobile Analysis |

“全部”使用展台式轮播：中央大卡片、两侧前后作品、顶部项目滑动条和底部缩略图，每 5.2 秒按分类顺序前进，最后一项循环回第一项。滑动条与当前项目同步，可拖动或使用键盘选择项目。鼠标停留、键盘聚焦、打开项目详情、滚出视野或切换浏览器标签时自动暂停；没有单独的暂停或左右按钮，保留方向键与 Home/End、横向滑动和缩略图点击。减少动态效果模式关闭自动播放并保留手动操作。

具体分类保留左右按钮、底部滑动条和键盘浏览。One More Move 同时归入 3D 建模和关卡设计，在“全部”中只显示一次。

## 动效

接入 React Bits 的 Tilted Card、Spotlight Card、Animated Content、Topography、Shiny Text 和 Glare Hover（JavaScript + CSS 版本）。首页增加动态等高线和标题流光，作品图片增加悬停扫光，保留海报倾斜、技能柔光及滚动淡入。作品展台参考 React Bits Circular Carousel 的环形展示思路，按作品详情、排序、双语及可访问性需求实现为 `ProjectShowcase.jsx`。游戏喜好板块按分组滚动淡入，缩略图使用同款柔光扫过、轻微上浮和分类下划线高亮；保持原有分组、原图比例和完整图片显示。

`src/effects/PortfolioMotion.jsx` 控制强度和输入模式，`src/effects/reactbits/` 保存固定版本。Topography 按需加载，仅在支持 WebGL2 的鼠标设备上运行，并保留静态线条与轻量渐变后备；触屏关闭倾斜和鼠标光效。减少动态效果模式关闭持续动画与自动轮播，键盘操作正常可用。

上游来源与修改记录见 `src/effects/reactbits/SOURCE.md`。许可证全文同时保存在组件目录和 `public/legal/react-bits-license.txt`，随网站构建发布。Animated Content 使用 GSAP。

## 内容维护与翻译

中英文切换覆盖网页标题、导航、各区大标题、项目卡片与详情、标签、技能词条、游戏名称、图片替代文字、页脚和本地编辑器提示。`src/localization.js` 集中维护项目中文名称、通用词条及编辑器错误消息；英文项目名和项目 ID 保持稳定。软件与平台的正式产品名称可保留原名，原始作品图和封面中的文字不重绘。新增可见文字时应提供两种语言，并检查项目弹窗和缺图提示是否随语言切换。

- `src/content.js`：项目标题、分类、正文、经历与技能。新增项目时添加唯一 `id`，选用既有 `category`；分类计数与滚动自动更新。
- 项目的 `resources` 可提供规则、卡牌等额外链接；Elemental Magic 的主入口为 Tabletopia 游玩，详情另有规则文档和卡牌表格两个入口。
- `public/content/project-media.json`：以项目 `id` 对应完整图片 `image`、可选的卡片裁切图 `thumbnail`、外链 `link`；由本地编辑器维护，也可手动修改。
- `public/media/projects/`：本地编辑器生成的封面图片。
- `public/media/portrait.webp`：用户提供照片的 3:4 竖版裁剪。
- `src/styles.css`：主视觉与页面排版。
- `src/gallery.css`：作品滑动浏览、编辑窗口、放大的学校/GPA 信息。
- `src/ProjectGallery.jsx`：分类浏览和展台切换；`src/ProjectCard.jsx`：共用卡片与图片；`src/ProjectShowcase.jsx`、`src/project-showcase.css`：自动轮播展台。
- `src/ProjectEditor.jsx`、`tools/local-editor.js`：仅用于本地的图片与链接编辑。
- `src/ProjectTools.jsx`：项目详情中的软件小图标与悬停/键盘聚焦名称提示。研究方法和创作方向放在 FOCUS 中，避免误当成软件。
- 技能区也复用 `ProjectTools.jsx` 中的软件图标：美术、引擎、剪辑和办公软件显示图标，名称提示放在上方；设计技能、Python、C++ 保留文字标签。
- `public/icons/tools/`：本地软件标识；`sources.json` 记录来源。Unreal Engine、Unity、Blender、PowerPoint 图形来自 Simple Icons；Substance 3D Painter 使用已安装应用的图标，Tabletopia 使用官网图标。产品标识仅用于识别项目所用工具，其商标归相应权利人所有。

新增项目后更新项目资料及媒体配置即可。新的 `image` 和 `link` 可以留空，不需要编造地址。

## 内容与素材说明

事实内容来自用户的 CV、Creative Portfolio List 和作品截图。2026-11-26 按用户指定的 `Qiaoxi_Zhou_CV_2pages.pdf` 更新可对应的项目日期。Water and Fire 按用户确认设为 2024；风格化建模与动画为 2026 年 1–5 月，页面显示 2026。项目卡片与详情顶部不展示项目编号；仅 One More Move 显示年月跨度（2026.05–2026.10），其他项目只显示年份。

头像使用用户本轮提供的本人照片，以脸部和上半身为中心裁剪为 750 × 1000 WebP；没有修改面部或原始照片。首页 One More Move 使用与作品区相同的封面配置，保留倾斜海报框、粉色精选标签和标题区。

One More Move 的现有封面和场景图继续使用。2026-11-26 已接入用户提供的 Neon Alley、药水店路牌、科幻武器、风格化道具、角色绑定、动画集和时间解谜关卡七组图片与 ArtStation 链接。卡片使用单独裁切的横向封面，项目详情按完整比例显示原图内容。其他尚未提供图片的项目继续保留空白图位。

本地编辑器只修改链接时会保留裁切封面；重新上传图片或恢复空白图位时，会清除旧的裁切图引用，避免卡片显示过期图片。最初的项目列表缩略图只用于确认项目名称与分类，本次封面使用后续提供的独立作品图片。

2026-11-26 的后续更新加入了 Infiltrate & Escape、Water and Fire 怪物设计和 CS2 / VALORANT 论文首页图片；卡片使用裁切版本，详情保留完整图。角色绑定项目明确说明使用已有角色模型。

Elemental Magic 已加入用户提供的卡牌总览图。卡片使用横向裁切图，详情显示完整图片，并提供“开始游玩”“查看规则”“查看卡牌”三个独立入口。

网站不引用或播放背景视频，不展示简历中的家庭地址。之前生成的视频与示意图仍保存在媒体目录中，当前页面不使用这些文件。

## 检查

```sh
pnpm test
```

会重新构建，检查分类完整性、照片与毕业身份、筛选、滑动按钮/滚动条/键盘导航、项目弹窗、双语切换、邮箱复制，以及本地编辑器的图片和链接持久保存。保存检查在独立临时目录中运行，不会修改真实作品配置。测试采用 DOM 模拟与本地接口检查，不替代真实浏览器的视觉检查。
