import { createTransport } from "nodemailer";
import dotenv from 'dotenv'
dotenv.config();

const sendMail =  async (recipient, subject, htmlContent) => {
    try {
        const transport = createTransport({
            host:"smtp.gmail.com",
            auth:{
                user:process.env.GMAIL,
                pass:process.env.GPASS
            }
        })
        const information =
        {
            from:process.env.GMAIL,
            to:recipient,
            subject:subject,
            html:htmlContent
        }
        try {
            const info = await transport.sendMail(information);
            console.log("Mail sent Successfully...");
        } catch (error) {
            console.error(error.message);
        }
        
    } catch (error) {
     console.error(error.message);   
    }
}

export default sendMail;