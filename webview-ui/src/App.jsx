import React, { useState, useEffect, useMemo } from "react";
import { Tabs, ConfigProvider, message, theme } from "antd";
import {
  OrderedListOutlined,
  FormOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import ControlPanel from "./components/ControlPanel";
import FileTable from "./components/FileTable";
import LogTable from "./components/LogTable";
import SettingsModal from "./components/SettingsModal";
import ToolsTab from "./components/ToolsTab/index"; // 新增
import "./style/antd.css";
import { vscodeApi } from "./utils/message";
const { darkAlgorithm, defaultSeed, getDesignToken } = theme;

const getTokenWithVscodeTheme = () => {
  const bg =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--vscode-editor-background")
      ?.trim() || "#212121";

  // 修改 defaultSeed（基础 token）
  const customSeed = {
    ...defaultSeed,
    colorBgBase: bg,
  };

  // 传入暗黑算法生成完整 token
  const mergedToken = getDesignToken({
    ...customSeed,
    algorithm: [darkAlgorithm],
  });

  return mergedToken;
};

const CodingBarragePanel = ({
  acceptedContentDetails,
  botFiles,
  onOpenFile,
  onDeleteFile,
  onRefreshFile,
  onStart,
  onStop,
  loading,
}) => (
  <>
    <ControlPanel onStart={onStart} onStop={onStop} loading={loading} />
    <Tabs
      defaultActiveKey="LOG"
      items={[
        {
          key: "LOG",
          label: (
            <>
              <OrderedListOutlined /> 采纳日志
            </>
          ),
          children: <LogTable data={acceptedContentDetails} />,
        },
        {
          key: "FILE",
          label: (
            <>
              <FormOutlined /> 文件
            </>
          ),
          children: (
            <FileTable
              data={botFiles}
              onOpen={onOpenFile}
              onDelete={onDeleteFile}
              onRefresh={onRefreshFile}
            />
          ),
        },
      ]}
    />
  </>
);

const App = () => {
  const [acceptedContentDetails, setAcceptedContentDetails] = useState([]);
  const [botFiles, setBotFiles] = useState([]);
  const [maxLines, setMaxLines] = useState(100);
  const [acceptRatio, setAcceptRatio] = useState(25);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const token = useMemo(() => getTokenWithVscodeTheme(), []);
  //添加展示隐藏tab的逻辑
  const [clickCount, setClickCount] = useState(0);
  //初始状态读取当前持久化数据
  const [barrageUnlocked, setBarrageUnlocked] = useState(() => {
    const saved = vscodeApi.getState?.();
    return saved?.barrageUnlocked || false;
  });
  useEffect(() => {
    const handler = (event) => {
      const { type, acceptedContentDetails, botFiles } = event.data;
      if (type === "UPDATE") {
        setAcceptedContentDetails(acceptedContentDetails);
      }
      if (type === "BOT_FILES") {
        setBotFiles(botFiles);
        message.success("文件列表已更新");
      }
      if (type === "GENERATION_STOPPED") {
        setStartLoading(false);
        message.success("文件已生成");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleConfirmSettings = () => {
    setStartLoading(true);
    setConfigModalVisible(false);
    vscodeApi.postMessage({
      command: "coding.start",
      params: { maxGeneratedLines: maxLines, acceptRatio },
    });
  };

  const handleStopCoding = () => {
    vscodeApi.postMessage({ command: "coding.stop" });
    setStartLoading(false);
  };
  const handleSecretClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        const newUnlocked = !barrageUnlocked;
        setBarrageUnlocked(newUnlocked);
        vscodeApi.setState?.({ barrageUnlocked: newUnlocked });
        return 0; // reset clickCount
      }
      return next;
    });
  };
  const extraContent = (
    <div
      style={{
        width: 36,
        height: 24,
        cursor: "pointer",
        opacity: 0, // 看不见
      }}
      onClick={handleSecretClick}
    >
      <EyeInvisibleOutlined />
    </div>
  );
  const tabItems = [
    {
      key: "TOOLS",
      label: <>脚手架</>,
      children: <ToolsTab />,
    },
  ];

  if (barrageUnlocked) {
    tabItems.push({
      key: "BARRAGE",
      label: <>代码</>,
      children: (
        <CodingBarragePanel
          acceptedContentDetails={acceptedContentDetails}
          botFiles={botFiles}
          onOpenFile={(file) =>
            vscodeApi.postMessage({
              command: "openBotFile",
              path: file.path,
            })
          }
          onDeleteFile={(file) =>
            vscodeApi.postMessage({
              command: "deleteBotFile",
              path: file.path,
            })
          }
          onRefreshFile={() => {
            vscodeApi.postMessage({ command: "scanBotFiles" });
            message.info("正在扫描当前项目文件...");
          }}
          onStart={() => setConfigModalVisible(true)}
          onStop={handleStopCoding}
          loading={startLoading}
        />
      ),
    });
  }

  return (
    <ConfigProvider
      componentSize="small"
      theme={{
        token: {
          ...token,
          fontSize: 12,
          size: "small",
        },
        components: {
          Tabs: {
            // inkBarColor: "var(--vscode-editor-foreground)",
            // itemActiveColor: "var(--vscode-editor-foreground)",
            // itemColor: "var(--vscode-disabledForeground,#fff)",
          },
        },
      }}
    >
      <div className="container">
        <Tabs
          size="middle"
          defaultActiveKey="TOOLS"
          type="card"
          tabBarExtraContent={extraContent}
          items={tabItems}
        />
        <SettingsModal
          visible={configModalVisible}
          onClose={() => setConfigModalVisible(false)}
          onConfirm={handleConfirmSettings}
          maxLines={maxLines}
          setMaxLines={setMaxLines}
          acceptRatio={acceptRatio}
          setAcceptRatio={setAcceptRatio}
          disabled={startLoading}
        />
      </div>
    </ConfigProvider>
  );
};

export default App;
