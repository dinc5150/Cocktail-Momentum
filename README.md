# Cocktail Pantry

A dark-themed SPA for managing your home bar ingredient inventory. Built with Lit 3 + TypeScript + Vite.

## Features

- Add, rename, and delete ingredients
- Toggle **In Stock** / **Out of Stock** per ingredient
- Text search, alphabetical and date-based sorting (4 modes)
- Filter by stock status (All / In Stock / Out of Stock)
- Persisted to `localStorage` — survives page refreshes

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (bundled with Node.js)

## Setup

```bash
npm install
```

## Development

Start the Vite dev server with hot-reload:

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Production Build

Compile TypeScript and bundle with Vite:

```bash
npm run build
```

Output is written to the `dist/` folder.

## Preview Production Build

Serve the `dist/` output locally to verify the production bundle:

```bash
npm run preview
```

## Project Structure

```
src/
├── main.ts                    # Entry point
├── types.ts                   # Shared TypeScript types
├── store/
│   └── pantry-store.ts        # localStorage read/write
└── components/
    ├── pantry-app.ts          # Root component & state owner
    ├── ingredient-list.ts     # Search, sort, filter + list
    ├── ingredient-form.ts     # Add ingredient form
    └── ingredient-item.ts     # Single ingredient row
```

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Lit](https://lit.dev/) | ^3.2 | Web components framework |
| [TypeScript](https://www.typescriptlang.org/) | ^5.4 | Type safety |
| [Vite](https://vitejs.dev/) | ^5.2 | Bundler & dev server |
