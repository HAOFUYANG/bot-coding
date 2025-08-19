import path from "node:path";
import { pathExistsSync } from "path-exists";
import fse from "fs-extra";
import { execa } from "execa";

function getCacheDir(targetPath: string) {
  return path.resolve(targetPath, "node_modules");
}

function makeCacheDir(targetPath: string) {
  const cacheDir = getCacheDir(targetPath);
  if (!pathExistsSync(cacheDir)) {
    fse.ensureDirSync(cacheDir);
  }
}

async function downloadAddTemplate(targetPath: string, template: any) {
  const { npmName, version } = template;
  const installCommand = "npm";
  const installArgs = ["install", `${npmName}@${version}`];
  const cwd = getCacheDir(targetPath);

  await execa(installCommand, installArgs, { cwd });
}

export async function downloadTemplate(selectedTemplate: any) {
  const { targetPath, template } = selectedTemplate;
  makeCacheDir(targetPath);
  try {
    await downloadAddTemplate(targetPath, template);
  } catch (err) {
    console.error("下载失败的err :>> ", err);
  }
}
