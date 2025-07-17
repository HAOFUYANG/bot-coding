import { Modal, InputNumber, Button, Form } from "antd";

const SettingsModal = ({
  visible,
  onClose,
  onConfirm,
  maxLines,
  setMaxLines,
  acceptRatio,
  setAcceptRatio,
  disabled,
}) => {
  return (
    <Modal
      title="设置生成参数"
      open={visible}
      onCancel={onClose}
      footer={null}
      maskClosable={false}
    >
      <Form layout="vertical">
        <Form.Item label="最大行数">
          <InputNumber
            min={10}
            value={maxLines}
            onChange={(val) => setMaxLines(val)}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item label="采纳率 (%)">
          <InputNumber
            min={0}
            max={100}
            value={acceptRatio}
            onChange={(val) => setAcceptRatio(val)}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={onConfirm} disabled={disabled} block>
            确定
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SettingsModal;
