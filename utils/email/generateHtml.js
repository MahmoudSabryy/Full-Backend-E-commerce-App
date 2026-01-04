export const template = (name, code, subject) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${subject}</title>
<style>
  @media only screen and (max-width: 600px) {
    .wrapper { width: 100% !important; padding: 16px !important; }
    .content { padding: 20px !important; }
    .otp { font-size: 28px !important; letter-spacing: 6px !important; }
    .btn { width: 100% !important; display: block !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial,sans-serif;color:#0b1226;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;width:100%;min-width:100%;">
    <tr>
      <td align="center" style="padding:24px;">
        <table role="presentation" class="wrapper" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 6px 18px rgba(20,28,55,0.08);">
          <tr>
            <td style="background:linear-gradient(90deg,#3563e9,#6b8ef6);padding:20px 24px;color:#fff;">
              <h1 style="margin:0;font-size:20px;font-weight:600;">${subject}</h1>
            </td>
          </tr>
          <tr>
            <td class="content" style="padding:28px 36px;">
              <p style="margin:0 0 12px 0;font-size:16px;">Hello ${name},</p>
              <p style="margin:0 0 20px 0;font-size:15px;color:#39404a;line-height:1.45;">
                Use the verification code below to complete your action. This code will expire in <strong>10 minutes</strong>.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:18px 0 20px 0;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:#f6f9ff;border:1px dashed #dbe7ff;padding:18px 26px;border-radius:10px;">
                      <span class="otp" style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;color:#0b1226;font-family:monospace,Menlo,monaco,Consolas,'Courier New',monospace;">
                        ${code}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 18px 0;font-size:14px;color:#495060;">
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px 0;">
                <tr>
                  <td align="left">

                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px 0;font-size:13px;color:#7a828c;">
                If you didn't request this, you can safely ignore this email.
              </p>
              <hr style="border:none;border-top:1px solid #eef1f6;margin:20px 0;" />
              <p style="margin:0;font-size:13px;color:#94a0ad;">
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 36px;background:#fbfdff;text-align:center;color:#8b949f;font-size:12px;">
              <span>© ${new Date().getFullYear()} MyApp. All rights reserved.</span>
            </td>
          </tr>
        </table>
        <div style="display:block;font-size:0;line-height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;">
          Your verification code is ${code}. It will expire in 10 minutes.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
