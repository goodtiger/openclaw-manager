# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OpenClaw Manager** is a cross-platform desktop application for managing OpenClaw AI assistant services. Built with **Tauri 2.0 + React + TypeScript + Rust**.

- **Frontend**: React 18 + TypeScript, Zustand state management, TailwindCSS, Framer Motion animations, Lucide icons, i18next (zh/en)
- **Backend**: Rust (Tauri 2.0), handles service management, file I/O, process control, shell commands
- **Platforms**: macOS, Windows, Linux

## Development Commands

```bash
npm install              # Install frontend dependencies
npm run tauri dev        # Full dev mode (Tauri + Vite with hot reload)
npm run dev              # Frontend only (Vite dev server on port 1420)
npm run build            # Build frontend only
npm run tauri build      # Production build (generates .dmg/.msi/.deb in src-tauri/target/release/bundle/)
cd src-tauri && cargo check   # Check Rust compilation
cd src-tauri && cargo clippy  # Rust linting
```

### Prerequisites
- Node.js >= 18.0
- Rust >= 1.70
- macOS: `xcode-select --install`
- Linux: `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, and related packages
- Windows: MSVC Build Tools, WebView2

## Architecture

### Tauri IPC Bridge

The frontend communicates with the Rust backend via `invoke()`. All backend commands are registered in `src-tauri/src/main.rs`. The frontend API layer in `src/lib/tauri.ts` wraps all `invoke` calls with logging and TypeScript types.

When adding a new backend command:
1. Add the function in the appropriate `src-tauri/src/commands/*.rs` module
2. Register it in `main.rs` under `invoke_handler`
3. Add a corresponding frontend wrapper in `src/lib/tauri.ts`

### Backend Structure (`src-tauri/src/`)

| Module | Responsibility |
|--------|----------------|
| `commands/service.rs` | OpenClaw gateway service lifecycle (start/stop/restart, port-based status detection, log reading) |
| `commands/config.rs` | Configuration management (env files, AI providers, channels, skills, agents) |
| `commands/process.rs` | Process checks (installation detection, version, port availability) |
| `commands/diagnostics.rs` | System diagnostics, security scanning, AI/channel connectivity tests |
| `commands/installer.rs` | Environment setup, Node.js/OpenClaw installation, updates |
| `models/` | Data structs (`ServiceStatus`, config models) |
| `utils/` | Platform detection, shell command execution, file operations |

Key patterns:
- Service status is detected by checking if port **18789** is listening (not via PID file)
- Cross-platform commands use `#[cfg(unix)]` / `#[cfg(windows)]` conditional compilation
- Config is read from `~/.openclaw/` directory

### Frontend Structure (`src/`)

| Path | Responsibility |
|------|----------------|
| `App.tsx` | Root component, page routing, environment checks, update notifications |
| `components/Layout/` | Sidebar navigation + Header |
| `components/Dashboard/` | Service monitoring, quick actions |
| `components/AIConfig/` | AI provider/model configuration |
| `components/Channels/` | Messaging channel configuration |
| `components/Agents/` | Multi-agent management |
| `components/Skills/` | Skill plugin management |
| `components/Security/` | Security scanning and remediation |
| `components/Testing/` | Diagnostics and connectivity tests |
| `components/Logs/` | Real-time log viewer |
| `components/Settings/` | App settings |
| `lib/tauri.ts` | All Tauri invoke wrappers with TypeScript types |
| `lib/ThemeContext.tsx` | Light/dark theme provider |
| `lib/logger.ts` | Structured logging (no console.log) |
| `hooks/useService.ts` | Service lifecycle hook with auto-polling |
| `stores/appStore.ts` | Zustand global state |
| `i18n/` | Chinese/English translations |

### State Management

- **Zustand** (`stores/appStore.ts`) for global UI state (service status, system info, loading, notifications)
- **React local state** for component-specific data
- Service status auto-polls every 3 seconds via `useService` hook

### Theming

CSS custom properties defined in `globals.css` with `[data-theme="light"]` / `[data-theme="dark"]` selectors. Theme preference persisted via `ThemeContext`.

## Important Notes

- The app reads configuration from `~/.openclaw/env` and `~/.openclaw/` directory
- Service port is hardcoded as **18789** in `service.rs`
- Vite dev server runs on port **1420** (strict port, configured in `tauri.conf.json`)
- Use the logger from `lib/logger.ts` instead of `console.log`
- The `@/` path alias maps to `src/` (configured in `vite.config.ts`)
