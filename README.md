# Telegram Mini App

A production-ready React application built with Vite and TailwindCSS, designed to work as a Telegram Mini App.

## Features

- 🚀 React + Vite + TypeScript
- 🎨 TailwindCSS for styling
- 📱 Telegram WebApp SDK integration
- 🛣️ React Router for navigation
- 🎯 Feature-Sliced Design architecture
- 🌙 Dark mode support
- 🔧 Fully typed components
- 📦 Zero runtime dependencies

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── app/               # Application initialization layer
│   ├── providers/     # Application providers
│   └── styles/        # Global styles
├── pages/             # Application pages
├── widgets/           # Complex page sections
├── features/          # User interactions
├── entities/          # Business entities
└── shared/           # Shared modules
    ├── api/          # API interaction
    ├── lib/          # Utility functions
    └── ui/           # UI components
```

## Development

- Run `npm run dev` to start the development server
- Run `npm run build` to create a production build
- Run `npm run preview` to preview the production build locally

## License

MIT
