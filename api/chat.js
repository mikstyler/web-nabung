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

const chatSchema = new mongoose.Schema({
    username: { type: String, required: true },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    role: { type: String, default: 'FREE' },
    message: { type: String, required: true },
    replyTo: {
        username: String,
        message: String
    },
    createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.models.MbdChat || mongoose.model('MbdChat', chatSchema);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        await connectToDatabase();

        if (req.method === 'GET') {
            const messages = await Chat.find().sort({ createdAt: -1 }).limit(50);
            return res.status(200).json({ success: true, messages: messages.reverse() });
        }

        if (req.method === 'POST') {
            const { username, avatar, message, replyTo } = req.body;
            if (!username || !message) {
                return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong!' });
            }

            const newChat = new Chat({ username, avatar, message, replyTo });
            await newChat.save();

            return res.status(200).json({ success: true, data: newChat });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server chat.' });
    }
};
