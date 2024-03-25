const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.sendEmail = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        // send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    } else {
        // email sending logic
        const { to, subject, text } = req.body;
        const msg = {
            to,
            from: "bookinglite@outlook.com", // email verified with SendGrid
            subject,
            text,
        };
        try {
            await sgMail.send(msg);
            res.json({ message: "Email sent." });
        } catch (error) {
            console.error("Error sending email:", error);
            if (error.response) {
                console.error(error.response.body)
            }
            res.status(500).json({ error: "Failed to send email" });
        }
    }
});