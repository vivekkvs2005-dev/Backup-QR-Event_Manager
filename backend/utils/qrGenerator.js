const QRCode = require("qrcode");

async function generateQRCode(data) {
  return await QRCode.toBuffer(data);
}

module.exports = generateQRCode;