import { whatsappAccessToken, whatsappApiVersion, whatsappPhoneNumberId, } from "../config/env.js";
const VERIFY_TOKEN = "avolvelabs_whatsapp_token_2211";
const CATALOG_IMAGE_URL = "https://av-blog-web.s3.ap-south-1.amazonaws.com/plan-f01.jpg";
async function sendCatalog(recipient) {
    if (!whatsappAccessToken || !whatsappPhoneNumberId) {
        console.error("Cannot send catalog: WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID is missing");
        return;
    }
    const response = await fetch(`https://graph.facebook.com/${whatsappApiVersion}/${whatsappPhoneNumberId}/messages`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${whatsappAccessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: recipient,
            type: "image",
            image: {
                link: CATALOG_IMAGE_URL,
                caption: "Here are the product details.",
            },
        }),
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`WhatsApp API error (${response.status}): ${errorBody}`);
    }
    console.log(`Catalog sent to WhatsApp user ${recipient}`);
}
export async function facebookWebhookHandler(req, res) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified");
        return res.status(200).send(String(challenge));
    }
    console.log("Verification failed:", { mode, token });
    return res.sendStatus(403);
}
export async function facebookWebhookPostHandler(req, res) {
    const payload = req.body;
    for (const entry of payload.entry ?? []) {
        for (const change of entry.changes ?? []) {
            for (const rawMessage of change.value?.messages ?? []) {
                const message = rawMessage;
                console.log("WhatsApp message received:", message);
                const messageBody = message.text?.body?.toLowerCase() ?? "";
                if (message.type === "text" && messageBody.includes("send catalog")) {
                    if (!message.from) {
                        console.error("Cannot send catalog: incoming message has no sender");
                        continue;
                    }
                    try {
                        await sendCatalog(message.from);
                    }
                    catch (error) {
                        console.error("Failed to send catalog:", error);
                    }
                }
            }
            for (const status of change.value?.statuses ?? []) {
                console.log("WhatsApp message status:", status);
            }
        }
    }
    return res.sendStatus(200);
}
// {
//   "object": "whatsapp_business_account",
//   "entry": [
//     {
//       "id": "102290129340398",
//       "changes": [
//         {
//           "value": {
//             "messaging_product": "whatsapp",
//             "metadata": {
//               "display_phone_number": "15550783881",
//               "phone_number_id": "106540352242922"
//             },
//             "contacts": [
//               {
//                 "profile": {
//                   "name": "Sheena Nelson"
//                 },
//                 "wa_id": "16505551234"
//               }
//             ],
//             "messages": [
//               {
//                 "from": "16505551234",
//                 "id": "wamid.HBgLMTY1MDM4Nzk0MzkVAgASGBQzQTRBNjU5OUFFRTAzODEwMTQ0RgA=",
//                 "timestamp": "1749416383",
//                 "type": "text",
//                 "text": {
//                   "body": "Does it come in another color?"
//                 }
//               }
//             ]
//           },
//           "field": "messages"
//         }
//       ]
//     }
//   ]
// }
//# sourceMappingURL=facebookWehbook.controller.js.map