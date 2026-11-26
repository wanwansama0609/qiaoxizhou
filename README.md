# Qiaoxi Zhou · 个人作品集

这是网站的完整源码目录，用于 GitHub Desktop 管理，并通过 Cloudflare Pages 发布。

当前本地仓库：`E:\个人网站\QiaoxiZhou`。已连接 GitHub 仓库 [wanwansama0609/QiaoxiZhou](https://github.com/wanwansama0609/QiaoxiZhou)，后续请使用这个子目录进行修改和上传。

网站使用 React + Vite，包含中英文切换、项目自动轮播、项目详情、技能与软件图标、喜欢的游戏及联系方式。

## 上传与发布

详细步骤见 [部署说明](./部署说明.md)。

1. 在 GitHub Desktop 中选择现有仓库 **QiaoxiZhou**。如果尚未添加，使用 **File → Add local repository** 添加 `E:\个人网站\QiaoxiZhou`。
2. 本地修改提交后，点击 **Push origin** 上传。不要再次新建空仓库。
3. Cloudflare Pages 已连接该仓库；每次推送会触发重新构建，使用下表设置。

| 设置 | 内容 |
| --- | --- |
| 框架 | React (Vite) |
| 生产分支 | `main` |
| 构建命令 | `pnpm build` |
| 构建输出目录 | `dist` |
| 根目录 | 留空，使用仓库根目录 |
| 环境变量 | `PNPM_VERSION` = `11.25.0` |

Node.js 版本通过 `.node-version` 固定为 `24.22.3`。如果 Cloudflare 页面另有 Node 版本输入框，也填写此版本。

`node_modules` 和 `dist` 不提交到 GitHub。Cloudflare 会安装依赖并生成 `dist`，无需手动上传构建文件。

## 本地预览

使用 Node.js 24 和 pnpm 11.25.0，在此目录运行：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

打开 `http://127.0.0.1:5173/`。如果旧目录的预览仍占用此地址，可以改用：

```sh
pnpm dev --port 5174
```

构建与检查：

```sh
pnpm test
pnpm preview
```

## 主要文件

| 文件或目录 | 用途 |
| --- | --- |
| `src/` | 页面、内容、翻译和动效 |
| `public/` | 作品图片、游戏封面、软件图标和许可证 |
| `public/content/project-media.json` | 项目图片和链接配置 |
| `tests/` | 功能检查 |
| `tools/local-editor.js` | 本地开发服务辅助功能，生产网站不运行 |
| `docs/MAINTENANCE.md` | 详细内容维护说明 |
| `dist/` | 构建生成的静态网站，已忽略提交 |

原有作品图片、完整图、裁切图、游戏封面和外链均已保留。临时检查截图、抓取记录、辅助 Python 环境和本机依赖不在本目录的上传内容中。

## 素材与第三方代码

React Bits 组件许可证位于 `src/effects/reactbits/LICENSE.txt`，发布副本位于 `public/legal/react-bits-license.txt`。软件图标和游戏图片的来源记录保存在各自目录的 `sources.json` 中。
