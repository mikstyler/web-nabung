const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://newshot-user:dhoo-2009@cluster0.kkteamf.mongodb.net/my-panel?retryWrites=true&w=majority';

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    const db = await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    cachedDb = db;
    return db;
}

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.MbdUser || mongoose.model('MbdUser', userSchema);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();
        const { username, password } = req.body;

        if (!username || !password) {
            return res.json({ success: false, message: 'Username dan password wajib diisi!' });
        }

        // Cek apakah username sudah ada di database MongoDB
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({ success: false, message: 'Username sudah digunakan orang lain, silakan pilih nama lain!' });
        }

        const newUser = new User({ username, password });
        await newUser.save();

        return res.json({ success: true, message: 'Registrasi berhasil! Silakan login.' });
    } catch (error) {
        return res.json({ success: false, message: 'Terjadi kesalahan pada server database.' });
    }
};
