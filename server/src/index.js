import 'dotenv/config';
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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