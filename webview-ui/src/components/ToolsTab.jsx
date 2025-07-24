import React, { useState, useEffect } from "react";
import {
  Typography,
  Collapse,
  theme,
  Form,
  Input,
  Select,
  Button,
  message,
  Card,
  Space,
  Steps,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { vscodeApi } from "@/utils/message";
const { Option } = Select;
const { Paragraph, Text } = Typography;
const templateOptions = [
  { label: "Vue-Arco-Vite模版", value: "template-vue-arco-vite" },
  { label: "Vue3模版", value: "template-vue" },
  { label: "React模版", value: "template-react" },
];

const ToolsTab = () => {
  const [form] = Form.useForm();
  const { token } = theme.useToken();
  const [steps, setSteps] = useState([
    {
      title: "Waiting",
      description: "准备创建项目模版...",
    },
    {
      title: "Waiting",
      description: "项目模版下载成功",
    },
    {
      title: "Waiting",
      description: "拷贝模版并开始渲染...",
    },
    {
      title: "Waiting",
      description: "模版项目创建成功",
    },
  ]);
  const [current, setCurrent] = useState(1);
  const [nodeCheckPassedResult, setNodeCheckPassedResult] = useState({
    version: null,
    result: false,
  });
  const [cliInstalled, setCliInstalled] = useState(false);
  const onFinish = (values) => {
    vscodeApi.postMessage({
      command: "happyCli.init",
      params: values,
    });
    message.success("正在创建项目...");
  };
  useEffect(() => {
    const handler = (event) => {
      const { type, payload } = event.data;
      if (type === "happyCli.init") {
        const { current, stepDetails } = payload;
        setCurrent(current);
        setSteps(stepDetails);
      }
      if (type === "happyCli.checkEnvironment") {
        const { nodeVersionCheckResult, cliInstalled } = payload;
        console.log("nodeVersionCheckResult :>> ", nodeVersionCheckResult);
        setNodeCheckPassedResult(nodeVersionCheckResult);
        setCliInstalled(cliInstalled);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);
  const checkEnvironment = () => {
    vscodeApi.postMessage({ command: "happyCli.checkEnvironment" });
  };
  const handleInstallHappyCli = () => {
    vscodeApi.postMessage({ command: "happyCli.installHappyCli " });
  };
  return (
    <div style={{}}>
      <Collapse
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
        }}
        activeKey={["1"]}
        size="small"
        items={[
          {
            key: "1",
            label: (
              <Text strong style={{ color: token.colorPrimary }}>
                使用happy-cli
              </Text>
            ),
            children: (
              <>
                <Space direction="vertical" style={{ display: "flex" }}>
                  <Card
                    title="使用前检查"
                    size="small"
                    hoverable={true}
                    extra={
                      <Button
                        type="primary"
                        size="small"
                        onClick={checkEnvironment}
                      >
                        检查
                      </Button>
                    }
                  >
                    <Paragraph>
                      1.node版本大于18
                      {nodeCheckPassedResult.result ? (
                        <Text type="success" style={{ marginLeft: 8 }} strong>
                          {nodeCheckPassedResult.version}
                        </Text>
                      ) : (
                        <Text type="danger" style={{ marginLeft: 8 }} strong>
                          <ExclamationCircleOutlined /> 当前版本
                          {nodeCheckPassedResult.version}过低，请升级
                        </Text>
                      )}
                    </Paragraph>
                    <Paragraph>
                      2.happy-cli
                      {cliInstalled ? (
                        <Text type="success" strong style={{ marginLeft: 8 }}>
                          已安装
                        </Text>
                      ) : (
                        <>
                          <Text type="danger" strong>
                            未安装
                          </Text>{" "}
                          请
                          <Button type="link" onClick={handleInstallHappyCli}>
                            安装
                          </Button>
                          或<pre>npm install -g @happy.cli/cli</pre>
                        </>
                      )}
                    </Paragraph>
                  </Card>
                  <Card title="创建项目" size="small" hoverable={true}>
                    <Form
                      form={form}
                      size="small"
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 14 }}
                      layout="horizontal"
                      onFinish={onFinish}
                    >
                      <Form.Item
                        name="type"
                        label="初始化类型"
                        rules={[{ required: true }]}
                        initialValue="project"
                      >
                        <Select>
                          <Option value="project">项目</Option>
                          <Option value="page">页面</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name="name"
                        label="项目名称"
                        rules={[{ required: true, message: "请输入项目名称" }]}
                        initialValue="my-app-vue"
                      >
                        <Input placeholder="例如 my-app" />
                      </Form.Item>
                      <Form.Item
                        name="template"
                        label="模板选择"
                        rules={[{ required: true, message: "请选择模板" }]}
                        initialValue="template-vue-arco-vite"
                      >
                        <Select
                          options={templateOptions}
                          placeholder="请选择"
                        />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" htmlType="submit">
                          创建项目
                        </Button>
                      </Form.Item>
                    </Form>
                    <Steps
                      direction="vertical"
                      size="small"
                      current={current}
                      items={steps.map((step) => ({
                        title: step.title,
                        description: step.description,
                      }))}
                    />
                  </Card>
                </Space>
              </>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ToolsTab;
