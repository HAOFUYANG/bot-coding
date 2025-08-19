// createTemplateByOptions.js
import { getLatestVersion } from "@happy.cli/utils";
import { homedir } from "node:os";
import path from "node:path";

const TEMP_HOME = ".happy-cli";

const ADD_TEMPLATE = [
  {
    name: "Vue-Arco-Vite模版",
    value: "template-vue-arco-vite",
    npmName: "@happy.cli/vue-arco-vite-template",
    version: "1.0.0",
    ignore: ["index.html", "pnpm-lock.yaml", "pnpm-workspace.yaml"],
  },
  {
    name: "Vue3模版",
    value: "template-vue",
    npmName: "@happy.cli/template-vue",
    version: "1.0.0",
    ignore: [
      "**/src/**",
      "index.html",
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
    ],
  },
  {
    name: "React模版",
    value: "template-react",
    npmName: "@happy.cli/template-react",
    version: "1.0.0",
    ignore: [
      "**/src/**",
      "index.html",
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
    ],
  },
];

//安装缓存目录
function makeTargetPath() {
  return path.resolve(`${homedir()}/${TEMP_HOME}`, "addTemplate");
}

interface CreateTemplateOptions {
  name: string;
  type: string;
  template: string;
}

export async function createTemplateByOptions({
  name,
  type,
  template,
}: CreateTemplateOptions) {
  const selectedTemplate = ADD_TEMPLATE.find((tpl) => tpl.value === template);
  if (!selectedTemplate) {
    throw new Error(`模板 ${template} 不存在`);
  }

  const latestVersion = await getLatestVersion(selectedTemplate.npmName);
  selectedTemplate.version = latestVersion;

  const targetPath = makeTargetPath();

  return {
    type,
    name,
    template: selectedTemplate,
    targetPath,
  };
}
