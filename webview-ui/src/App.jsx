import React, { useState, useEffect } from "react";
import {
  SyncOutlined,
  OrderedListOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { Flex, Button, Tabs, Table, ConfigProvider, message } from "antd";
import "./style/antd.css";
const vscodeApi = acquireVsCodeApi();

const codeDetailTable2 = [
  { index: "1", time: "2022-02-01", content: "abcdefg123" },
  { index: "2", time: "2022-02-01", content: "hijklmn456" },
];

// columns
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

const App = () => {
  const [acceptedContentDetails, setAcceptedContentDetails] = useState([]);
  useEffect(() => {
    const handler = (event) => {
      console.log("event-------- :>> ", event);
      const { type, acceptedContentDetails } = event.data;
      if (type === "UPDATE") {
        setAcceptedContentDetails(acceptedContentDetails);
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
                <Table
                  dataSource={codeDetailTable2}
                  columns={columns}
                  pagination={false}
                  size="small"
                  rowKey="index"
                  className="mt-4"
                />
              ),
            },
          ]}
        />
      </div>
    </ConfigProvider>
  );
};

export default App;
