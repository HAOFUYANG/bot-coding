# Happy Coding Vscode Extension

## 提供了 panel 界面将命令可视化，弱化了命令行的操作

## 项目的通讯能力

- 使用了 cec-client-server
- 参考了https://juejin.cn/post/7325132202970136585#heading-11
- 通过 tsyringe 做依赖注入容器

## 功能

- ✅ 自动生成代码
- ✅ 自动采纳代码
- ✅ 支持最大行数配置
- ✅ 支持自定义采纳命中率
- ✅ 自动保存
- ✅ 内联检测失败自动触发重新检测
- ✅ 采纳数据记录存储
- ✅ 支持当前项目文件扫描，提供删除功能

| 动作                      | 说明                              |
| ------------------------- | --------------------------------- |
| `npm run build:webview`   | vite 构建 webview 到 `media/`     |
| `npm run build:extension` | esbuild 打包 extension 到 `dist/` |
| `npm run build`           | 二合一构建                        |
| `npm run package`         | 完整构建并打包成 `.vsix`          |

## 关于脚手架

### 提供脚手架可视化操作界面

#### 具体能力

- 检查脚手架是否安装
- 一键安装脚手架
- 可视化项目创建
- 自动打开已经创建的项目
- 自动安装依赖（由于插件端会出现用户信任窗口，插件端暂时不支持脚手架安装）

### 关于通讯
