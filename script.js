// Variable State
let selectedProduct = "";
let selectedPriceRaw = 0;
let discountPercent = 0;
let selectedPayment = "";

// Kode Voucher Promo
const validVouchers = {
    "DISKON10": 0.10,
    "ITEMKUPRIME": 0.15,
    "HEMAT20": 0.20
};

// 1. Handling Pilihan Produk
document.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;

    document.querySelectorAll(".product-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    selectedProduct = card.querySelector("h3") ? card.querySelector("h3").innerText : "";
    const priceText = card.querySelector("p") ? card.querySelector("p").innerText : "0";
    
    selectedPriceRaw = parseInt(priceText.replace(/[^0-9]/g, "")) || 0;
    updateOrderSummary();
});

// 2. Handling Pilihan Metode Pembayaran
function selectPayment(element) {
    const cards = document.querySelectorAll(".pay-card");
    cards.forEach(card => card.classList.remove("active"));
    
    element.classList.add("active");
    selectedPayment = element.querySelector("p") ? element.querySelector("p").innerText : "Metode Pembayaran";
}

// 3. Handling Voucher Promo
function applyVoucher() {
    const voucherInput = document.querySelector(".voucher-input-group input");
    if (!voucherInput) return;

    const code = voucherInput.value.trim().toUpperCase();

    if (!code) {
        alert("⚠️ Silakan masukkan kode voucher!");
        return;
    }

    if (validVouchers[code]) {
        discountPercent = validVouchers[code];
        alert(`🎉 Voucher "${code}" Berhasil Dipasang! Diskon ${(discountPercent * 100)}%.`);
        updateOrderSummary();
    } else {
        alert("❌ Kode Voucher tidak valid.");
    }
}

// Helper: Update Ringkasan Pesanan
function updateOrderSummary() {
    const finalPrice = selectedPriceRaw * (1 - discountPercent);
    const formattedPrice = "Rp " + finalPrice.toLocaleString("id-ID");

    if (document.getElementById("productName")) document.getElementById("productName").innerText = selectedProduct || "-";
    if (document.getElementById("productAmount")) document.getElementById("productAmount").innerText = selectedProduct ? "1 Item" : "-";
    if (document.getElementById("totalPrice")) document.getElementById("totalPrice").innerText = selectedPriceRaw > 0 ? formattedPrice : "Rp 0";
}

// 4. Salin Nomor DANA
function copyDana() {
    const nomorEl = document.getElementById("danaNumber");
    const nomor = nomorEl ? nomorEl.innerText : "083833000431";
    
    navigator.clipboard.writeText(nomor).then(() => {
        alert("📋 Nomor DANA berhasil disalin: " + nomor);
    });
}

// 5. Handling Navigasi Halaman
function showHome() {
    document.getElementById("topupPage").style.display = "none";
    
    const successEl = document.getElementById("successPage");
    if (successEl) successEl.style.display = "none";

    const homeEl = document.getElementById("home");
    if (homeEl) homeEl.style.display = "block";
    
    document.getElementById("gameMenu").style.display = "block";

    resetOrderSummary();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function openGame(game) {
    document.getElementById("gameMenu").style.display = "none";
    document.getElementById("topupPage").style.display = "block";

    document.getElementById("gameTitle").innerHTML = `<i class="fa-solid fa-gamepad"></i> TOP UP ${game.toUpperCase()}`;
    document.getElementById("productTitle").innerHTML = `<i class="fa-solid fa-gem"></i> Pilih Nominal ${game}`;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetOrderSummary() {
    selectedProduct = "";
    selectedPriceRaw = 0;
    discountPercent = 0;
    selectedPayment = "";

    document.querySelectorAll(".product-card").forEach(c => c.classList.remove("selected"));
    document.querySelectorAll(".pay-card").forEach(c => c.classList.remove("active"));

    const voucherInput = document.querySelector(".voucher-input-group input");
    if (voucherInput) voucherInput.value = "";

    updateOrderSummary();
}

// 6. Checkout & FAQ Init (Sistem Order Backend Integrated)
document.addEventListener("DOMContentLoaded", () => {
    
    const buyBtn = document.querySelector(".buy-now");
    if (buyBtn) {
        buyBtn.addEventListener("click", async () => {
            const idInput = document.querySelector(".input-box input");
            const userId = idInput ? idInput.value.trim() : "";

            if (!userId) {
                alert("⚠️ Masukkan User ID / ID Akun Game Anda!");
                return;
            }

            if (!selectedProduct) {
                alert("⚠️ Silakan pilih Produk terlebih dahulu!");
                return;
            }

            if (!selectedPayment) {
                alert("⚠️ Silakan pilih Metode Pembayaran!");
                return;
            }

            const finalPrice = selectedPriceRaw * (1 - discountPercent);
            const finalPriceText = "Rp " + finalPrice.toLocaleString("id-ID");

            const isConfirmed = confirm(
`🛒 KONFIRMASI PEMBELIAN ITEMKU 🛒

User ID     : ${userId}
Produk      : ${selectedProduct}
Pembayaran  : ${selectedPayment}
Total Bayar : ${finalPriceText}

Lanjutkan transaksi sekarang?`
            );

            if (isConfirmed) {
                try {
                    buyBtn.innerText = "Memproses Pesanan...";
                    buyBtn.disabled = true;

                    // Kirim Data ke Backend Node.js
                    const response = await fetch("http://localhost:3000/api/order", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
    ref_id: "TRX" + Math.floor(100000 + Math.random() * 900000),
    customer_no: userId,
    buyer_sku_code: selectedProduct,
    price: finalPrice,
    status: "Pending"
})

                    });

                    const result = await response.json();

                    buyBtn.innerText = "Beli Sekarang";
                    buyBtn.disabled = false;

                    if (result.status) {
                        const successPage = document.getElementById("successPage");
                        const topupPage = document.getElementById("topupPage");
                        
                        const refIdText = result.data.ref_id;
                        const statusText = result.data ? result.data.status : "Pending";

                        if (successPage && topupPage) {
                            topupPage.style.display = "none";
                            successPage.style.display = "block";
                            
                            let statusIcon = "⏳";
let statusColor = "#f59e0b";

if (statusText === "Success") {
    statusIcon = "✅";
    statusColor = "#10b981";
} else if (statusText === "Cancelled") {
    statusIcon = "❌";
    statusColor = "#ef4444";
}

const detailsBox = successPage.querySelector(".success-details");

if (detailsBox) {
    detailsBox.innerHTML = `
        <p><i class="fa-solid fa-receipt"></i> <strong>Ref ID:</strong> ${refIdText}</p>
        <p><i class="fa-solid fa-user"></i> <strong>User ID:</strong> ${userId}</p>
        <p><i class="fa-solid fa-box"></i> <strong>Produk:</strong> ${selectedProduct}</p>
        <p><i class="fa-solid fa-credit-card"></i> <strong>Pembayaran:</strong> ${selectedPayment}</p>
        <p><i class="fa-solid fa-money-bill"></i> <strong>Total Bayar:</strong> ${finalPriceText}</p>

        <p>
            <strong>Status:</strong>
            <span id="statusBadge"
                style="display:inline-block;padding:6px 12px;border-radius:20px;background:${statusColor};color:#fff;font-weight:bold;">
                ${statusIcon} ${statusText}
            </span>
        </p>
    `;
}
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          const statusEl = detailsBox.querySelector("span");

const cekStatus = setInterval(async () => {
    try {
        const res = await fetch(`http://localhost:3000/api/order/${refIdText}`);
        const data = await res.json();
        if (!data.status) return;
        statusEl.innerText = data.data.status;
        if (data.data.status === "Success") {
            statusEl.style.color = "#10b981";
            clearInterval(cekStatus);
        }
        if (data.data.status === "Cancelled") {
            statusEl.style.color = "#ef4444";
            clearInterval(cekStatus);
        }
    } catch (e) {
        console.log(e);
    }
}, 5000);
                        } else {
                            alert("🎉 Pesanan berhasil dikirim! Ref ID: " + refIdText);
                        }
                    } else {
                        alert("❌ Transaksi Gagal: " + (result.message || "Terjadi kesalahan."));
                    }

                } catch (error) {
                    buyBtn.innerText = "Beli Sekarang";
                    buyBtn.disabled = false;
                    console.error("Error:", error);
                    alert("❌ Gagal terhubung ke Server Backend! Pastikan server backend (node server.js) sedang berjalan di Termux.");
                }
            }
        });
    }

    // FAQ Accordion
    const faqQuestions = document.querySelectorAll(".faq-question");
    faqQuestions.forEach(q => {
        q.addEventListener("click", () => {
            const answer = q.nextElementSibling;
            if (answer && answer.classList.contains("faq-answer")) {
                const isOpen = answer.style.display === "block";
                document.querySelectorAll(".faq-answer").forEach(a => a.style.display = "none");
                answer.style.display = isOpen ? "none" : "block";
            }
        });
    });

    // Voucher Button
    const voucherBtn = document.querySelector(".btn-apply-voucher");
    if (voucherBtn) {
        voucherBtn.addEventListener("click", applyVoucher);
    }
});

// 7. Loading Screen
window.onload = function () {
    setTimeout(() => {
        const loadingEl = document.getElementById("loading");
        if (loadingEl) {
            loadingEl.style.opacity = "0";
            loadingEl.style.transition = "opacity 0.4s ease";
            setTimeout(() => loadingEl.style.display = "none", 400);
        }
    }, 600);
};
