const fs = require("fs");

const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

if (pkg.main !== "./dist/extension.js") {
  console.log("🔄 Switching main from", pkg.main, "to ./dist/extension.js");
  pkg.main = "./dist/extension.js";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("✅ package.json main updated.");
} else {
  console.log("👍 package.json main already ./dist/extension.js");
}
