// Permanent Admin WhatsApp Number
// Replace with your actual number.
// Example format: 919876543210

const ADMIN_WHATSAPP = "8807323674";

function getWhatsAppLink(phone, message) {
    return "https://wa.me/" + phone +
        "?text=" + encodeURIComponent(message);
}