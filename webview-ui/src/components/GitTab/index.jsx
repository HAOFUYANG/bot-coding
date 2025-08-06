import React, { useState, useEffect } from "react";
import { vscodeApi } from "@/utils/message";
const GitTab = () => {
  useEffect(() => {
    vscodeApi.postMessage({
      command: "gitActions.init",
    });
    const handle = (event) => {
      const { type, payload } = event.data;
      console.log("type,payload", type);
      if (type === "gitActions.init") {
        console.log("payload", payload);
      }
    };
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, []);
  return <div style={{ padding: 0 }}></div>;
};

export default GitTab;
