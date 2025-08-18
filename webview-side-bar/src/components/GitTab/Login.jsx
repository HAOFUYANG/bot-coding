import React, { useState, useEffect, use } from "react";
import { Button, message } from "antd";
import { useUser } from "@/hooks/useUser";
import WorkspaceApi from "@/api/workspaceApi";
import { getVscodeApi } from "@/utils/vscodeApi";

const vscodeApi = getVscodeApi();
const Login = ({ onSuccess }) => {
  const [visible, setVisible] = useState(true);
  const { saveUser } = useUser();
  useEffect(() => {
    // 监听 iframe 的 postMessage
    const handler = async (event) => {
      if (event.data?.type === "4A_LOGIN") {
        try {
          const { code, data } = await WorkspaceApi.getUserInfo();
          if (code === 0) {
            //如果4A成功就调用工作台getUserInfo接口
            setVisible(false);
            saveUser(data);
            message.success("登录成功!");
            onSuccess();
          }
        } catch (error) {
          message.error(error.message);
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleLogin = () => {
    window.parent.postMessage({
      type: "4A_LOGIN",
      data: {
        username: "yang",
        session: "local-session-id-123456",
      },
    });
  };
  if (!visible) return null;

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <Button type="primary" onClick={handleLogin}>
        login
      </Button>{" "}
      <iframe
        src="https://zh-hans.react.dev/reference/react/useCallback"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          zoom: "0.5",
        }}
      />
    </div>
  );
};

export default Login;
