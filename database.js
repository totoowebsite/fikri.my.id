// Database Sederhana dalam Memori (Lokal sementara sebelum ke DB permanen)
const transactions = [];

// Fungsi simpan transaksi baru
function createTransaction(data) {
  const newTrx = {
    id: transactions.length + 1,
    ref_id: `TRX-${Date.now()}`, // Bikin ref_id unik pakai timestamp
    buyer_sku_code: data.buyer_sku_code,
    customer_no: data.customer_no,
    account_password: data.account_password || null,
    price: data.price,
    status: 'Pending',
    payment_status: 'Unpaid',
    created_at: new Date()
  };
  
  transactions.push(newTrx);
  return newTrx;
}

// Fungsi cari transaksi berdasarkan ref_id
function findTransaction(refId) {
  return transactions.find(trx => trx.ref_id === refId);
}

// Fungsi update status
function updateTransactionStatus(refId, status, paymentStatus) {
  const trx = findTransaction(refId);
  if (trx) {
    if (status) trx.status = status;
    if (paymentStatus) trx.payment_status = paymentStatus;
    return trx;
  }
  return null;
}

module.exports = {
  transactions,
  createTransaction,
  findTransaction,
  updateTransactionStatus
};
