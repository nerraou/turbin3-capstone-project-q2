# Getting Started

## Prerequisites

- Node.js
- pnpm
- Docker & Docker Compose

---

## Main Application

```bash
# Navigate to the application
cd frontend

# Create environment file
cp .env.example .env

# Start PostgreSQL
docker compose up -d

# Install dependencies
pnpm install

# Run database migrations
pnpm migrate

# Start development server
pnpm dev
```

---

## Payment Gateway

```bash
# Navigate to the application
cd payment-gateway

# Create environment file
cp .env.example .env

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

---

## Marketplace

```bash
# Navigate to the application
cd marketplace

# Create environment file
cp .env.example .env

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

---

# Local URLs

| Application      | URL                   |
| ---------------- | --------------------- |
| Main Application | http://localhost:3000 |
| Payment Gateway  | http://localhost:3001 |
| Marketplace      | http://localhost:3002 |

---

# Project Structure

```
.
├── frontend          # Main application
├── payment-gateway   # Payment gateway simulation
└── marketplace       # Marketplace application
```
