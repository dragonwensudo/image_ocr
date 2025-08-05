# 智能图片识别器

一个功能强大的纯前端图片内容识别项目，支持一键识别图片中的物体、场景、文字等内容。

## 🌟 功能特性

- **🖼️ 图片上传**: 支持拖拽上传和点击选择，兼容多种图片格式
- **🔍 智能识别**: 一键识别图片内容，包括物体检测、场景分析、文字识别
- **📊 详细分析**: 提供置信度、检测对象数量、颜色分析等详细信息
- **🎨 现代UI**: 美观的渐变设计和流畅的交互动画
- **📱 响应式**: 完美适配桌面和移动设备
- **⚙️ 多API支持**: 支持OpenAI Vision、Google Vision、Azure Vision等多种API
- **🔒 隐私保护**: API密钥仅在本地存储，不会上传到服务器

## 🚀 快速开始

### 方法一：直接使用（推荐）

1. 下载项目文件到本地
2. 用浏览器打开 `index.html` 文件
3. 开始使用图片识别功能！

### 方法二：本地服务器

```bash
# 如果你有Python
python -m http.server 8000

# 或者如果你有Node.js
npx serve .

# 然后在浏览器中访问 http://localhost:8000
```

## 📖 使用说明

### 基础使用

1. **上传图片**: 
   - 点击"选择图片"按钮
   - 或者直接拖拽图片到上传区域
   - 支持 JPG、PNG、GIF、WebP 格式

2. **一键识别**:
   - 上传后点击"一键识别"按钮
   - 等待分析完成（通常几秒钟）
   - 查看详细的识别结果

3. **查看结果**:
   - **图片描述**: 主要内容的文字描述
   - **检测对象**: 识别到的物体及置信度
   - **文字识别**: 图片中的文字内容（如果有）
   - **场景分析**: 场景类型和环境信息
   - **分析详情**: 置信度、颜色、氛围等

### API配置

项目支持多种图片识别API：

#### 演示模式（默认）
- 无需配置，使用模拟数据
- 适合测试和演示

#### OpenAI Vision API
1. 获取OpenAI API Key
2. 在设置中选择"OpenAI Vision API"
3. 输入API密钥并保存

#### Google Vision API
1. 在Google Cloud Console创建项目
2. 启用Vision API并获取API Key
3. 在设置中选择"Google Vision API"
4. 输入API密钥并保存

#### Azure Vision API
1. 在Azure Portal创建Computer Vision资源
2. 获取API密钥和端点
3. 在设置中选择"Azure Vision API"
4. 输入API密钥并保存

## 🛠️ 技术栈

- **前端**: 纯HTML5 + CSS3 + JavaScript
- **样式**: CSS Grid + Flexbox + 自定义动画
- **图标**: Font Awesome 6
- **API**: 支持多种视觉识别API

## 📁 项目结构

```
transform/
├── index.html          # 主页面文件
├── style.css           # 样式文件
├── script.js           # JavaScript逻辑
└── README.md           # 项目说明
```

## 🎨 界面预览

### 主要功能区域

- **头部**: 项目标题和功能介绍
- **上传区**: 拖拽式文件上传界面
- **预览区**: 图片预览和操作按钮
- **结果区**: 多卡片式结果展示
- **设置区**: API配置面板

### 设计特色

- 现代渐变背景
- 卡片式布局
- 流畅的hover动画
- 响应式设计
- 友好的交互反馈

## 🔧 自定义配置

### 修改API端点

在 `script.js` 中找到相应的API函数，修改端点URL：

```javascript
// Azure API示例
const endpoint = 'YOUR_AZURE_ENDPOINT'; // 修改为你的端点
```

### 添加新的识别服务

1. 在 `script.js` 中添加新的分析函数
2. 在设置面板的select中添加新选项
3. 在 `analyzeImage()` 函数中添加相应的case

### 自定义样式

修改 `style.css` 中的CSS变量：

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #f093fb;
}
```

## 📊 支持的图片格式

- **JPEG/JPG**: 标准照片格式
- **PNG**: 支持透明背景
- **GIF**: 静态GIF图片
- **WebP**: 现代高效格式

## 🔒 隐私和安全

- **本地处理**: 所有设置和临时数据仅存储在本地
- **API安全**: 支持的API都使用HTTPS加密传输
- **无服务器**: 纯前端应用，无需担心服务器安全问题
- **开源透明**: 所有代码公开，可自行审查

## 🚨 注意事项

1. **API配额**: 第三方API通常有使用限制，请注意配额
2. **文件大小**: 建议图片文件小于10MB以获得最佳性能
3. **网络连接**: 使用第三方API需要稳定的网络连接
4. **浏览器兼容**: 推荐使用现代浏览器（Chrome、Firefox、Safari、Edge）

## 🔄 更新计划

- [ ] 添加更多AI服务支持
- [ ] 支持批量图片处理
- [ ] 添加结果导出功能
- [ ] 支持视频内容识别
- [ ] 添加多语言支持
- [ ] 优化移动端体验

## 🤝 贡献指南

欢迎提交问题和改进建议！

1. Fork 这个项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- Font Awesome 提供的图标
- 各大AI服务提供商的API支持
- 开源社区的贡献和支持

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [提交问题](https://github.com/your-username/image-analyzer/issues)
- Email: your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！