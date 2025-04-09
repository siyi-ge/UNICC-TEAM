# 媒体内容分析工具

一个基于React的Web应用，用于分析文本、视频和音频内容，并提供风险评估和内容分类。

## 功能特点

- 支持多种媒体类型分析（文本、视频、音频）
- 使用OpenAI API进行内容分析和风险评估
- 直观的可视化结果展示（图表和表格）
- 本地保存API配置，无需每次重新输入
- 响应式设计，适配不同设备

## 安装与设置

### 前提条件

- Node.js (v14.0.0或更高版本)
- npm (v6.0.0或更高版本)
- OpenAI API密钥

### 安装步骤

1. 克隆仓库
   
```git clone https://github.com/yourusername/media-content-analyzer.git```
```cd media-content-analyzer```


3. 安装依赖
   
```npm install```


5. 启动开发服务器
   
```npm start```


4. 在浏览器中访问 [http://localhost:3000](http://localhost:3000)

## 使用指南

1. 点击右上角的"配置API"按钮，输入您的OpenAI API密钥
2. 选择要分析的媒体类型（文本、视频或音频）
3. 上传相应的文件
4. 点击"分析"按钮
5. 查看分析结果和可视化图表

## API配置

本应用需要OpenAI API密钥才能正常工作。您可以通过以下步骤获取API密钥：

1. 访问 [OpenAI平台](https://platform.openai.com/)
2. 注册或登录您的账户
3. 导航至API密钥页面
4. 创建新的API密钥
5. 将API密钥复制并粘贴到应用的配置界面中

**注意**：您的API密钥将保存在浏览器的本地存储中，不会发送到我们的服务器。

## 支持的文件格式

- 文本：.txt, .doc, .docx, .pdf
- 视频：.mp4, .avi, .mov, .wmv
- 音频：.mp3, .wav, .ogg, .m4a

## 技术栈

- React.js - 前端框架
- Chart.js - 数据可视化
- Axios - API请求
- OpenAI API - 内容分析

## 许可证

本项目采用MIT许可证 - 详情请参阅 [LICENSE](LICENSE) 文件
