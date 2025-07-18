import React, { useState, useEffect } from "react";
import { Tabs, ConfigProvider, message } from "antd";
import { OrderedListOutlined, FormOutlined } from "@ant-design/icons";
import ControlPanel from "./components/ControlPanel";
import FileTable from "./components/FileTable";
import LogTable from "./components/LogTable";
import SettingsModal from "./components/SettingsModal";
import "./style/antd.css";

const vscodeApi = window.acquireVsCodeApi
  ? window.acquireVsCodeApi()
  : {
      postMessage: (...args) => console.log("[DEV MOCK postMessage]", ...args),
      getState: () => null,
      setState: () => {},
    };

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
        <ControlPanel
          onStart={() => setConfigModalVisible(true)}
          onStop={handleStopCoding}
          loading={startLoading}
        />

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
                  onOpen={(file) =>
                    vscodeApi.postMessage({
                      command: "openBotFile",
                      path: file.path,
                    })
                  }
                  onDelete={(file) =>
                    vscodeApi.postMessage({
                      command: "deleteBotFile",
                      path: file.path,
                    })
                  }
                  onRefresh={() => {
                    vscodeApi.postMessage({ command: "scanBotFiles" });
                    message.info("正在扫描当前项目文件...");
                  }}
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
