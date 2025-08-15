import React, { useEffect, useState, useRef } from "react";
import { Input, Button, Select, message, Progress, Alert } from "antd";
import { useGit } from "@/hooks/useGit";
const { TextArea } = Input;

const GitTab = () => {
  const [remotes, setRemotes] = useState([]);
  const [sstList, setSstList] = useState([
    "R1234",
    "R1111",
    "R2222",
    "R3333",
    "R4444",
  ]);
  const [selectedSst, setSelectedSst] = useState(null);
  const [selectedRemote, setSelectedRemote] = useState(null);
  const [commitMessage, setCommitMessage] = useState("");
  const [pushResult, setPushResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [_projectPath, setProjectPath] = useState(null);
  const remotesRef = useRef([]);
  const projectRef = useRef(null);
  const { getRemotesWithPath, commitAndPush, projectChange } = useGit();
  const requestGitRemote = async () => {
    const { remotes: newRemotes, cwd } = await getRemotesWithPath();
    const uniqueRemotes = [...new Set(newRemotes)];
    remotesRef.current = uniqueRemotes;
    projectRef.current = cwd;
    message.success("获取仓库列表成功!");
    setProjectPath(cwd);
    setRemotes(uniqueRemotes);
    setSelectedRemote(uniqueRemotes[0]);
  };

  useEffect(async () => {
    //初始化做一次获取
    requestGitRemote();
    // });
    // 订阅变更通知；收到后再拉数据
    const unsubscribe = projectChange(async () => {
      const { cwd } = await getRemotesWithPath();
      console.log("cwd :>> ", cwd);
      if (cwd !== projectRef.current) {
        projectRef.current = cwd;
        // 这里触发你的刷新逻辑
        requestGitRemote();
      }
    });

    return unsubscribe;
  }, []);
  const handleRefresh = () => {
    requestGitRemote();
  };
  //推送
  const onPush = async () => {
    try {
      setPushResult(null);
      setLoading(true);
      setProgress(30);
      if (!selectedSst) {
        throw new Error("请先选择sst");
      }
      const data = { selectedSst, commitMessage, remoteName: selectedRemote };
      const result = await commitAndPush(data);
      const { success, err } = result;
      if (success) {
        setProgress(100);
        message.success("代码推送成功!");
      } else {
        setProgress(0);
        setPushResult(err);
      }
    } catch (error) {
      console.log("error :>> ", error);
      setProgress(0);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
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
        value={selectedSst}
        onChange={(val) => setSelectedSst(val)}
        options={sstList.map((r) => ({ label: r, value: r }))}
        placeholder="选择sst"
      />
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
      {pushResult ? <Alert message={pushResult} type="error" showIcon /> : ""}
    </div>
  );
};

export default GitTab;
