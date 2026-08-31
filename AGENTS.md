# BazaarSathi — AI Agent Instructions

## Project Overview

Peer-to-peer marketplace with escrow payments.
Stack: Node.js + Express + MongoDB + React.js

## Rules

- Always use async/await, never callbacks
- Use mongoose for all MongoDB operations
- JWT for all protected routes
- All API responses follow: { success, data, message }
- Use .env for all secrets (never hardcode)
- Follow MVC pattern: routes → controllers → models

## Folder Structure

- backend/models/ → mongoose schemas
- backend/routes/ → express routes
- backend/controllers/ → business logic
- backend/middleware/ → auth, error handling
- frontend/src/pages/ → React pages
- frontend/src/components/ → reusable components

## Current Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.io for real-time chat
- Cloudinary for image uploads
- Khalti for payments (Nepal)
- React.js + Tailwind CSS
