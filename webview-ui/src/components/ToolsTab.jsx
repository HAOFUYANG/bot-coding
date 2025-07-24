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
  const onFinish = (values) => {
    vscodeApi.postMessage({
      command: "happyCli.init",
      params: values,
    });
    message.success("正在创建项目...");
  };
  useEffect(() => {
    const handler = (event) => {
      console.log("event :>> ", event);
      const { type, payload } = event.data;
      if (type === "happyCli.init") {
        const { current, stepDetails } = payload;
        setCurrent(current);
        setSteps(stepDetails);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);
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
                使用Happy Cli
              </Text>
            ),
            children: (
              <>
                <Space direction="vertical" style={{ display: "flex" }}>
                  <Card title="使用前检查" size="small">
                    <Paragraph>1.需要node版本大于18</Paragraph>
                    <Paragraph>
                      2.当前未安装Happy Cli,请
                      <Button type="link" htmlType="submit">
                        安装
                      </Button>
                      <pre>npm install -g @happy.cli/cli</pre>
                    </Paragraph>
                  </Card>
                  <Card title="创建项目" size="small">
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
