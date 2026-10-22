# 夏越 · 个人主页

一个「黄条卡通名片」风格的单页个人主页：浅色纸底、白色大外框、黄色导航条、粗黑边 + 实心阴影、贴纸与撕纸细节。纯 HTML / CSS / JavaScript，无需安装任何依赖。

## 在电脑上打开

直接双击 `index.html`，或右键 → 用浏览器打开即可。

也可以在本文件夹里启动一个本地服务器（可选，字体与相对路径表现一致）：

```powershell
python -m http.server 8000
# 然后访问 http://localhost:8000
```

## 部署到 GitHub Pages

1. 新建一个仓库，例如 `yuexia-ee.github.io`（用户主页）或任意名字（项目主页）。
2. 把本文件夹中的全部文件推到仓库根目录：

```powershell
git init
git add .
git commit -m "feat: personal homepage"
git branch -M main
git remote add origin https://github.com/yuexia-ee/你的仓库名.git
git push -u origin main
```

3. 仓库 Settings → Pages：Source 选 `Deploy from a branch`，Branch 选 `main` / `root`，保存。
4. 等一两分钟，访问 `https://yuexia-ee.github.io/仓库名/`（用户主页仓库则是 `https://yuexia-ee.github.io/`）。

## 改内容

- 头像：`assets/avatar.jpg`（800×800，换成同名文件即可）。
- 活动证明：`assets/cert-melbourne-music-2026.jpg`、`assets/cert-supra-welcome-2026.jpg`。对应活动详情页展示证书原图。
- 活动详情页：`activities/radio-nihaoma-2026.html`（电台栏目，含小宇宙链接）、`activities/melbourne-music-2026.html`、`activities/supra-welcome-2026.html`，与教育详情页共用 `detail.css`。新增活动时，复制一个详情页、替换文字与图片，再在 `index.html` 的活动列表里加上链接即可。
- 站点像素方块 Logo：`assets/brand-block.svg`，导航与各详情页共用。
- 关于我卡片右上角的三花猫：`assets/cat-sleeping.png`，位置和大小在 `styles.css` 的 `.about-cat` 中调整。
- 教育详情页：`education/usyd-courses.html`（悉尼大学硕士课程，编辑 `course-list`）与 `education/yangzhou-courses.html`（扬州大学广陵学院本科课程，编辑 `course-grid`）。首页点击对应学校标题进入。
- 荣誉奖励：`index.html` 搜索 `honor-grid`，按学年增删列表项即可。
- 文案、链接：`index.html`（搜索姓名、邮箱即可定位）。
- 颜色：`styles.css` 顶部 `:root` 里的 `--yellow / --cyan / --pink / --green`。
- 动效时长、阴影：同一处 `--shadow`、`--ease`。

字体从 Google Fonts 加载，离线时会自动回退到系统字体（PingFang / 微软雅黑），页面仍可正常显示。
