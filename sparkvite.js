#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";

function stripJsonComments(str) {
    str = str.replace(/\/\*[\s\S]*?\*\//g, '');
    str = str.replace(/\/\/.*$/gm, '');
    return str;
}

async function main() {
    console.log("✨ Welcome to SparkVite CLI!");

    // ---------------- PROMPTS ----------------
    const answers = await inquirer.prompt([
        {
            name: "projectName",
            type: "input",
            message: "📦 Project name:",
            validate: input => input ? true : "Project name cannot be empty"
        },
        {
            name: "language",
            type: "list",
            message: "⚡ Choose a language:",
            choices: ["JavaScript", "TypeScript"]
        },
        {
            name: "shadcn",
            type: "confirm",
            message: "🎨 Install ShadCN UI?",
            default: false
        },
        {
            name: "router",
            type: "confirm",
            message: "🔗 Setup React Router?",
            default: true
        }
    ]);

    const projectName = answers.projectName;
    const isTS = answers.language === "TypeScript";
    const useShadcn = answers.shadcn;
    const useRouter = answers.router;

    const projectPath = path.join(process.cwd(), projectName);
    const template = isTS ? "react-ts" : "react";

    // ---------------- CREATE VITE APP ----------------
    console.log("🚀 Creating Vite app...");
    execSync(`npm create vite@latest ${projectName} -- --template ${template} --no-install`, { stdio: "inherit" });

    // ---------------- INSTALL DEPS ----------------
    console.log("📦 Installing dependencies...");
    execSync(`cd ${projectName} && npm install tailwindcss @tailwindcss/vite`, { stdio: "inherit" });
    if (useRouter) execSync(`cd ${projectName} && npm install react-router-dom`, { stdio: "inherit" });

    // ---------------- CONFIGURE TAILWIND v4 ----------------
    console.log("⚙️ Setting up Tailwind v4...");
    const cssPath = path.join(projectPath, "src", "index.css");
    fs.writeFileSync(cssPath, `@import "tailwindcss";\n\n/* Add custom theme using @theme */\n`);

    const viteConfigPath = path.join(projectPath, isTS ? "vite.config.ts" : "vite.config.js");
    fs.writeFileSync(
        viteConfigPath,
        `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  }
});
`
    );

    // ---------------- PATH ALIASES ----------------
    console.log("🔗 Configuring path aliases...");
    if (isTS) {
        const tsConfigPath = path.join(projectPath, "tsconfig.json");
        const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, "utf-8"));
        tsConfig.compilerOptions = tsConfig.compilerOptions || {};
        tsConfig.compilerOptions.baseUrl = "./src";
        tsConfig.compilerOptions.paths = { "@/*": ["./*"] };
        fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));

        // Install @types/node
        execSync(`cd ${projectName} && npm install -D @types/node`, { stdio: "inherit" });

        // ---------------- EDIT TSCONFIG.APP.JSON FOR PATH ALIASES ----------------
        console.log("🔗 Configuring path aliases in tsconfig.app.json...");
        const tsconfigAppPath = path.join(projectPath, "tsconfig.app.json");
        let tsConfigApp;
        if (fs.existsSync(tsconfigAppPath)) {
            const tsConfigAppContent = fs.readFileSync(tsconfigAppPath, "utf-8");
            const cleanContent = stripJsonComments(tsConfigAppContent);
            tsConfigApp = JSON.parse(cleanContent);
        } else {
            tsConfigApp = {
                compilerOptions: {}
            };
        }
        tsConfigApp.compilerOptions = tsConfigApp.compilerOptions || {};
        tsConfigApp.compilerOptions.baseUrl = ".";
        tsConfigApp.compilerOptions.paths = { "@/*": ["./src/*"] };
        fs.writeFileSync(tsconfigAppPath, JSON.stringify(tsConfigApp, null, 2));
        console.log("✅ Updated tsconfig.app.json with path aliases");
    } else {
        fs.writeFileSync(
            path.join(projectPath, "jsconfig.json"),
            JSON.stringify(
                {
                    compilerOptions: {
                        baseUrl: "./src",
                        paths: { "@/*": ["./*"] }
                    }
                },
                null,
                2
            )
        );
    }

    // ---------------- FOLDER STRUCTURE ----------------
    console.log("📂 Creating folders...");
    ["components", "pages", "utils", "hooks", "context", "layouts"].forEach(folder =>
        fs.mkdirSync(path.join(projectPath, "src", folder))
    );

    // ---------------- STARTER FILES ----------------
    console.log("📝 Adding starter files...");
    const ext = isTS ? "tsx" : "jsx";

    fs.writeFileSync(
        path.join(projectPath, "src/pages/Home." + ext),
        `export default function Home() {
  return <h1 className="text-3xl font-bold">
  Welcome to ${projectName}
  </h1>;
}`
    );

    if (useRouter) {
        console.log("⚡ Setting up React Router...");

        fs.writeFileSync(
            path.join(projectPath, "src/layouts/MainLayout." + ext),
            `import { Outlet, Link } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="p-6">
      <nav className="flex gap-4 mb-6">
        <Link to="/" className="text-blue-600">Home</Link>
        <Link to="/about" className="text-blue-600">About</Link>
      </nav>
      <Outlet />
    </div>
  );
}`
        );

        fs.writeFileSync(
            path.join(projectPath, "src/pages/About." + ext),
            `export default function About() {
  return <p className="text-lg">
  This is the About page 
  </p>;
}`
        );

        fs.writeFileSync(
            path.join(projectPath, `src/main.${ext}`),
            `import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);`
        );

        fs.writeFileSync(
            path.join(projectPath, `src/App.${ext}`),
            `import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  );
}

export default App;`
        );
    }

    // ---------------- SHADCN SETUP ----------------
    if (useShadcn) {
        console.log("✨ Installing ShadCN UI...");
        execSync(`cd ${projectName} && npm install shadcn@latest`, { stdio: "inherit" });

        console.log("⚡ Initializing ShadCN UI...");
        execSync(`cd ${projectName} && npx shadcn@latest init -y`, { stdio: "inherit" });

        console.log("➕ Adding ShadCN Button...");
        execSync(`cd ${projectName} && npx shadcn@latest add button -y`, { stdio: "inherit" });
    }

    console.log("\n✅ Setup complete!");
    console.log(`\nNext steps:\n  cd ${projectName}\n  npm run dev`);
}

// main();
main().catch(err => {
    console.error("❌ Error during setup:", err);
    process.exit(1);
});