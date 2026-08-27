const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');

// كتقرا البيانات من الملف
function readData() {
    if (fs.existsSync(dbPath)) {
        return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
    return {
        users: [{ id: 1, uid: '#ES-0001', name: 'Admin', email: 'admin@esport.com', password: 'admin123', wallet: 0, totalMatches: 0, totalWins: 0, totalLosses: 0, totalEarned: 0, joinDate: new Date().toLocaleDateString(), status: 'active', phone: '212604084574' }],
        groupRequests: [],
        matchRequests: [],
        rechargeRequests: []
    };
}

// كتكتب البيانات ف الملف
function writeData(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

app.get('/api/all', (req, res) => {
    res.json(readData());
});

app.post('/api/users', (req, res) => {
    const db = readData();
    db.users = req.body;
    writeData(db);
    res.json({ success: true });
});

app.post('/api/groups', (req, res) => {
    const db = readData();
    db.groupRequests = req.body;
    writeData(db);
    res.json({ success: true });
});

app.post('/api/matches', (req, res) => {
    const db = readData();
    db.matchRequests = req.body;
    writeData(db);
    res.json({ success: true });
});

app.post('/api/recharges', (req, res) => {
    const db = readData();
    db.rechargeRequests = req.body;
    writeData(db);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
