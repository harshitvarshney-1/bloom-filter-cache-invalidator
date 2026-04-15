const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/cacheRoutes');
require('dotenv').config();

const app = express();


app.use(cors());//Middleware
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/', apiRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log('POST /set        - Set Key');
    console.log('GET  /get/:key   - Get Key (Bloom Check)');
    console.log('POST /invalidate - Invalidate Key');
});
