# AI SQL Analyst Frontend

A Next.js frontend for the AI SQL Analyst application.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/           # Next.js app directory (pages and layouts)
├── components/    # Reusable React components
└── lib/          # Utility functions and API client
public/           # Static assets
```

## Environment Variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Axios** - HTTP client
