import { Button, Flex } from "antd";
import { SyncOutlined } from "@ant-design/icons";

const ControlPanel = ({ onStart, onStop, loading }) => (
  <Flex gap="small" align="flex-start" vertical>
    <Flex gap="small">
      <Button
        loading={loading ? { icon: <SyncOutlined spin /> } : false}
        iconPosition={"end"}
        type="primary"
        onClick={onStart}
      >
        开始
      </Button>
      <Button type="primary" danger onClick={onStop}>
        停止
      </Button>
    </Flex>
  </Flex>
);

export default ControlPanel;
