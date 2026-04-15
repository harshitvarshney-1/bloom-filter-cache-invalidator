# Bloom Filter Cache Invalidation System

This project demonstrates how to use a **Bloom Filter** to efficiently manage cache invalidation in a major backend system.

## Goal
Reduce unnecessary database queries by checking a Bloom Filter before deciding whether to trust the cache or fetch fresh data from the Database (MongoDB).

## Tech Stack
- **Node.js** & **Express** (Backend Framework)
- **MongoDB** (Database - Source of Truth)
- **In-Memory Cache** (JavaScript Map)
- **Bloom Filter** (Custom Implementation)

## 🏗️ Architecture & Folder Structure

To ensure production-readiness, this project follows a **Clean Layered Architecture** emphasizing the separation of concerns, scalability, and maintainability.

```text
src/
├── config/        # Environment & 3rd-party configuration (DB, Port)
├── controllers/   # Route handlers (HTTP layer). Parses req/res and calls services.
├── middlewares/   # Express middlewares (Error Handling, Auth, Logging)
├── models/        # Database schemas and models (MongoDB/Mongoose)
├── repositories/  # Data Access Layer (DAL). Abstracts DB and Cache operations.
├── routes/        # API Routing definitions. Maps URLs to Controllers.
├── services/      # Core Business Logic. Where the Bloom Filter and cache algorithms live.
├── utils/         # Helper functions and classes (e.g., Bloom Filter implementation)
├── validations/   # Input validation rules to secure API from bad payloads
├── logger/        # Centralized logging module
├── metrics/       # Application performance monitoring (Hit/Miss rates, Latency)
└── app.js         # Application bootstrap and server initialization
```

### Folder Responsibilities (Quick Guide)
- **`config/`**: Centralizes all configuration so you only have to change DB URIs or ports in one place.
- **`controllers/`**: These shouldn't have business logic. They handle the "Web" part: "What did the user ask for?" and "What should we send back?".
- **`middlewares/`**: Functions that run "in the middle" of a request, like catching errors globally without repeating `try/catch` everywhere.
- **`models/`**: Defines the shape of our data (e.g., Mongoose schemas).
- **`repositories/`**: The *Data Access Layer*. If we ever switch from MongoDB to PostgreSQL, we only change the repository, not the services.
- **`routes/`**: Acts as a directory/map for our API endpoints.
- **`services/`**: The brain of the application. The Bloom filter logic is isolated here.
- **`utils/`**: Reusable tools that don't depend on the app's state.
- **`validations/`**: Prevents bad inputs from reaching the controllers.
- **`logger/`**: Instead of `console.log`, a dedicated logger can write to files, add timestamps, and differentiate between `info`, `warn`, and `error`.
- **`metrics/`**: Essential for a caching project! Tracks cache Hits, Misses, and False Positives to prove the Bloom Filter is actually working.

---

## How It Works

1.  **Set Key (`POST /set`)**:
    - Saves data to MongoDB via Repository.
    - Updates local Cache.

2.  **Invalidate Key (`POST /invalidate`)**:
    - Adds the key to the **Bloom Filter**.
    - This marks the key as "possibly invalidated".

3.  **Get Key (`GET /get/:key`)**:
    - Checks the Bloom Filter first.
    - **If NOT in Bloom Filter**:
        - The key is **definitely valid**.
        - Return data directly from **Cache** (Fast!). Record a Metric Hit.
    - **If IN Bloom Filter**:
        - The key is **possibly invalid**.
        - Fetch fresh data from **MongoDB** via Repository. Record a Metric Miss.
        - Update **Cache**.
        - Return data.

## How to Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start MongoDB**:
    Ensure MongoDB is running locally or update `src/config/db.js` with your URI.

3.  **Start Server**:
    ```bash
    npm start
    ```

## Concepts Learned
- **Bloom Filter**: A probabilistic data structure that tells you if an element is *definitely not* in a set or *possibly* in a set.
- **False Positives**: Sometimes the Bloom Filter might say a key is "invalidated" when it's not. This is safe—we just make an extra DB call.
- **No False Negatives**: If the Bloom Filter says a key is "valid" (not in invalid set), we can 100% trust the cache.
