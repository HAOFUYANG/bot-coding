import { vscodeApi } from "@/utils/message";
import React, { useEffect, useState } from "react";
import { Input, Button, Select, message, Typography } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
const GitTab = () => {
  const [remotes, setRemotes] = useState([]);
  const [selectedRemote, setSelectedRemote] = useState(null);
  const [commitMessage, setCommitMessage] = useState("");
  const [pushResult, setPushResult] = useState("");

  useEffect(() => {
    vscodeApi.postMessage({
      command: "gitActions.init",
    });
    const handle = (event) => {
      console.log("event---");
      const { type, payload } = event.data;
      console.log("type,payload", type);
      //初始化git远程仓库
      if (type === "gitActions.init") {
        console.log("payload", payload);
        setRemotes(payload);
        setSelectedRemote(payload[0] || "");
      }
      //接收git回调
      if (type === "git.commitAndPush") {
        const { err, success } = payload;
        console.log("err", err);
        console.log("success", success);
        setPushResult(err);
        if (success) {
          message.success("Push success!");
        } else {
          message.error("Push failed, check logs");
        }
      }
    };
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []);
  //推送
  const onPush = () => {
    if (!commitMessage) {
      return message.warning("Please input commit message");
    }
    vscodeApi.postMessage({
      command: "gitActions.commitAndPush",
      payload: {
        commitMessage,
        remoteName: selectedRemote,
      },
    });
  };
  return (
    <div style={{ padding: 0 }}>
      <Title level={5}>Git Commit & Push</Title>
      <Select
        style={{ width: "100%", marginBottom: 12 }}
        value={selectedRemote}
        onChange={(val) => setSelectedRemote(val)}
        options={remotes.map((r) => ({ label: r, value: r }))}
        placeholder="Select remote"
      />
      <TextArea
        rows={4}
        placeholder="Enter commit message"
        value={commitMessage}
        onChange={(e) => setCommitMessage(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <Button type="primary" block onClick={onPush}>
        Commit & Push
      </Button>
      <pre style={{ marginTop: 16, maxHeight: 200, overflowY: "auto" }}>
        {pushResult}
      </pre>
    </div>
  );
};

export default GitTab;
