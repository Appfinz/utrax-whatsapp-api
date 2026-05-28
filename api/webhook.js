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

        console.log(
            "SHOPIFY WEBHOOK BODY:",
            JSON.stringify(order, null, 2)
        );

        const customerPhone =
            order?.customer?.phone ||
            order?.billing_address?.phone ||
            order?.shipping_address?.phone;

        if (!customerPhone) {
            return res.status(200).json({
                success: false,
                message: "No phone number found"
            });
        }

        const cleanPhone = customerPhone.replace(/\D/g, "");

        const customerName =
            order?.customer?.first_name ||
            order?.billing_address?.first_name ||
            "Customer";

        const orderId =
            order?.name ||
            order?.id ||
            "N/A";

        const orderAmount =
            order?.total_price ||
            "0";

        const response = await axios.post(
            `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: cleanPhone,
                type: "template",
                template: {
                    name: "order_confirmation",
                    language: {
                        code: "en"
                    },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                {
                                    type: "text",
                                    text: customerName
                                },
                                {
                                    type: "text",
                                    text: orderId.toString()
                                },
                                {
                                    type: "text",
                                    text: orderAmount.toString()
                                }
                            ]
                        }
                    ]
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(
            "WHATSAPP RESPONSE:",
            response.data
        );

        return res.status(200).json({
            success: true,
            message: "WhatsApp message sent successfully"
        });

    } catch (error) {

        console.log(
            "WHATSAPP ERROR:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
}