import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import app from './app.js';
import { connectDB } from './config/db.js';

// Load env from config/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'config/.env') });

const PORT = process.env.PORT || 5000;

async function start() {
    await connectDB();
    const server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

start().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
});