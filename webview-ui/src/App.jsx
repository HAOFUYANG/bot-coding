import React, { useState, useEffect } from "react";
import {
  SyncOutlined,
  OrderedListOutlined,
  FormOutlined,
  ScanOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Flex,
  Button,
  Tabs,
  Table,
  ConfigProvider,
  message,
  Popconfirm,
} from "antd";
import "./style/antd.css";
const vscodeApi = acquireVsCodeApi();

const botFiles = [
  { index: "1", time: "2022-02-01", content: "abcdefg123" },
  { index: "2", time: "2022-02-01", content: "hijklmn456" },
];

// tab1---columns
const columns = [
  { title: "序号", dataIndex: "count", key: "count", width: 50 },
  {
    title: "开始行",
    dataIndex: "prevLineCount",
    key: "prevLineCount",
    width: 70,
  },
  {
    title: "结束行",
    dataIndex: "newLineCount",
    key: "newLineCount",
    width: 80,
  },
  { title: "内容", dataIndex: "content", key: "content", width: 200 },
];
//tab2---columns
const fileColumns = (onOpen, onDelete) => [
  { title: "文件名", dataIndex: "name", key: "name", width: 200 },
  { title: "路径", dataIndex: "path", key: "path" },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    width: 100,
    render: (_, record) => (
      <Flex gap="small">
        <Button
          size="small"
          color="primary"
          variant="text"
          onClick={() => onOpen(record)}
        >
          查看
        </Button>
        <Popconfirm
          title="确定删除该文件吗？"
          onConfirm={() => onDelete(record)}
        >
          <Button size="small" color="danger" variant="text">
            删除
          </Button>
        </Popconfirm>
      </Flex>
    ),
  },
];
const App = () => {
  const [acceptedContentDetails, setAcceptedContentDetails] = useState([]);
  const [botFiles, setBotFiles] = useState([]);
  useEffect(() => {
    const handler = (event) => {
      console.log("event-------- :>> ", event);
      const { type, acceptedContentDetails, botFiles } = event.data;
      if (type === "UPDATE") {
        setAcceptedContentDetails(acceptedContentDetails);
      }
      if (type === "BOT_FILES") {
        setBotFiles(botFiles);
        message.success("文件列表已更新");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);
  //命令操作
  const [startLoading, setStartLoading] = useState(false);
  const handleStartCoding = () => {
    vscodeApi.postMessage({ command: "coding.start" });
    setStartLoading(true);
    message.success("已发送 Start 命令");
  };

  const handleStopCoding = () => {
    vscodeApi.postMessage({ command: "coding.stop" });
    setStartLoading(false);
    message.warning("已发送 Stop 命令");
  };

  //更新当前项目文件信息
  const handleRefreshFiles = () => {
    vscodeApi.postMessage({ command: "scanBotFiles" });
    message.info("正在扫描当前项目文件...");
  };
  const handleOpenFile = (file) => {
    vscodeApi.postMessage({ command: "openBotFile", path: file.path });
  };
  const handleDeleteFile = (file) => {
    vscodeApi.postMessage({ command: "deleteBotFile", path: file.path });
  };
  return (
    <ConfigProvider
      theme={{
        token: { borderRadius: 2 },
        components: {
          Tabs: {
            inkBarColor: "var(--vscode-editor-foreground)",
            itemActiveColor: "var(--vscode-editor-foreground)",
            itemColor: "var(--vscode-disabledForeground)",
          },
        },
      }}
    >
      <div className="container">
        <Flex gap="small" align="flex-start" vertical>
          <Flex gap="small">
            <Button
              loading={startLoading ? { icon: <SyncOutlined spin /> } : false}
              iconPosition={"end"}
              type="primary"
              onClick={handleStartCoding}
            >
              Start
            </Button>
            <Button type="primary" danger onClick={handleStopCoding}>
              Stop
            </Button>
          </Flex>
        </Flex>

        <Tabs
          defaultActiveKey="LOG"
          tabBarStyle={{
            borderBottom: "1px solid var(--vscode-editorGroup-border)",
          }}
          items={[
            {
              key: "LOG",
              label: (
                <>
                  <OrderedListOutlined /> 采纳日志
                </>
              ),
              children: (
                <Table
                  dataSource={acceptedContentDetails}
                  columns={columns}
                  pagination={false}
                  size="small"
                  rowKey="index"
                  className="mt-4"
                />
              ),
            },
            {
              key: "FILE",
              label: (
                <>
                  <FormOutlined /> 文件
                </>
              ),
              children: (
                <>
                  <div style={{ textAlign: "right", marginBottom: 8 }}>
                    <Button
                      type="primary"
                      icon={<ScanOutlined />}
                      onClick={handleRefreshFiles}
                    >
                      Scan
                    </Button>
                  </div>
                  <Table
                    dataSource={botFiles}
                    columns={fileColumns(handleOpenFile, handleDeleteFile)}
                    pagination={false}
                    size="small"
                    rowKey="path"
                    className="mt-4"
                  />
                </>
              ),
            },
          ]}
        />
      </div>
    </ConfigProvider>
  );
};

export default App;
