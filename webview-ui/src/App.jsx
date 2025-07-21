import React, { useState, useEffect } from "react";
import { Tabs, ConfigProvider, message } from "antd";
import {
  ThunderboltOutlined,
  CodeOutlined,
  OrderedListOutlined,
  FormOutlined,
} from "@ant-design/icons";
import ControlPanel from "./components/ControlPanel";
import FileTable from "./components/FileTable";
import LogTable from "./components/LogTable";
import SettingsModal from "./components/SettingsModal";
import ToolsTab from "./components/ToolsTab"; // 新增
import "./style/antd.css";
import { vscodeApi } from "./utils/message";

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

  useEffect(() => {
    const handler = (event) => {
      const { type, acceptedContentDetails, botFiles } = event.data;
      if (type === "UPDATE") setAcceptedContentDetails(acceptedContentDetails);
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

  return (
    <ConfigProvider
      theme={{
        token: { borderRadius: 2, fontSize: 12 },
        components: {
          Tabs: {
            inkBarColor: "var(--vscode-editor-foreground)",
            itemActiveColor: "var(--vscode-editor-foreground)",
            itemColor: "var(--vscode-disabledForeground,#fff)",
          },
        },
      }}
    >
      <div className="container">
        <Tabs
          defaultActiveKey="TOOLS"
          items={[
            {
              key: "TOOLS",
              label: (
                <>
                  <ThunderboltOutlined /> 工具
                </>
              ),
              children: <ToolsTab />,
            },
            {
              key: "BARRAGE",
              label: (
                <>
                  <CodeOutlined /> 代码
                </>
              ),
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
            },
          ]}
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
