import path from "node:path";
import { pathExistsSync } from "path-exists";
import fse from "fs-extra";
import ejs from "ejs";
import { glob } from "glob";

export async function installTemplateVSCode(selectedTemplate: any, installRoot: string, opts: { force?: boolean } = {}) {
  const { force = false } = opts;
  const { targetPath, name, template } = selectedTemplate;
  const installDir = path.resolve(installRoot, name);

  if (pathExistsSync(installDir)) {
    if (!force) {
      throw new Error(`目录 ${installDir} 已存在`);
    } else {
      fse.removeSync(installDir);
    }
  }

  fse.ensureDirSync(installDir);

  // 1. 复制模板文件
  const originFile = path.resolve(targetPath, "node_modules", template.npmName, "template");
  fse.copySync(originFile, installDir);

  // 2. 执行 EJS 渲染
  const jsFiles = await glob("**", {
    cwd: installDir,
    nodir: true,
    ignore: [...(template.ignore || []), "**/node_modules/**"],
  });

  for (const file of jsFiles) {
    const filePath = path.resolve(installDir, file);
    const content = await ejs.renderFile(filePath, {
      data: { name },
    });
    fse.writeFileSync(filePath, content);
  }

  return installDir;
}
