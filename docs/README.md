# VectiX Documentation

This directory contains the Docusaurus documentation site for VectiX.

## Getting Started

### Prerequisites

- Node.js 20.0 or above
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm start
```

This will start a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

### Build

Build the documentation site for production:

```bash
npm run build
```

This generates static content into the `build` directory and can be served using any static contents hosting service.

### Serve

Test the production build locally:

```bash
npm run serve
```

## Documentation Structure

```
docs/
├── docs/
│   ├── intro.md              # Introduction to VectiX
│   └── models/               # Model documentation
│       ├── intro.md          # Models overview
│       ├── rbac/             # RBAC models
│       ├── finance/          # Personal finance models
│       └── splitwise/        # Splitwise models
├── sidebars.ts               # Sidebar configuration
└── docusaurus.config.ts      # Docusaurus configuration
```

## Adding Documentation

1. Create markdown files in the `docs/` directory
2. Update `sidebars.ts` to include new pages
3. The documentation will automatically appear in the sidebar

## Deployment

The documentation can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

For GitHub Pages:

```bash
npm run deploy
```

This will build the documentation and deploy it to GitHub Pages.
