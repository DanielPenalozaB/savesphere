package services

import "fmt"

func verificationEmailHTML(verifyURL string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="100%%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
<tr><td style="text-align:center;padding-bottom:24px">
<h1 style="margin:0;font-size:20px;color:#18181b">Verify your email</h1>
</td></tr>
<tr><td style="text-align:center;padding-bottom:32px;color:#52525b;font-size:15px;line-height:1.6">
Click the button below to verify your email address and activate your SaveSphere account.
</td></tr>
<tr><td style="text-align:center;padding-bottom:32px">
<a href="%s" style="display:inline-block;background:#18181b;color:#fafafa;text-decoration:none;font-weight:500;font-size:14px;padding:12px 32px;border-radius:8px">Verify Email</a>
</td></tr>
<tr><td style="text-align:center;color:#a1a1aa;font-size:13px;line-height:1.5">
This link expires in 24 hours.<br>If you didn't create an account, you can safely ignore this email.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`, verifyURL)
}

func passwordResetEmailHTML(resetURL string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="100%%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
<tr><td style="text-align:center;padding-bottom:24px">
<h1 style="margin:0;font-size:20px;color:#18181b">Reset your password</h1>
</td></tr>
<tr><td style="text-align:center;padding-bottom:32px;color:#52525b;font-size:15px;line-height:1.6">
We received a request to reset your password. Click the button below to choose a new one.
</td></tr>
<tr><td style="text-align:center;padding-bottom:32px">
<a href="%s" style="display:inline-block;background:#18181b;color:#fafafa;text-decoration:none;font-weight:500;font-size:14px;padding:12px 32px;border-radius:8px">Reset Password</a>
</td></tr>
<tr><td style="text-align:center;color:#a1a1aa;font-size:13px;line-height:1.5">
This link expires in 1 hour.<br>If you didn't request a password reset, you can safely ignore this email.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`, resetURL)
}
