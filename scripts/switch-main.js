const fs = require("fs");

const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

if (pkg.main !== "./dist/extension.js") {
  pkg.main = "./dist/extension.js";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
} else {
  console.log("👍 package.json main already ./dist/extension.js");
}
å;
