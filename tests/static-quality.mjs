import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith(".html"))
  .concat(fs.readdirSync(path.join(root, "admin")).filter((name) => name.endsWith(".html")).map((name) => path.join("admin", name)));
const jsFiles = fs.readdirSync(path.join(root, "js")).filter((name) => name.endsWith(".js")).map((name) => path.join("js", name));
const expectedIntegrity = "sha384-fPWur1rx/DE6YtXP/x0MD6dd90RgnVsz5yX/DIg7CcVAnTBZsENWuIcpvVTM39ti";
const canonicalPages = new Set(["index.html", "intake.html", "schedule.html", "privacy.html", "terms.html"]);
const failures = [];

function fail(file, message) {
  failures.push(file + ": " + message);
}

for (const relativeFile of htmlFiles) {
  const absoluteFile = path.join(root, relativeFile);
  const html = fs.readFileSync(absoluteFile, "utf8");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const idSet = new Set(ids);

  if (!/^<!doctype html>/i.test(html)) fail(relativeFile, "missing HTML5 doctype");
  if (!/<html\s+lang="en"/i.test(html)) fail(relativeFile, "missing English page language");
  if (!/<meta\s+charset="utf-8"/i.test(html)) fail(relativeFile, "missing UTF-8 declaration");
  if (!/<meta\s+name="viewport"/i.test(html)) fail(relativeFile, "missing responsive viewport");
  if (!/<meta\s+name="description"/i.test(html)) fail(relativeFile, "missing page description");
  if (!/<meta\s+name="referrer"\s+content="strict-origin-when-cross-origin"/i.test(html)) fail(relativeFile, "missing referrer policy");
  if (!/<meta\s+http-equiv="Content-Security-Policy"/i.test(html)) fail(relativeFile, "missing content security policy");
  if (canonicalPages.has(relativeFile) && !/<link\s+rel="canonical"\s+href="https:\/\/hiquant\.co\//i.test(html)) fail(relativeFile, "missing production canonical URL");
  if ((html.match(/<main\b/gi) || []).length !== 1) fail(relativeFile, "must contain exactly one main landmark");
  if ((html.match(/<h1\b/gi) || []).length !== 1) fail(relativeFile, "must contain exactly one h1");
  if (ids.length !== idSet.size) fail(relativeFile, "contains duplicate IDs");
  if (relativeFile.startsWith("admin") && !/<meta\s+name="robots"\s+content="noindex, nofollow"/i.test(html)) fail(relativeFile, "admin page must be noindex");

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|#)/i.test(reference)) continue;
    const localPath = reference.split(/[?#]/)[0];
    if (localPath && !fs.existsSync(path.resolve(path.dirname(absoluteFile), localPath))) fail(relativeFile, "broken local reference " + reference);
  }

  for (const match of html.matchAll(/aria-describedby="([^"]+)"/g)) {
    for (const referencedId of match[1].trim().split(/\s+/)) {
      if (!idSet.has(referencedId)) fail(relativeFile, "aria-describedby targets missing ID " + referencedId);
    }
  }
  for (const match of html.matchAll(/<label\b[^>]*\bfor="([^"]+)"[^>]*>/g)) {
    if (!idSet.has(match[1])) fail(relativeFile, "label targets missing control " + match[1]);
  }
  for (const match of html.matchAll(/<img\b([^>]*)>/g)) {
    if (!/\balt="[^"]*"/.test(match[1])) fail(relativeFile, "image is missing alt text");
    if (!/\bwidth="\d+"/.test(match[1]) || !/\bheight="\d+"/.test(match[1])) fail(relativeFile, "image is missing intrinsic dimensions");
  }
  for (const match of html.matchAll(/<button\b([^>]*)>/g)) {
    if (!/\btype="(?:button|submit|reset)"/.test(match[1])) fail(relativeFile, "button is missing an explicit type");
  }

  const supabaseScript = html.match(/<script\b[^>]*src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2\.111\.0\/dist\/umd\/supabase\.min\.js"[^>]*>/);
  if (supabaseScript) {
    if (!supabaseScript[0].includes('integrity="' + expectedIntegrity + '"')) fail(relativeFile, "Supabase script integrity does not match the pinned file");
    if (!supabaseScript[0].includes('crossorigin="anonymous"')) fail(relativeFile, "integrity-locked script is missing crossorigin");
  }
}

for (const relativeFile of jsFiles) {
  const source = fs.readFileSync(path.join(root, relativeFile), "utf8");
  if (/\.innerHTML\s*=|insertAdjacentHTML\s*\(|document\.write\s*\(|\beval\s*\(/.test(source)) fail(relativeFile, "contains an unsafe HTML or code execution sink");
}

const browserConfig = fs.readFileSync(path.join(root, "js", "config.js"), "utf8");
if (/sb_secret_|service_role/i.test(browserConfig)) fail("js/config.js", "contains a secret or service-role key");

const scheduleSource = fs.readFileSync(path.join(root, "js", "schedule.js"), "utf8");
if (!/typeof control\.minLength !== ["']number["']/.test(scheduleSource)) {
  fail("js/schedule.js", "text minlength validation must exclude controls such as select elements");
}

for (const requiredFile of [".nojekyll", "404.html", "robots.txt", "sitemap.xml", path.join("assets", "images", "og-hiquant.png")]) {
  if (!fs.existsSync(path.join(root, requiredFile))) fail(requiredFile, "missing production publication asset");
}

const customDomain = fs.readFileSync(path.join(root, "CNAME"), "utf8").trim();
if (customDomain !== "hiquant.co") fail("CNAME", "must contain the confirmed production domain");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Static quality checks passed for " + htmlFiles.length + " HTML pages and " + jsFiles.length + " JavaScript files.");
