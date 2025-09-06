export function otpTemplate(name: string, otp: string) {
  return `
  <div style="font-family:Arial,sans-serif;background:#f7f7f9;padding:24px">
    <table role="presentation" width="100%" style="max-width:560px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.06)">
      <tr>
        <td style="padding:24px 24px 0 24px">
          <h2 style="margin:0 0 8px;color:#111">Verifikasi Akun Kost</h2>
          <p style="margin:0;color:#555">Hai ${
            name || "Pengguna"
          }, masukkan kode berikut untuk memverifikasi akun Anda.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;text-align:center">
          <div style="font-size:32px;letter-spacing:8px;font-weight:700;color:#111">${otp}</div>
          <p style="margin:16px 0 0;color:#666">Kode berlaku selama <b>5 menit</b>.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 24px 24px 24px;color:#888;font-size:12px">Jika Anda tidak merasa melakukan pendaftaran, abaikan email ini.</td>
      </tr>
    </table>
  </div>`;
}

export function resetPasswordTemplate(name: string, link: string) {
  return `
  <div style="font-family:Arial,sans-serif;background:#f7f7f9;padding:24px">
    <table role="presentation" width="100%" style="max-width:560px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.06)">
      <tr>
        <td style="padding:24px 24px 0 24px">
          <h2 style="margin:0 0 8px;color:#111">Reset Password</h2>
          <p style="margin:0;color:#555">Hai ${
            name || "Pengguna"
          }, klik tombol di bawah untuk mengganti password Anda.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;text-align:center">
          <a href="${link}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600">Ganti Password</a>
          <p style="margin:12px 0 0;color:#666;font-size:12px">Link berlaku selama 15 menit.</p>
          <p style="margin:8px 0 0;color:#888;font-size:12px">Jika tombol tidak berfungsi, salin URL ini:<br>${link}</p>
        </td>
      </tr>
    </table>
  </div>`;
}
