const crypto = require("crypto");
const axios = require("axios");

// Nanti username & API key ini bisa dipindah ke .env
const USERNAME = "username_digiflazz_mu";
const API_KEY = "dev_key_atau_prod_key_mu"; 

// 1. Fungsi Bikin Signature MD5 Digiflazz
function makeSignature(refId) {
  return crypto
    .createHash("md5")
    .update(USERNAME + API_KEY + refId)
    .digest("hex");
}

// 2. Fungsi Tembak Top Up ke Digiflazz
async function topUp(skuCode, customerNo, refId) {
  const sign = makeSignature(refId);

  try {
    const response = await axios.post("https://api.digiflazz.com/v1/transaction", {
      username: USERNAME,
      buyer_sku_code: skuCode,
      customer_no: customerNo,
      ref_id: refId,
      sign: sign,
      // Testing Mode: Set true jika masih tahap uji coba (saldo tidak terpotong)
      testing: true 
    });

    return response.data;
  } catch (error) {
    console.error("Error Digiflazz:", error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = {
  topUp
};
