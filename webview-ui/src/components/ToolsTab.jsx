import React from "react";
import { Collapse, theme } from "antd";

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
const ToolsTab = () => {
  const { token } = theme.useToken();
  console.log("token :>> ", token);
  return (
    <div style={{}}>
      <Collapse
        bordered={false}
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
        }}
        size="small"
        items={[
          {
            key: "1",
            label: "脚手架happy-cli",
            children: <p>{text}</p>,
          },
        ]}
      />
    </div>
  );
};

export default ToolsTab;
