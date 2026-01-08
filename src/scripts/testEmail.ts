import "dotenv/config"; // load .env when running via tsx
import { sendEmail } from "../lib/email";

(async () => {
    const success = await sendEmail({
        to: "tegesoftware@gmail.com", // Replace with your test recipient email
        subject: "Test Email from Hanadap",
        html: `<p>This is a test email sent from the Hanadap application.</p>`
    });

    if (success) {
        console.log("Test email sent successfully.");
    } else {
        console.error("Failed to send test email.");
    }
})();