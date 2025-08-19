import fse from "fs-extra";
import path from "node:path";
import { pathExistsSync } from "path-exists";
import ejs from "ejs";
import { glob } from "glob";
function getCacheFilePath(targetPath: string, template: any) {
  return path.resolve(targetPath, "node_modules", template.npmName, "template");
}
// 获取插件路径
function getPluginFilePath(targetPath: string, template: any) {
  return path.resolve(
    targetPath,
    "node_modules",
    template.npmName,
    "plugins",
    "index.js"
  );
}
function copyFile(targetPath: string, template: any, installDir: any) {
  //找到模版路径
  const originFile = getCacheFilePath(targetPath, template);
  // 获取文件夹文件信息
  const fileList = fse.readdirSync(originFile);
  fileList.forEach((file) => {
    fse.copySync(`${originFile}/${file}`, `${installDir}/${file}`);
  });
}
async function ejsRender(
  targetPath: string,
  installDir: any,
  template: any,
  selectedTemplate: any
) {
  const {
    template: { ignore },
    name,
  } = selectedTemplate;
  //执行插件
  let apiData = {};
  const pluginsPath = getPluginFilePath(targetPath, template);
  if (pathExistsSync(pluginsPath)) {
  }
  const jsFiles = await glob("**", {
    cwd: installDir,
    nodir: true,
    ignore: [...ignore, "**/node_modules/**"],
  });
  jsFiles.forEach((file) => {
    const filePath = path.resolve(installDir, file);
    ejs.renderFile(
      filePath,
      {
        data: {
          name,
          ...apiData,
        },
      },
      (err, result) => {
        console.log("result------ :>> ", result);
        if (err) {
          console.error("❌ EJS 渲染出错:", err);
        } else {
          //如果成功，则将内容写入到对应的filePath中
          fse.writeFileSync(filePath, result);
        }
      }
    );
  });
}
export async function installTemplate(selectedTemplate: any, baseDir: string) {
  const force = true;
  const { targetPath, name, template } = selectedTemplate;
  fse.ensureDirSync(targetPath);
  const installDir = path.resolve(`${baseDir}/${name}`);
  if (pathExistsSync(installDir)) {
    if (!force) {
      console.error(`当前目录下已经存在${installDir}文件夹`);
      return;
    } else {
      fse.removeSync(installDir);
      fse.ensureDirSync(installDir);
    }
  } else {
    fse.ensureDirSync(installDir);
  }
  //从targetPath中拷贝文件
  copyFile(targetPath, template, installDir);
  //对模版进行ejs渲染
  // await ejsRender(targetPath, installDir, template, selectedTemplate);
}
