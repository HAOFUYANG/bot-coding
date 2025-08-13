import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@ant-design/v5-patch-for-react-19";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
