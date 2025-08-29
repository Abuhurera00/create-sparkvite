# ⚡ create-sparkvite

[![npm version](https://img.shields.io/npm/v/create-sparkvite?color=blue)](https://www.npmjs.com/package/create-sparkvite)
[![License](https://img.shields.io/npm/l/create-sparkvite)](./LICENSE)
[![Node.js Version](https://img.shields.io/node/v/create-sparkvite)](https://nodejs.org/)

> 🚀 A blazing fast, opinionated CLI to scaffold **React + Vite + Tailwind CSS v4** projects with modern tooling and zero configuration.

SparkVite CLI creates production-ready React applications with carefully selected tools and configurations, so you can focus on building instead of setup.

---

## ✨ Features

- ⚡ **Lightning Fast** – Powered by Vite for instant dev server and HMR
- 🎨 **Modern Styling** – Tailwind CSS v4 with latest features
- 🧩 **Component Library** – Optional ShadCN UI integration
- 📦 **Package Manager Choice** – Support for npm, yarn, pnpm, and bun
- 🔤 **TypeScript Ready** – Full TypeScript support out of the box
- 🧠 **State Management** – Choose from Context API, Zustand, or Redux Toolkit
- 🧪 **Testing Setup** – Vitest + Testing Library configuration
- 🔍 **Code Quality** – ESLint + Prettier with sensible defaults
- 🔗 **Routing Ready** – React Router v6 integration
- 📱 **PWA Support** – Optional Progressive Web App configuration
- 🗂️ **Smart Structure** – Organized folder structure with path aliases
- 📡 **Git Ready** – Automatic Git initialization with first commit

---

## 🚀 Quick Start

```bash
# Create a new SparkVite project
npx create-sparkvite@latest

# Follow the interactive prompts
# Navigate to your project
cd your-project-name

# Start developing
npm run dev
```

## 🛠️ Interactive Setup

SparkVite CLI guides you through an interactive setup process:

### 📦 **Project Configuration**
- **Project Name** – Your app name (validates npm package naming)
- **Package Manager** – Choose between npm, yarn, pnpm, or bun

### 🎯 **Technology Stack**
- **Language** – JavaScript or TypeScript
- **UI Library** – None or ShadCN UI
- **State Management** – None, Context API, Zustand, or Redux Toolkit
- **Routing** – Optional React Router integration
- **PWA** – Progressive Web App support

### 🔧 **Development Tools**
- **Testing** – Vitest + React Testing Library setup
- **Code Quality** – ESLint + Prettier configuration
- **Version Control** – Git repository initialization

---

## 📁 Project Structure

SparkVite creates a well-organized project structure:

```
your-project/
├─ src/
│  ├─ components/
│  ├─ pages/
│  ├─ layouts/
│  ├─ hooks/
│  ├─ utils/
│  ├─ context/
│  ├─ stores/
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
├─ public/
├─ package.json
├─ vite.config.ts
├─ tailwind.config.js
├─ tsconfig.json
└─ README.md
```

---

## ⚙️ Configuration Details

### 🎨 **Tailwind CSS v4**
- Latest Tailwind CSS v4 with Vite plugin
- Custom theme configuration ready
- Optimized for production builds

### 🔗 **Path Aliases**
Pre-configured `@/` alias pointing to `src/`:
```typescript
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
```

### 🧪 **Testing Setup**
When enabled, includes:
- Vitest test runner
- React Testing Library
- Jest DOM matchers
- Sample test file

### 🔍 **Code Quality**
ESLint + Prettier configuration with:
- React and React Hooks rules
- TypeScript support (when selected)
- Prettier integration
- Pre-configured scripts: `lint`, `lint:fix`, `format`

### 📱 **PWA Configuration**
Optional PWA setup with:
- Vite PWA plugin
- Service worker generation
- Web app manifest

---

## 📋 Available Scripts

After project creation, you can run:

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality (if enabled)
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier

# Testing (if enabled)
npm run test         # Run tests with Vitest
```

---

## 🧠 State Management Options

### **Context API**
- Built-in React Context setup
- App-level provider configuration
- Custom hook for consuming context

### **Zustand**
- Lightweight state management
- TypeScript-ready store setup
- Sample counter store included

### **Redux Toolkit**
- Modern Redux with RTK
- Pre-configured store setup
- Sample slice with TypeScript support

---

## 🔧 Requirements

- **Node.js** 18 or higher
- **npm**, **yarn**, **pnpm**, or **bun**

---

### Development Setup
```bash
git clone https://github.com/Abuhurera00/create-sparkvite
cd create-sparkvite
npm install
npm run dev
```

---

## 🐛 Issues & Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Abuhurera00/create-sparkvite/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/Abuhurera00/create-sparkvite/discussions)
- 📚 **Documentation**: [Wiki](https://github.com/Abuhurera00/create-sparkvite/wiki)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

SparkVite CLI is built on top of these amazing projects:
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [React](https://react.dev/) - A JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [ShadCN UI](https://ui.shadcn.com/) - Beautifully designed components

---

<div align="center">

**Made with ❤️ for the React community**

[⭐ Star on GitHub](https://github.com/Abuhurera00/create-sparkvite) • [📦 View on NPM](https://www.npmjs.com/package/create-sparkvite)

</div>