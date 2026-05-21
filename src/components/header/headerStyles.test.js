import fs from "fs";
import path from "path";

const rootDir = path.resolve(__dirname, "../../..");
const readProjectFile = (relativePath) =>
  fs.readFileSync(path.join(rootDir, relativePath), "utf8");

const headerScss = () => readProjectFile("src/components/header/header.scss");

test("desktop submenu keeps a hover bridge from nav item to dropdown", () => {
  const scss = headerScss();

  expect(scss).toMatch(/\.nav-item\s*\{[\s\S]*?&::before\s*\{[\s\S]*?top:\s*100%[\s\S]*?height:\s*\$header-height/s);
});

test("desktop submenu aligns with shrink header heights", () => {
  const scss = headerScss();

  expect(scss).toMatch(/\.header\.shrink\s+\.header__nav\.desktop\s+\.nav-submenu\s*\{\s*top:\s*\$header-shrink-height;/);
  expect(scss).toMatch(/@media \(min-width: 1920px\)[\s\S]*?\.header\.shrink\s+\.header__nav\.desktop\s+\.nav-submenu\s*\{\s*top:\s*70px;/);
  expect(scss).toMatch(/@media \(min-width: 768px\) and \(max-width: 1023px\)[\s\S]*?\.header\.shrink\s+\.header__nav\.desktop\s+\.nav-submenu\s*\{\s*top:\s*60px;/);
});
