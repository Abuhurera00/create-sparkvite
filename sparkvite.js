#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import ora from "ora"; 
import chalk from "chalk";

function stripJsonComments(str) {
    str = str.replace(/\/\*[\s\S]*?\*\//g, '');
    str = str.replace(/\/\/.*$/gm, '');
    return str;
}

// Helper to run commands with spinner
function runCommand(command, options = {}, spinnerText = "Running command...") {
    const spinner = ora(chalk.cyan(spinnerText)).start();
    try {
        execSync(command, { stdio: "inherit", ...options });
        spinner.succeed(chalk.green("Success!"));
    } catch (error) {
        spinner.fail(chalk.red("Failed!"));
        throw error;
    }
}

async function main() {
    console.log(chalk.magentaBright("✨ Welcome to SparkVite CLI!"));

    // Check Node version
    const nodeVersion = process.version;
    if (!/^v(1[8-9]|2[0-9])\./.test(nodeVersion)) {
        console.error(chalk.red("❌ Node.js version 18 or higher is required."));
        process.exit(1);
    }

    // ---------------- PROMPTS ----------------
    const answers = await inquirer.prompt([
        {
            name: "projectName",
            type: "input",
            message: "📦 Project name:",
            validate: input => {
                if (!input) return "Project name cannot be empty";
                if (!/^[a-zA-Z0-9_-]+$/.test(input)) return "Project name must be a valid npm package name";
                return true;
            }
        },
        {
            name: "packageManager",
            type: "list",
            message: "📦 Choose a package manager:",
            choices: ["npm", "yarn", "pnpm", "bun"],
            default: "npm"
        },
        {
            name: "language",
            type: "list",
            message: "🔤 Choose a language:",
            choices: ["JavaScript", "TypeScript"],
            default: "TypeScript" 
        },
        {
            name: "uiLibrary",
            type: "list",
            message: "🎨 Choose a UI library:",
            choices: ["None", "ShadCN UI"],
            default: "None"
        },
        {
            name: "stateManagement",
            type: "list",
            message: "🧠 Choose state management:",
            choices: ["None", "Context API", "Zustand", "Redux"],
            default: "None"
        },
        {
            name: "testing",
            type: "confirm",
            message: "🧪 Setup testing with Vitest?",
            default: true
        },
        {
            name: "linting",
            type: "confirm",
            message: "🔍 Setup linting with ESLint & Prettier?",
            default: true
        },
        {
            name: "git",
            type: "confirm",
            message: "📡 Initialize Git repository?",
            default: true
        },
        {
            name: "router",
            type: "confirm",
            message: "🔗 Setup routing? (React Router)",
            default: true
        },
        {
            name: "pwa",
            type: "confirm",
            message: "📱 Add PWA support?",
            default: false
        }
    ]);

    const projectName = answers.projectName;
    const packageManager = answers.packageManager;
    const isTS = answers.language === "TypeScript";
    const uiLibrary = answers.uiLibrary;
    const stateManagement = answers.stateManagement;
    const useTesting = answers.testing;
    const useLinting = answers.linting;
    const useGit = answers.git;
    const useRouter = answers.router;
    const usePWA = answers.pwa;

    // React-specific template
    const template = isTS ? "react-ts" : "react";

    const projectPath = path.join(process.cwd(), projectName);

    // Check if project exists
    if (fs.existsSync(projectPath)) {
        const overwrite = await inquirer.prompt({
            type: "confirm",
            name: "overwrite",
            message: `Project ${projectName} already exists. Overwrite?`,
            default: false
        });
        if (!overwrite.overwrite) {
            console.log(chalk.yellow("Aborted."));
            process.exit(0);
        }
        fs.rmSync(projectPath, { recursive: true, force: true });
    }

    // create command based on package manager
    let createCmd;
    if (packageManager === "npm") {
        createCmd = `npm create vite@latest ${projectName} -- --template ${template}`;
    } else {
        createCmd = `${packageManager} create vite ${projectName} --template ${template}`;
    }

    // install function
    function getInstallCmd(pkgs, isDev = false) {
        let cmd = `${packageManager} `;
        if (packageManager === "npm") {
            cmd += "install ";
            if (isDev) cmd += "-D ";
        } else if (packageManager === "yarn") {
            cmd += "add ";
            if (isDev) cmd += "-D ";
        } else if (packageManager === "pnpm") {
            cmd += "add ";
            if (isDev) cmd += "-D ";
        } else if (packageManager === "bun") {
            cmd += "add ";
            if (isDev) cmd += "-d ";
        }
        cmd += pkgs;
        return cmd;
    }

    // run script prefix
    const runScriptCmd = packageManager === "npm" ? "npm run" : packageManager;

    try {
        // ---------------- CREATE VITE APP ----------------
        const createSpinner = ora(chalk.cyan("🚀 Creating Vite app...")).start();
        execSync(createCmd, { stdio: "inherit" });
        createSpinner.succeed();

        // ---------------- INSTALL BASE DEPS ----------------
        runCommand(`cd ${projectName} && ${packageManager} install`, {}, "📦 Installing base dependencies...");

        // Install Tailwind
        runCommand(`cd ${projectName} && ${getInstallCmd("tailwindcss @tailwindcss/vite")}`, {}, "Installing Tailwind CSS v4...");

        if (useRouter) {
            runCommand(`cd ${projectName} && ${getInstallCmd("react-router-dom")}`, {}, "Installing react-router-dom...");
        }

        // UI Library installs
        switch (uiLibrary) {
            case "ShadCN UI":
                runCommand(`cd ${projectName} && ${getInstallCmd("class-variance-authority clsx tailwind-merge")}`, {}, "Installing ShadCN dependencies...");
                break;
        }

        // State Management installs
        switch (stateManagement) {
            case "Zustand":
                runCommand(`cd ${projectName} && ${getInstallCmd("zustand")}`, {}, "Installing Zustand...");
                break;
            case "Redux":
                runCommand(`cd ${projectName} && ${getInstallCmd("@reduxjs/toolkit react-redux")}`, {}, "Installing Redux Toolkit...");
                if (isTS) {
                    runCommand(`cd ${projectName} && ${getInstallCmd("@types/react-redux", true)}`, {}, "Installing @types/react-redux...");
                }
                break;
        }

        // Testing installs
        if (useTesting) {
            runCommand(`cd ${projectName} && ${getInstallCmd("vitest @testing-library/react @testing-library/jest-dom jsdom", true)}`, {}, "Installing testing dependencies...");
        }

        // Linting installs
        if (useLinting) {
            const lintDeps = [
                "eslint",
                "prettier",
                "eslint-config-prettier",
                "eslint-plugin-react",
                "eslint-plugin-react-hooks"
            ];
            if (isTS) {
                lintDeps.push("@typescript-eslint/eslint-plugin", "@typescript-eslint/parser");
            }
            runCommand(`cd ${projectName} && ${getInstallCmd(lintDeps.join(" "), true)}`, {}, "Installing linting dependencies...");
        }

        // PWA installs
        if (usePWA) {
            runCommand(`cd ${projectName} && ${getInstallCmd("vite-plugin-pwa", true)}`, {}, "Installing PWA plugin...");
        }

        // ---------------- CONFIGURE TAILWIND v4 ----------------
        const tailwindSpinner = ora(chalk.cyan("⚙️ Setting up Tailwind v4...")).start();
        const cssPath = path.join(projectPath, "src", "index.css");
        fs.writeFileSync(cssPath, `@import "tailwindcss";\n\n/* Add custom theme using @theme */\n`);

        const viteConfigPath = path.join(projectPath, isTS ? "vite.config.ts" : "vite.config.js");
        let viteConfigContent = `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport tailwindcss from '@tailwindcss/vite';\nimport path from 'path';\n\n`;
        if (usePWA) {
            viteConfigContent += `import { VitePWA } from 'vite-plugin-pwa';\n`;
        }
        viteConfigContent += `export default defineConfig({\n  plugins: [react(), tailwindcss()`;
        if (usePWA) {
            viteConfigContent += `, VitePWA({ /* Add manifest options */ })`;
        }
        viteConfigContent += `],\n  resolve: {\n    alias: { "@": path.resolve(__dirname, "./src") }\n  }\n});`;

        fs.writeFileSync(viteConfigPath, viteConfigContent);
        tailwindSpinner.succeed();

        // ---------------- PATH ALIASES ----------------
        const aliasSpinner = ora(chalk.cyan("🔗 Configuring path aliases...")).start();
        if (isTS) {
            const tsConfigPath = path.join(projectPath, "tsconfig.json");
            let tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, "utf-8"));
            tsConfig.compilerOptions = tsConfig.compilerOptions || {};
            tsConfig.compilerOptions.baseUrl = "./src";
            tsConfig.compilerOptions.paths = { "@/*": ["./*"] };
            fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));

            runCommand(`cd ${projectName} && ${getInstallCmd("@types/node", true)}`, {}, "Installing @types/node...");

            // Handle tsconfig.app.json if exists
            const tsconfigAppPath = path.join(projectPath, "tsconfig.app.json");
            if (fs.existsSync(tsconfigAppPath)) {
                let tsConfigApp = JSON.parse(stripJsonComments(fs.readFileSync(tsconfigAppPath, "utf-8")));
                tsConfigApp.compilerOptions = tsConfigApp.compilerOptions || {};
                tsConfigApp.compilerOptions.baseUrl = ".";
                tsConfigApp.compilerOptions.paths = { "@/*": ["./src/*"] };
                fs.writeFileSync(tsconfigAppPath, JSON.stringify(tsConfigApp, null, 2));
            }
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
        aliasSpinner.succeed();

        // ---------------- LINTING SETUP ----------------
        if (useLinting) {
            const lintSpinner = ora(chalk.cyan("🔍 Configuring ESLint & Prettier...")).start();

            // .eslintrc.js
            const eslintConfig = isTS 
                ? `module.exports = {\n  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],\n  parser: '@typescript-eslint/parser',\n  plugins: ['@typescript-eslint'],\n  rules: { /* Add custom rules */ },\n  settings: { react: { version: 'detect' } }\n};`
                : `module.exports = {\n  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],\n  plugins: ['react', 'react-hooks'],\n  rules: { /* Add custom rules */ }\n};`;

            fs.writeFileSync(path.join(projectPath, ".eslintrc.js"), eslintConfig);

            // .prettierrc
            fs.writeFileSync(path.join(projectPath, ".prettierrc"), JSON.stringify({ semi: true, singleQuote: true, tabWidth: 2 }, null, 2));

            // Update package.json scripts
            const packageJsonPath = path.join(projectPath, "package.json");
            let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
            packageJson.scripts = packageJson.scripts || {};
            packageJson.scripts.lint = "eslint . --ext js,jsx,ts,tsx --report-unused-disable-directives --max-warnings 0";
            packageJson.scripts["lint:fix"] = "npm run lint -- --fix"; // Keep as npm for simplicity, or adjust dynamically if needed
            packageJson.scripts.format = "prettier --write .";
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

            lintSpinner.succeed();
        }

        // ---------------- TESTING SETUP ----------------
        if (useTesting) {
            const testSpinner = ora(chalk.cyan("🧪 Configuring Vitest...")).start();

            // package.json scripts
            const packageJsonPath = path.join(projectPath, "package.json");
            let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
            packageJson.scripts = packageJson.scripts || {};
            packageJson.scripts.test = "vitest";
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

            // Sample test file
            const ext = isTS ? "tsx" : "jsx";
            fs.writeFileSync(
                path.join(projectPath, "src", `App.test.${ext}`),
                `import { render, screen } from '@testing-library/react';\nimport App from './App';\n\ntest('renders learn react link', () => {\n  render(<App />);\n  const linkElement = screen.getByText(/learn react/i);\n  expect(linkElement).toBeInTheDocument();\n});`
            );

            testSpinner.succeed();
        }

        // ---------------- GIT SETUP ----------------
        if (useGit) {
            const gitSpinner = ora(chalk.cyan("📡 Initializing Git...")).start();
            runCommand(`cd ${projectPath} && git init`, { stdio: "inherit" }, "git init");

            // Create .gitignore
            const gitignore = `node_modules\n.env\n/dist\n/build\n*.log\n.DS_Store\n`;
            fs.writeFileSync(path.join(projectPath, ".gitignore"), gitignore);

            // Initial commit
            runCommand(`cd ${projectPath} && git add . && git commit -m "Initial commit with SparkVite setup"`, { stdio: "inherit" }, "Initial commit");

            gitSpinner.succeed();
        }

        // ---------------- FOLDER STRUCTURE ----------------
        const folderSpinner = ora(chalk.cyan("📂 Creating folders...")).start();
        const commonFolders = ["components", "pages", "utils", "hooks", "context", "layouts", "stores"]; // Added stores for state mgmt
        commonFolders.forEach(folder => fs.mkdirSync(path.join(projectPath, "src", folder), { recursive: true }));
        folderSpinner.succeed();

        // ---------------- STARTER FILES ----------------
        const starterSpinner = ora(chalk.cyan("📝 Adding starter files...")).start();
        const ext = isTS ? "tsx" : "jsx";
        const storeExt = isTS ? "ts" : "js";

        // Home page
        fs.writeFileSync(
            path.join(projectPath, "src", "pages", `Home.${ext}`),
            `export default function Home() {\n  return <h1 className="text-3xl font-bold">\n  Welcome to ${projectName}\n  </h1>;\n}`
        );

        let mainContent = `import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\nimport "./index.css";\n`;
        let appWrapper = `<App />`;

        if (useRouter) {
            mainContent = `import React from "react";\nimport ReactDOM from "react-dom/client";\nimport { BrowserRouter } from "react-router-dom";\nimport App from "./App";\nimport "./index.css";\n`;

            // MainLayout
            fs.writeFileSync(
                path.join(projectPath, "src", "layouts", `MainLayout.${ext}`),
                `import { Outlet, Link } from "react-router-dom";\n\nexport default function MainLayout() {\n  return (\n    <div className="p-6">\n      <nav className="flex gap-4 mb-6">\n        <Link to="/" className="text-blue-600">Home</Link>\n        <Link to="/about" className="text-blue-600">About</Link>\n      </nav>\n      <Outlet />\n    </div>\n  );\n}`
            );

            // About page
            fs.writeFileSync(
                path.join(projectPath, "src", "pages", `About.${ext}`),
                `export default function About() {\n  return <p className="text-lg">\n  This is the About page \n  </p>;\n}`
            );

            // App.{ext} with routes
            fs.writeFileSync(
                path.join(projectPath, "src", `App.${ext}`),
                `import { Routes, Route } from "react-router-dom";\nimport MainLayout from "@/layouts/MainLayout";\nimport Home from "@/pages/Home";\nimport About from "@/pages/About";\n\nfunction App() {\n  return (\n    <Routes>\n      <Route element={<MainLayout />}>\n        <Route path="/" element={<Home />} />\n        <Route path="/about" element={<About />} />\n      </Route>\n    </Routes>\n  );\n}\n\nexport default App;`
            );

            appWrapper = `<BrowserRouter>\n      <App />\n    </BrowserRouter>`;
        }

        // State Management setup
        if (stateManagement === "Context API") {
            fs.writeFileSync(
                path.join(projectPath, "src", "context", `AppContext.${ext}`),
                `import { createContext, useContext, useState } from 'react';\n\nconst AppContext = createContext${isTS ? '<any>' : ''}(${isTS ? '{}' : ''});\n\nexport function AppProvider({ children }${isTS ? ': { children: React.ReactNode }' : ''}) {\n  const [theme, setTheme] = useState('light');\n  return (\n    <AppContext.Provider value={{ theme, setTheme }}>\n      {children}\n    </AppContext.Provider>\n  );\n}\n\nexport const useAppContext = () => useContext(AppContext);`
            );
            mainContent += `import { AppProvider } from "@/context/AppContext";\n`;
            appWrapper = `<AppProvider>\n    ${appWrapper}\n  </AppProvider>`;
        }

        if (stateManagement === "Zustand") {
            fs.writeFileSync(
                path.join(projectPath, "src", "stores", `useCounterStore.${storeExt}`),
                isTS 
                    ? `import { create } from 'zustand';\n\ntype CounterStore = {\n  count: number;\n  increment: () => void;\n};\n\nexport const useCounterStore = create<CounterStore>((set) => ({\n  count: 0,\n  increment: () => set((state) => ({ count: state.count + 1 })),\n}));`
                    : `import { create } from 'zustand';\n\nexport const useCounterStore = create((set) => ({\n  count: 0,\n  increment: () => set((state) => ({ count: state.count + 1 })),\n}));`
            );
        }

        if (stateManagement === "Redux") {
            // Create counterSlice
            fs.writeFileSync(
                path.join(projectPath, "src", "stores", `counterSlice.${storeExt}`),
                isTS 
                    ? `import { createSlice, PayloadAction } from '@reduxjs/toolkit';\n\ntype CounterState = {\n  value: number;\n};\n\nconst initialState: CounterState = {\n  value: 0,\n};\n\nexport const counterSlice = createSlice({\n  name: 'counter',\n  initialState,\n  reducers: {\n    increment: (state) => {\n      state.value += 1;\n    },\n    decrement: (state) => {\n      state.value -= 1;\n    },\n    incrementByAmount: (state, action: PayloadAction<number>) => {\n      state.value += action.payload;\n    },\n  },\n});\n\nexport const { increment, decrement, incrementByAmount } = counterSlice.actions;\n\nexport default counterSlice.reducer;`
                    : `import { createSlice } from '@reduxjs/toolkit';\n\nconst initialState = {\n  value: 0,\n};\n\nexport const counterSlice = createSlice({\n  name: 'counter',\n  initialState,\n  reducers: {\n    increment: (state) => {\n      state.value += 1;\n    },\n    decrement: (state) => {\n      state.value -= 1;\n    },\n    incrementByAmount: (state, action) => {\n      state.value += action.payload;\n    },\n  },\n});\n\nexport const { increment, decrement, incrementByAmount } = counterSlice.actions;\n\nexport default counterSlice.reducer;`
            );

            // Create store
            fs.writeFileSync(
                path.join(projectPath, "src", "stores", `store.${storeExt}`),
                `import { configureStore } from '@reduxjs/toolkit';\nimport counterReducer from './counterSlice';\n\nexport const store = configureStore({\n  reducer: {\n    counter: counterReducer,\n  },\n});\n` + (isTS ? `\nexport type RootState = ReturnType<typeof store.getState>;\nexport type AppDispatch = typeof store.dispatch;\n` : '')
            );

            mainContent += `import { Provider } from 'react-redux';\nimport { store } from '@/stores/store';\n`;
            appWrapper = `<Provider store={store}>\n    ${appWrapper}\n  </Provider>`;
        }

        // Write main.{ext}
        mainContent += `\nReactDOM.createRoot(document.getElementById("root")${isTS ? '!' : ''}).render(\n  <React.StrictMode>\n    ${appWrapper}\n  </React.StrictMode>\n);`;
        fs.writeFileSync(
            path.join(projectPath, "src", `main.${ext}`),
            mainContent
        );

        starterSpinner.succeed();

        // ---------------- SHADCN SETUP ----------------
        if (uiLibrary === "ShadCN UI") {
            runCommand(`cd ${projectPath} && npx shadcn@latest init`, { stdio: "inherit" }, "Initializing ShadCN UI...");
            runCommand(`cd ${projectPath} && npx shadcn@latest add button`, { stdio: "inherit" }, "Adding ShadCN Button component...");
        }

        // ---------------- ENV SETUP ----------------
        fs.writeFileSync(path.join(projectPath, ".env.example"), "VITE_API_URL=http://localhost:3000\n");

        // ---------------- README ----------------
        const readme = `# ${projectName}

## Setup
- cd ${projectName}
- ${packageManager} install (already done)
- ${runScriptCmd} dev

## Scripts
- ${runScriptCmd} dev
${useLinting ? `- ${runScriptCmd} lint\n- ${runScriptCmd} format` : ''}
${useTesting ? `- ${runScriptCmd} test` : ''}

## Structure
- src/components
- src/pages
- etc.
`;
        fs.writeFileSync(path.join(projectPath, "README.md"), readme);

        console.log(chalk.green("\n✅ Setup complete!"));
        console.log(chalk.blue(`\nNext steps:\n  cd ${projectName}\n  ${runScriptCmd} dev`));

        // Summary table
        console.log(chalk.magenta("\nSetup Summary:"));
        console.table({
            PackageManager: packageManager,
            Language: answers.language,
            UI: uiLibrary,
            State: stateManagement,
            Testing: useTesting ? "Yes (Vitest)" : "No",
            Linting: useLinting ? "Yes (ESLint + Prettier)" : "No",
            Git: useGit ? "Initialized" : "Skipped",
            Router: useRouter ? "Yes" : "No",
            PWA: usePWA ? "Yes" : "No"
        });

    } catch (error) {
        console.error(chalk.red("❌ Error during setup:"), error.message);
        // Rollback: Remove project
        if (fs.existsSync(projectPath)) {
            fs.rmSync(projectPath, { recursive: true, force: true });
            console.log(chalk.yellow("🗑️ Rolled back project creation."));
        }
        process.exit(1);
    }
}

main().catch(err => {
    console.error(chalk.red("❌ Error during setup:"), err);
    process.exit(1);
});