# Prisma Database Setup

This folder contains the Prisma ORM configuration for the 3D Jamaican Dominoes game.

## Schema

The `schema.prisma` file defines the database models for the application:

- `User`: Player accounts with authentication
- `Account` and `Session`: NextAuth.js authentication tables
- `Game`: Represents a game session
- `Player`: Represents a player in a game (can be AI)
- `GameRound`: Tracks rounds within a game

## Setup Instructions

1. Make sure you have a `.env` file with the `DATABASE_URL` variable:

   ```
   # For SQLite (development)
   DATABASE_URL="file:./dev.db"
   
   # For PostgreSQL (production example)
   # DATABASE_URL="postgresql://username:password@localhost:5432/dominoes?schema=public"
   ```

2. Run the migrations to set up your database:

   ```bash
   npx prisma migrate dev
   ```

3. If you need to reset your database during development:

   ```bash
   npx prisma migrate reset
   ```

4. To explore your database with the Prisma Studio GUI:

   ```bash
   npx prisma studio
   ```

## Customizing the Database

If you want to use a different database system:

1. Update the `provider` in the `datasource` block in `schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql" // or "mysql", "sqlserver", etc.
     url      = env("DATABASE_URL")
   }
   ```

2. Update the `DATABASE_URL` in your `.env` file to point to your database

3. Run `npx prisma migrate dev` to generate new migrations

For more information about Prisma, check out the [official documentation](https://www.prisma.io/docs/).