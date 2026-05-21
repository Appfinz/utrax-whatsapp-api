import axios from "axios";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {

        const order = req.body;

        const customerPhone =
            order?.customer?.phone ||
            order?.billing_address?.phone;

        if (!customerPhone) {
            return res.status(200).json({
                success: false,
                message: "No phone number"
            });
        }

        const cleanPhone = customerPhone.replace(/\D/g, "");

        await axios.post(
            `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: cleanPhone,
                type: "template",
                template: {
                    name: "hello_world",
                    language: {
                        code: "en_US"
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return res.status(200).json({
            success: true
        });

    } catch (error) {

        console.log(error.response?.data || error.message);

        return res.status(500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
}