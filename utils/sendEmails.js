const nodemailer = require("nodemailer");
const { EMAIL, MAILSECRET } = require('../constants/index.constants');

exports.sendEmail = (to, subject, html) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        service: "gmail",
        auth:{
            user: EMAIL,
            pass: MAILSECRET
        }
    })

    let mailOptions;
    if (typeof(to) === 'object') {
        to.forEach(element => {
            mailOptions = {
                from: `${EMAIL}`,
                to: element,
                subject: subject,
                html: html
            }

            transporter.sendMail(mailOptions, function(error,info){
                if(error){
                    console.log(error);
                } else {
                    console.log(info);
                }
            })
        });
    } else {
        mailOptions = {
            from: `${EMAIL}`,
            to: to,
            subject: subject,
            html: html
        }

        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            } else {
                console.log(info);
            }
        })
    }

}