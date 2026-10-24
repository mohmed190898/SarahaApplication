import { EmailSubjectEnum } from "../../enum/email.enum.js";

export const verifyEmailTemplate = ({code, title}) => {
    return `<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>${title}</title> </head>

<body style="margin:0; padding:0; background-color:#88BDBF; font-family:Arial,sans-serif;">

    <table border="0" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center" style="padding:40px 10px;">

                <table border="0" width="500" cellpadding="0" cellspacing="0"
                    style="max-width:500px; width:100%; margin:auto; padding:30px; background-color:#F3F3F3; border-radius:8px;">

                    <tr>
                        <td align="center" style="padding-bottom:20px;">
                            <h1 style="color:#333333; margin:0;">
                                ${title}
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:10px 0;">
                            <p style="font-size:16px; color:#555555;">
                                Hello,
                            </p>

                            <p style="font-size:16px; color:#555555;">
                                Use the verification code below to confirm your email address.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:20px 0;">
                            <div style="display:inline-block; padding:15px 30px; background-color:#88BDBF; border-radius:6px;">
                                <span style="font-size:30px; font-weight:bold; letter-spacing:6px; color:#ffffff;">
                                    ${code}
                                </span>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td align="center">
                            <p style="font-size:14px; color:#666666;">
                                If you did not request this code, please ignore this email.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding-top:20px; border-top:1px solid #dddddd;">
                            <p style="font-size:12px; color:#888888;">
                                This is an automated email. Please do not reply.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>`;

};
