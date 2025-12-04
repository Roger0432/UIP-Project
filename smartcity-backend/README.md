# SmartCity Backend

## Description

This is the backend server for the SmartCity application. It provides a RESTful API for managing incidents, users, and authentication. It uses Node.js, Express, and a PostgreSQL database.

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- PostgreSQL database (or a cloud provider like Neon DB)

## External Libraries

- [express](https://expressjs.com/): Web framework for Node.js
- [pg](https://node-postgres.com/): PostgreSQL client for Node.js
- [cors](https://github.com/expressjs/cors): Middleware to enable Cross-Origin Resource Sharing
- [dotenv](https://github.com/motdotla/dotenv): Module to load environment variables
- [nodemon](https://nodemon.io/) (dev): Tool that automatically restarts the node application when file changes are detected

## Installation & Setup

1. Navigate to the backend directory:

   ```bash
   cd smartcity-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a file named `.env` in the root of the `smartcity-backend` directory.
   Add the following variable:

   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_c0ieGSLVP5Ov@ep-curly-mountain-ag9s3na8-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

   _(Replace the DATABASE_URL with your actual PostgreSQL connection string)_

## Running the Server

- To start the server in production mode:

  ```bash
  npm start
  ```

- To start the server in development mode (with auto-restart):
  ```bash
  npm run dev
  ```

The server will start on port 5000 (or the port specified in .env).
**API Base URL:** `http://localhost:5000`
