import "./env.js"
import express from "express";
import {fileURLToPath} from "url";
import { dirname, join } from 'path';
import supabase from "./supabase.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

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

// waitlist signup
app.post('/waitlist', async (req,res) =>{
    const {email} = req.body;
    if (!email || !email.includes("@")) {
        return res.status(400)
        .sendFile(join(__dirname, "../public/error.html"));
    }

    const {error} = await supabase
    .from('waitlist')
    .insert({email});

    if (error) {
        // email already registered
        if (error.code === "23505") {
            return res.sendFile(join(__dirname,
                 "..public/already-registerd.html"));
        }
       
        return res.status(500)
        .sendFile(join(__dirname, "../public/error.html"));
    }

    res.sendFile(join(__dirname, "../public/success.html"))
});

app.use((req, res) => {
    res.status(404).json({error: "Route not found"});
});

app.listen (PORT, () => {
    console.log(`Kueo server running on port ${PORT}`);
});