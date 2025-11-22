const express = require('express');
const cors = require('cors');
const crypto = require('crypto'); // Native Node.js crypto library
const app = express();

app.use(cors());
app.use(express.json());

// --- THE "BLOCKCHAIN" LEDGER ---
// In a real app, this is Polygon. Here, it's RAM.
let ledger = []; 

// --- HELPER FUNCTIONS ---

// 1. Simulate Hashing (SHA-256)
const hash = (data) => crypto.createHash('sha256').update(data).digest('hex');

// 2. Generate a Wallet-like Address
const generateAddress = () => '0x' + crypto.randomBytes(20).toString('hex');

// 3. Get Current Timestamp
const getTime = () => new Date().toLocaleString('en-US', { hour12: true });

// --- SMART CONTRACT LOGIC ---

// POST /mint - Manufacturer creates a batch
app.post('/api/mint', (req, res) => {
    // 1. Generate Keys
    const publicId = "MED-" + crypto.randomBytes(3).toString('hex').toUpperCase(); // The QR Code
    const privateKey = crypto.randomBytes(6).toString('hex').toUpperCase(); // The Hidden Scratch-off Code
    
    // 2. Hash the Private Key (We only store the hash, just like a real contract)
    const privateKeyHash = hash(privateKey);

    // 3. Create the Asset on the Ledger
    const newAsset = {
        publicId: publicId,
        privateKeyHash: privateKeyHash, // Storing the lock, not the key
        name: "Cancertrol (Life Saving Drug)",
        batch: "BATCH-" + Math.floor(Math.random() * 9000 + 1000),
        mfgDate: new Date().toLocaleDateString(),
        expiry: "2027-12-01",
        owner: "0x000... (Manufacturer)", // Current Owner Address
        isConsumed: false,
        
        // Immutable History Log
        history: [
            { step: 'MINTED', location: 'Factory Floor A', time: getTime(), txHash: generateAddress(), status: 'CREATED' },
            { step: 'LOGISTICS', location: 'Cold Chain Truck #42', time: getTime(), txHash: generateAddress(), status: 'IN_TRANSIT' },
            { step: 'RETAIL', location: 'Apollo Pharmacy', time: getTime(), txHash: generateAddress(), status: 'ON_SHELF' }
        ]
    };

    ledger.push(newAsset);
    console.log(`[BLOCKCHAIN] Minted Asset: ${publicId}`);
    
    // Return keys to Manufacturer so they can print the label
    res.json({ 
        success: true, 
        publicId, 
        privateKey // Manufacturer needs this to print the label!
    });
});

// GET /scan/:id - Public verification (Anyone can do this)
app.get('/api/scan/:id', (req, res) => {
    const asset = ledger.find(a => a.publicId === req.params.id);
    
    if (!asset) return res.status(404).json({ error: "Asset not found on ledger." });

    // Return public data only (History, Metadata)
    // We DO NOT return the private key or hash here.
    res.json({
        name: asset.name,
        batch: asset.batch,
        mfgDate: asset.mfgDate,
        expiry: asset.expiry,
        history: asset.history,
        isConsumed: asset.isConsumed,
        owner: asset.owner
    });
});

// POST /claim - The "Scratch & Win" Ownership Transfer
app.post('/api/claim', (req, res) => {
    const { publicId, privateKeyInput } = req.body;

    // 1. Find Asset
    const asset = ledger.find(a => a.publicId === publicId);
    if (!asset) return res.status(404).json({ error: "Asset not found." });

    // 2. Check if already sold (Double Spend Protection)
    if (asset.isConsumed) {
        return res.status(400).json({ error: "ALREADY CONSUMED! Possible counterfeit." });
    }

    // 3. Verify Cryptography (Does Hash(Input) == StoredHash?)
    const inputHash = hash(privateKeyInput);
    if (inputHash !== asset.privateKeyHash) {
        return res.status(401).json({ error: "INVALID KEY! Tamper seal broken or fake code." });
    }

    // 4. Execute Smart Contract Transfer
    asset.isConsumed = true;
    asset.owner = "0xUserWallet... (Consumer)"; // In real app, this is user's wallet address
    
    asset.history.push({
        step: 'OWNERSHIP_CLAIMED',
        location: 'Consumer App',
        time: getTime(),
        txHash: generateAddress(),
        status: 'BURNED & LOCKED'
    });

    res.json({ success: true, message: "Ownership Transferred Successfully!" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🔗 BlockTrack Node Active on Port ${PORT}`));