# Deployment Environment Variables Guide

You must add the following environment variables to your deployment platforms for the application to work correctly.

## 1. Backend (Render)
Go to your Render Dashboard -> Select your Backend Service -> Environment.

Add these keys:
- `SUPABASE_URL`: `https://onmpewnqhmjbqutvwykd.supabase.co`
- `SUPABASE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubXBld25xaG1qYnF1dHZ3eWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDAxMTgsImV4cCI6MjA3OTIxNjExOH0.paoi7sux8_PjtYoSw6Zxi6fsc3FI_Ta3e5SeYcuw6lk`
- `JWT_SECRET`: (Create a strong random string, e.g., `my-super-secret-jwt-key-2024`)

## 2. Frontend (Railway)
Go to your Railway Dashboard -> Select your Frontend Service -> Variables.

Add these keys:
- `VITE_SUPABASE_URL`: `https://onmpewnqhmjbqutvwykd.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubXBld25xaG1qYnF1dHZ3eWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDAxMTgsImV4cCI6MjA3OTIxNjExOH0.paoi7sux8_PjtYoSw6Zxi6fsc3FI_Ta3e5SeYcuw6lk`

> [!NOTE]
> After adding these variables, you must **Redeploy** both services for the changes to take effect.
