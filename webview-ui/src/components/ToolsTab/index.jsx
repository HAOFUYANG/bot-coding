import React, { useState, useEffect } from "react";
import {
  Typography,
  theme,
  Form,
  Input,
  Select,
  Button,
  message,
  Space,
  Divider,
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
    { title: "Waiting", description: "准备创建项目模版..." },
    { title: "Waiting", description: "项目模版下载成功" },
    { title: "Waiting", description: "拷贝模版并开始渲染..." },
    { title: "Waiting", description: "模版项目创建成功" },
  ]);
  const [current, setCurrent] = useState(1);
  const [nodeCheckPassedResult, setNodeCheckPassedResult] = useState({
    version: null,
    result: false,
  });
  const [cliInstalled, setCliInstalled] = useState(false);

  const onFinish = (values) => {
    vscodeApi.postMessage({ command: "happyCli.init", params: values });
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
    vscodeApi.postMessage({ command: "happyCli.installHappyCli" });
  };

  const handleCreateHappyApp = () => {
    vscodeApi.postMessage({ command: "happyCli.createHappyApp" });
  };

  return (
    <div style={{ padding: 0 }}>
      <div className="section">
        <div className="section-body">
          <Space direction="vertical" style={{ display: "flex" }}>
            <div className="card">
              <Divider orientation="left" size="small">
                <Text strong>环境检查</Text>{" "}
                <Button type="primary" size="small" onClick={checkEnvironment}>
                  检查
                </Button>
              </Divider>

              <div className="card-body">
                <Paragraph>
                  1. node版本大于18
                  {nodeCheckPassedResult.result ? (
                    <Text type="success" style={{ marginLeft: 8 }} strong>
                      {nodeCheckPassedResult.version}
                    </Text>
                  ) : (
                    <Text type="danger" style={{ marginLeft: 8 }} strong>
                      <ExclamationCircleOutlined /> 当前版本
                      {nodeCheckPassedResult.version} 过低，请升级
                    </Text>
                  )}
                </Paragraph>
              </div>
            </div>

            <div className="card">
              <Divider orientation="left" size="small">
                <Text strong>Create Happy App方式</Text>{" "}
                <Button
                  type="primary"
                  size="small"
                  onClick={handleCreateHappyApp}
                >
                  构建
                </Button>
              </Divider>
              <div className="card-body">
                <Text>无需安装 Happy CLI，使用如下命令，直接构建应用</Text>
                <Paragraph code copyable>
                  npx create-happy-app my-app --type project -p template-vue
                </Paragraph>
                <Paragraph code copyable>
                  npm create happy-app@latest my-app -- --type project -p
                  template-vue
                </Paragraph>
              </div>
            </div>

            <div className="card">
              <Divider orientation="left" size="small">
                <Text strong>Happy Init方式构建</Text>
              </Divider>

              <div className="card-body">
                <Paragraph>
                  {cliInstalled ? (
                    <Text type="success" strong style={{ marginLeft: 8 }}>
                      已安装
                    </Text>
                  ) : (
                    <>
                      <Text type="danger" strong>
                        <ExclamationCircleOutlined /> 未按装 Happy CLI
                      </Text>
                      <Button type="link" onClick={handleInstallHappyCli}>
                        直接安装
                      </Button>
                      或者使用如下命令：
                      <Paragraph code copyable>
                        npm install -g @happy.cli/cli
                      </Paragraph>
                    </>
                  )}
                </Paragraph>

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
                    <Select options={templateOptions} placeholder="请选择" />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      构建
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
              </div>
            </div>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default ToolsTab;
