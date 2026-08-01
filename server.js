const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = "./transactions.json";
const ADMIN_PASSWORD = "admin123";

// ==========================================
// 1. MIDDLEWARE & STATIC FILES (Wajib Di Atas)
// ==========================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mengizinkan Express membaca file HTML/CSS/JS di root folder
app.use(express.static(__dirname));

// ==========================================
// 2. DATABASE TRANSAKSI (FILE JSON)
// ==========================================
let transactions = [];
if (fs.existsSync(DB_FILE)) {
    try {
        transactions = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch (err) {
        transactions = [];
    }
}

function saveTransactions() {
    fs.writeFileSync(DB_FILE, JSON.stringify(transactions, null, 2));
}

// ==========================================
// 3. ROUTE APLIKASI & PAGE
// ==========================================
// 1. ENDPOINT UNTUK MENERIMA PESANAN DARI FRONTEND (index.html)
app.post('/api/topup', (req, res) => {
  try {
    const { buyer_sku_code, productName, customer_no, price } = req.body;

    if (!customer_no) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID tidak boleh kosong!' 
      });
    }

    const newTransaction = {
      ref_id: "TRX" + Math.floor(100000 + Math.random() * 900000),
      buyer_sku_code: buyer_sku_code || "UNKNOWN",
      product_name: productName || buyer_sku_code || "Produk Top Up",
      customer_no: customer_no,
      price: price || 0,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    transactions.unshift(newTransaction);
    saveTransactions();

    console.log("Transaksi baru masuk:", newTransaction);

    return res.json({
      success: true,
      message: 'Pesanan berhasil dibuat!',
      data: newTransaction
    });

  } catch (error) {
    console.error("Error topup:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal memproses transaksi' 
    });
  }
});

// 2. ENDPOINT UNTUK ADMIN PANEL MENGAMBIL DAFTAR TRANSAKSI
app.get('/api/admin/transactions', (req, res) => {
  res.json(transactions);
});

// ENDPOINT UNTUK USER CEK STATUS TRANSAKSI BERDASARKAN REF_ID
app.get('/api/transaction/status/:ref_id', (req, res) => {
  const { ref_id } = req.params;
  const trx = transactions.find(t => t.ref_id === ref_id);
  
  if (!trx) {
    return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
  }

  return res.json({
    success: true,
    ref_id: trx.ref_id,
    status: trx.status,
    product_name: trx.product_name,
    customer_no: trx.customer_no,
    price: trx.price
  });
});
// Tes Server
app.get("/", (req, res) => {
    res.json({ status: true, message: "Backend Online!" });
});

// Route Khusus Buka Admin HTML
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// ==========================================
// 4. API ENDPOINTS
// ==========================================

// Simpan Order Baru (dari index.html / script.js)
 app.post("/api/order", (req, res) => {
    try {
        
        const { ref_id, customer_no, buyer_sku_code, price, productName, account_password } = req.body;

 const newTrx = {
    ref_id: ref_id || ("TRX" + Math.floor(100000 + Math.random() * 900000)),
    customer_no: customer_no || "-",
    buyer_sku_code: buyer_sku_code || "-",
    product_name: productName || buyer_sku_code || "-",
    account_password: account_password || null,
    price: price || 0,
    status: "Pending",
    waktu: new Date().toLocaleString("id-ID")
};

        // Simpan ke urutan paling atas array
        transactions.unshift(newTrx);
        saveTransactions();

        console.log("--> [SUCCESS] Pesanan Masuk:", newTrx);
        res.json({ status: true, message: "Order Berhasil", data: newTrx });
    } catch (error) {
        console.error("Error Order:", error);
        res.status(500).json({ status: false, message: "Gagal memproses order" });
    }
});

// Login Admin
app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        return res.json({ status: true, token: "secret-token-admin" });
    }
    res.status(401).json({ status: false, message: "Password Salah!" });
});

// Ambil Semua Transaksi untuk Admin Dashboard
app.get("/api/admin/transactions", (req, res) => {
    res.json(transactions);
});
// Ambil status transaksi berdasarkan Ref ID
app.get("/api/order/:ref_id", (req, res) => {
    const { ref_id } = req.params;

    const trx = transactions.find(t => t.ref_id === ref_id);

    if (!trx) {
        return res.status(404).json({
            status: false,
            message: "Transaksi tidak ditemukan"
        });
    }

    res.json({
        status: true,
        data: trx
    });
});

// Simpan bukti pembayaran (foto screenshot transfer) yang dikirim dari index.html
app.put("/api/order/:ref_id", (req, res) => {
    const { ref_id } = req.params;
    const { proof_image } = req.body;

    const trx = transactions.find(t => t.ref_id === ref_id);

    if (!trx) {
        return res.status(404).json({
            status: false,
            message: "Transaksi tidak ditemukan"
        });
    }

    if (proof_image) {
        trx.proof_image = proof_image;
        saveTransactions();
    }

    res.json({
        status: true,
        data: trx
    });
});
// Stats Admin Dashboard
app.get("/api/admin/stats", (req, res) => {
    const total = transactions.length;
    const sukses = transactions.filter(x => x.status === "Success" || x.status === "Sukses").length;
    const pending = transactions.filter(x => x.status === "Pending").length;
    const gagal = transactions.filter(x => x.status === "Failed" || x.status === "Gagal").length;

    const pendapatan = transactions
        .filter(x => x.status === "Success" || x.status === "Sukses")
        .reduce((a, b) => a + Number(b.price || 0), 0);

    res.json({
        status: true,
        total,
        sukses,
        pending,
        gagal,
        pendapatan
    });
});

// Update Status Transaksi
app.put("/api/admin/transaction/:ref_id", (req, res) => {
    const { ref_id } = req.params;
    const { status } = req.body;

    const trx = transactions.find(x => x.ref_id === ref_id);

    if (!trx) {
        return res.status(404).json({
            status: false,
            message: "Transaksi tidak ditemukan"
        });
    }

    trx.status = status;
    saveTransactions();

    res.json({
        status: true,
        transaction: trx
    });
});

// ==========================================
// 5. RUN SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
