# Campus Atlas · 校园数字孪生

基于图纸重建的 Blender 校园概念模型，使用 Three.js / GLTFLoader 渲染为可交互三维网页，支持鼠标旋转、缩放、平移、俯视切换、地点定位、昼夜模式与移动端布局。

**线上地址：** https://wekyjay.github.io/campus-digital-twin/

## 本地使用

```bash
npm ci
npm run check
npm run dev
```

构建：`npm run build`。静态文件输出到 `dist/`，包括 `models/campus.glb`，无需后端。Vite 的 `base: './'` 支持 GitHub Pages 的项目子目录。

如需更新模型：在父目录用 Blender 打开 `output/campus_digital_twin.blend`，运行 `export_web.py` 重新生成 `web/public/models/campus.glb`，然后重新执行 `npm run check && npm run build`。

## GitHub Pages

`.github/workflows/deploy.yml` 在推送 `main` 后执行检查、构建，使用 GitHub Pages 官方 Actions 发布。仓库需在 Settings → Pages 中把 **Build and deployment / Source** 设为 **GitHub Actions**。

模型对应总图方位与体量，不包含准确地理坐标和建筑高程；不应用于测绘、工程设计或施工。总图及渲染图仅作该项目演示引用，原始图像版权归其权利人所有。Three.js 功能代码采用 MIT 许可；三维模型及原始图纸不因该许可而开放授权。
