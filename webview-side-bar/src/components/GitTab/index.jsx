import { vscodeApi } from "@/utils/message";
import React, { useEffect, useState, useRef } from "react";
import { Input, Button, Select, message, Typography, Progress } from "antd";
const { TextArea } = Input;
const { Title } = Typography;
const GitTab = () => {
  const [remotes, setRemotes] = useState([]);
  const [selectedRemote, setSelectedRemote] = useState(null);
  const [commitMessage, setCommitMessage] = useState("");
  const [pushResult, setPushResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [projectPath, setProjectPath] = useState(null);

  const remotesRef = useRef([]);
  const projectRef = useRef(null);
  const requestGitRemote = async () => {
    vscodeApi.postMessage({ command: "gitActions.getRemotesWithPath" });
  };

  useEffect(() => {
    //初始化做一次获取
    requestGitRemote();

    // vscodeApi.postMessage({
    //   command: "gitActions.init",
    // });
    const handle = (event) => {
      const { type, payload } = event.data;
      //初始化git远程仓库
      if (type === "gitActions.getRemotesWithPath") {
        const { remotes: newRemotes, cwd } = payload;
        const uniqueRemotes = [...new Set(newRemotes)];
        remotesRef.current = uniqueRemotes;
        projectRef.current = cwd;
        setProjectPath(cwd);
        setRemotes(uniqueRemotes);
        setSelectedRemote(uniqueRemotes[0]);
      }
      //接收git回调
      if (type === "gitActions.commitAndPush") {
        const { err, success } = payload;
        console.log("err", err);
        console.log("success", success);
        if (success) {
          setProgress(100);
          setPushResult(payload.success);
          message.success("Push success!");
        } else {
          setProgress(0);
          setPushResult(payload.err);
          message.error("Push failed, check logs");
        }
        setLoading(false);
      }
      if (type === "vscode.projectChange") {
        // 当检测到项目路径变化时强制刷新
        if (cwd !== projectRef.current) {
          requestGitRemote();
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
    setLoading(true);
    setProgress(30);
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
      <Button type="primary" block loading={loading} onClick={onPush}>
        Commit & Push
      </Button>
      <Progress
        percent={progress}
        status={loading ? "active" : progress === 100 ? "success" : "normal"}
        style={{ marginTop: 16 }}
      />
      <pre style={{ marginTop: 16, maxHeight: 200, overflowY: "auto" }}>
        {pushResult}
      </pre>
    </div>
  );
};

export default GitTab;
