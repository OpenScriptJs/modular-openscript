#!/usr/bin/env node

/**
 * create-ojs-app
 * CLI tool to scaffold new OpenScript projects
 * Similar to create-react-app, create-vue
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, "green");
}

function logError(message) {
  log(`✗ ${message}`, "red");
}

function logInfo(message) {
  log(message, "cyan");
}

async function createProject(projectName, template = "basic") {
  const projectPath = path.join(process.cwd(), projectName);

  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    logError(`Directory ${projectName} already exists!`);
    process.exit(1);
  }

  log("\n🚀 Creating new OpenScript project...\n", "bright");

  // Create project directory
  fs.mkdirSync(projectPath, { recursive: true });
  logSuccess(`Created directory: ${projectName}`);

  // Get template path
  const templatesDir = path.join(__dirname, "templates");
  const templatePath = path.join(templatesDir, template);

  if (!fs.existsSync(templatePath)) {
    logError(`Template "${template}" not found!`);
    log("\nAvailable templates:", "cyan");
    log("  basic      - Basic OpenScript project (default)", "cyan");
    log("  tailwind   - Project with TailwindCSS integration", "cyan");
    log("  bootstrap  - Project with Bootstrap 5 integration\n", "cyan");
    fs.rmdirSync(projectPath);
    process.exit(1);
  }

  // Copy template files
  logInfo("Copying template files...");
  await copyDirectory(templatePath, projectPath);
  logSuccess("Template files copied");

  // Create package.json
  const packageJson = {
    name: projectName,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    dependencies: {
      "modular-openscriptjs": "latest",
    },
    devDependencies: {
      vite: "^5.0.7",
      ...(template === "tailwind"
        ? {
            tailwindcss: "^3.4.0",
            postcss: "^8.4.32",
            autoprefixer: "^10.4.16",
          }
        : {}),
    },
  };

  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );
  logSuccess("Created package.json");

  // Update project name in template files
  updateProjectName(projectPath, projectName);

  log("\n📦 Installing dependencies...\n", "bright");

  try {
    // Install dependencies
    process.chdir(projectPath);
    await execAsync("npm install", { stdio: "inherit" });
    logSuccess("Dependencies installed");
  } catch (error) {
    logError("Failed to install dependencies");
    logInfo('You can run "npm install" manually later');
  }

  // Initialize git
  try {
    await execAsync("git init");
    logSuccess("Initialized git repository");
  } catch (error) {
    // Git might not be available, skip silently
  }

  // Success message
  log("\n" + "=".repeat(50), "green");
  log("🎉 Project created successfully!", "bright");
  log("=".repeat(50) + "\n", "green");

  logInfo("To get started:");
  log(`  cd ${projectName}`, "cyan");
  log("  npm run dev", "cyan");

  log("\nHappy coding with OpenScript! 🚀\n");
}

async function copyDirectory(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      await copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function updateProjectName(projectPath, projectName) {
  // Update index.html title
  const indexHtmlPath = path.join(projectPath, "index.html");
  if (fs.existsSync(indexHtmlPath)) {
    let content = fs.readFileSync(indexHtmlPath, "utf8");
    content = content.replace(
      /<title>.*<\/title>/,
      `<title>${projectName}</title>`,
    );
    fs.writeFileSync(indexHtmlPath, content);
  }

  // Update README if exists
  const readmePath = path.join(projectPath, "README.md");
  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, "utf8");
    content = content.replace(/{{PROJECT_NAME}}/g, projectName);
    fs.writeFileSync(readmePath, content);
  }
}

function showHelp() {
  log("\n📦 create-ojs-app - OpenScript Project Scaffolding Tool\n", "bright");
  log("Usage:", "cyan");
  log("  npx create-ojs-app <project-name> [template]\n", "cyan");
  log("Arguments:", "cyan");
  log("  project-name  Name of your new project (required)", "cyan");
  log("  template      Template to use (optional, default: basic)\n", "cyan");
  log("Available templates:", "cyan");
  log("  basic      - Basic OpenScript project with Vite", "cyan");
  log("  tailwind   - Project with TailwindCSS integration", "cyan");
  log("  bootstrap  - Project with Bootstrap 5 integration\n", "cyan");
  log("Examples:", "cyan");
  log("  npx create-ojs-app my-app", "cyan");
  log("  npx create-ojs-app my-app tailwind", "cyan");
  log("  npx create-ojs-app my-app bootstrap\n", "cyan");
}

// Parse command line arguments
const args = process.argv.slice(2);

// Handle help flag
if (args.includes("--help") || args.includes("-h")) {
  showHelp();
  process.exit(0);
}

if (args.length === 0) {
  log("\n❌ Please specify a project name\n", "red");
  showHelp();
  process.exit(1);
}

const projectName = args[0];
const template = args[1] || "basic";

// Validate project name
if (!/^[a-z0-9-_]+$/.test(projectName)) {
  logError(
    "Project name can only contain lowercase letters, numbers, hyphens, and underscores",
  );
  process.exit(1);
}

createProject(projectName, template).catch((error) => {
  logError("Failed to create project");
  console.error(error);
  process.exit(1);
});
