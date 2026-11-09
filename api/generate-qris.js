// api/generate-qris.js
import QRCode from 'qrcode';

// Fungsi untuk menghitung CRC16 (Standar CRC-CCITT untuk QRIS)
function calculateCRC16(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
        crc ^= str.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
        }
    }
    let hex = (crc & 0xFFFF).toString(16).toUpperCase();
    while (hex.length < 4) hex = '0' + hex;
    return hex;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { nominal } = req.body;
    if (!nominal || nominal < 2000) {
        return res.status(400).json({ success: false, error: 'Minimal nominal deposit Rp 2.000' });
    }

    try {
        // 1. String Dasar QRIS Statis Kamu (SEMBAKO ERNY - ID1025439915212)
        // Dipotong sebelum checksum CRC di bagian akhir
        let qrisRaw = "00020101021126660014ID.CO.QRIS.WWW011893600914ID1025439915212021593600915102543995204541153033605802ID5912SEMBAKO ERNY6003Air6304";

        // Ubah tipe QRIS dari Statis (01) menjadi Dinamis (02)
        qrisRaw = qrisRaw.replace("010211", "010212");

        // Format Tag 54 (Nominal Transaksi)
        const nominalStr = nominal.toString();
        const tag54 = "54" + String(nominalStr.length).padStart(2, '0') + nominalStr;

        // Sisipkan tag 54 sebelum tag 58 (Country Code)
        let parts = qrisRaw.split("5802ID");
        let qrisWithAmount = parts[0] + tag54 + "5802ID" + parts[1];

        // Tambahkan CRC16 Checksum di akhir
        let finalQrisString = qrisWithAmount + calculateCRC16(qrisWithAmount);

        // Generate QR Code ke bentuk Base64 Image
        const qrImageBase64 = await QRCode.toDataURL(finalQrisString, {
            errorCorrectionLevel: 'M',
            margin: 2,
            width: 300
        });

        return res.status(200).json({
            success: true,
            nominal: nominal,
            qrisString: finalQrisString,
            qrCodeUrl: qrImageBase64
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
