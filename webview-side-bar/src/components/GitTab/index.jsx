import { vscodeApi } from "@/utils/message";
import React, { useEffect, useState, useRef } from "react";
import { Input, Button, Select, message, Typography, Progress } from "antd";
import { useGit } from "@/hooks/useGit";
const { TextArea } = Input;

const GitTab = () => {
  const [remotes, setRemotes] = useState([]);
  const [selectedRemote, setSelectedRemote] = useState(null);
  const [commitMessage, setCommitMessage] = useState("");
  const [pushResult, setPushResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [_projectPath, setProjectPath] = useState(null);

  const remotesRef = useRef([]);
  const projectRef = useRef(null);

  const { getRemotesWithPath, commitAndPush } = useGit();
  const requestGitRemote = async () => {
    const { remotes: newRemotes, cwd } = await getRemotesWithPath();
    const uniqueRemotes = [...new Set(newRemotes)];
    remotesRef.current = uniqueRemotes;
    projectRef.current = cwd;
    setProjectPath(cwd);
    setRemotes(uniqueRemotes);
    setSelectedRemote(uniqueRemotes[0]);
  };

  useEffect(() => {
    //初始化做一次获取
    requestGitRemote();
    // });
    const handle = (event) => {
      const { type, payload } = event.data;
      if (type === "vscode.projectChange") {
        // 当检测到项目路径变化时强制刷新
        const { cwd } = payload;

        if (cwd !== projectRef.current) {
          requestGitRemote();
        }
      }
    };
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []);
  const handleRefresh = () => {
    requestGitRemote();
  };
  //推送
  const onPush = async () => {
    setLoading(true);
    setProgress(30);
    const data = { commitMessage, remoteName: selectedRemote };
    const { err, success } = await commitAndPush(data);
    if (success) {
      setProgress(100);
      setPushResult(success);
      message.success("代码推送成功!");
    } else {
      setProgress(0);
      setPushResult(err);
      message.error("代码推送失败!");
    }
    setLoading(false);
  };
  return (
    <div style={{ padding: 0 }}>
      <div style={{ marginBottom: 12, textAlign: "right" }}>
        <Button type="primary" onClick={handleRefresh}>
          刷新
        </Button>
      </div>

      <Select
        style={{ width: "100%", marginBottom: 12 }}
        value={selectedRemote}
        onChange={(val) => setSelectedRemote(val)}
        options={remotes.map((r) => ({ label: r, value: r }))}
        placeholder="提交仓库选择"
      />
      <TextArea
        rows={4}
        placeholder="提交内容"
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
