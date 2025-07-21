import React from "react";
import {
  Typography,
  Collapse,
  theme,
  Form,
  Input,
  Select,
  Button,
  message,
} from "antd";
import { vscodeApi } from "@/utils/message";
const { Option } = Select;

const templateOptions = [
  { label: "Vue-Arco-Vite模版", value: "template-vue-arco-vite" },
  { label: "Vue3模版", value: "template-vue" },
  { label: "React模版", value: "template-react" },
];

const ToolsTab = () => {
  const [form] = Form.useForm();
  const { token } = theme.useToken();
  const onFinish = (values) => {
    vscodeApi.postMessage({
      command: "happyCli.init",
      params: values,
    });
    message.success("正在创建项目...");
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
              <Typography.Text strong style={{ color: token.colorPrimary }}>
                脚手架 Happy Cli
              </Typography.Text>
            ),
            children: (
              <Form form={form} layout="vertical" onFinish={onFinish}>
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
                  <Select options={templateOptions} placeholder="请选择" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    创建项目
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ToolsTab;
