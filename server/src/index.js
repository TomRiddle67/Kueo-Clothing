import 'dotenv/config';
import express from "express";
import {fileURLToPath} from "url";
import { dirname, join } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// serve static files
app.use(express.static(join(__dirname, "../public"))); 

app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        project: "kueo",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
    });
});

app.use((req, res) => {
    res.status(404).json({error: "Route not found"});
});

app.listen (PORT, () => {
    console.log(`Kueo server running on port ${PORT}`);
});