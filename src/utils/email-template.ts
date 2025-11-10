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

// Buatkan template email ke pemilik ketika penyewa mengajukan booking kost
export function newBookingOwnerTemplate(
  ownerName: string,
  tenantName: string,
  kostName: string,
  bookingId: string,
  frontendUrl: string
) {
  return `
  <div style="font-family:Arial,sans-serif;background:#f7f7f9;padding:24px">
    <table role="presentation" width="100%" style="max-width:560px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.06)">
      <tr>
        <td style="padding:24px 24px 0 24px">
          <h2 style="margin:0 0 8px;color:#111">Pemberitahuan Booking Kost Baru</h2>
          <p style="margin:0;color:#555">Hai ${
            ownerName || "Pemilik Kost"
          }, penyewa bernama ${tenantName} telah mengajukan sewa untuk kost Anda: <b>${kostName}</b>.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 24px 24px 24px;text-align:center">
          <a href="${frontendUrl}/owner/bookings/${bookingId}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600">Lihat Booking</a>
        </td>
      </tr>
    </table>
  </div>`;
}

export function notifyOwnerBookingRequestTemplate(
  ownerName: string,
  kostName: string,
  duration: number,
  price: number,
  bookingDate: string
) {
  return `
  <div style="font-family:Arial,sans-serif;background:#f7f7f9;padding:24px">
    <table role="presentation" width="100%" 
      style="max-width:560px;margin:auto;background:#ffffff;border-radius:12px;
      overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.06)">
      
      <tr>
        <td style="padding:24px 24px 0 24px">
          <h2 style="margin:0 0 8px;color:#111">Pengajuan Sewa Baru</h2>
          <p style="margin:0;color:#555">
            Hai ${ownerName || "Pemilik Kost"}, penyewa 
             baru saja mengajukan sewa kost 
            <b>${kostName}</b>.
          </p>
        </td>
      </tr>
      
      <tr>
        <td style="padding:24px;color:#333;font-size:14px">
          <p style="margin:0 0 12px">
            <b>Detail Pengajuan:</b>
          </p>
          <ul style="margin:0;padding-left:16px;color:#444;font-size:14px">
            <li><b>Tanggal Pengajuan:</b> ${bookingDate}</li>
            <li><b>Durasi Sewa:</b> ${duration} bulan</li>
            <li><b>Perkiraan Biaya:</b> Rp ${price.toLocaleString("id-ID")}</li>
          </ul>
          <p style="margin:16px 0 0;color:#666">
            Silakan tinjau pengajuan ini di dashboard Anda dan 
            <b>setujui</b> atau <b>tolak</b> pengajuan tersebut.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:24px;text-align:center">
          <a href="https://www.staykost.my.id/dashboard/bookings"
            style="display:inline-block;background:#111;color:#fff;
            text-decoration:none;padding:12px 18px;border-radius:8px;
            font-weight:600">
            Tinjau Pengajuan
          </a>
        </td>
      </tr>
    </table>
  </div>`;
}

export function bookingApprovedTemplate(
  name: string,
  kostName: string,
  paymentDeadline: string
) {
  return `
  <div style="font-family:Arial,sans-serif;background:#f7f7f9;padding:24px">
    <table role="presentation" width="100%" style="max-width:560px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.06)">
      <tr>
        <td style="padding:24px 24px 0 24px">
          <h2 style="margin:0 0 8px;color:#111">Pengajuan Kost Disetujui</h2>
          <p style="margin:0;color:#555">Hai ${
            name || "Pengguna"
          }, pengajuan sewa Anda untuk <b>${kostName}</b> telah disetujui.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;text-align:center">
          <p style="margin:0;color:#333;font-size:14px">
            Silakan lakukan pembayaran sebelum:
            <br/><b>${paymentDeadline}</b>
          </p>
          <a href="https://www.staykost.my.id/payments" 
            style="display:inline-block;margin-top:16px;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600">
            Bayar Sekarang
          </a>
        </td>
      </tr>
    </table>
  </div>`;
}

export function bookingRejectedTemplate(
  name: string,
  kostName: string,
  reason?: string
) {
  return `
  <div style="font-family:Arial,sans-serif;background:#f7f7f9;padding:24px">
    <table role="presentation" width="100%" style="max-width:560px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.06)">
      <tr>
        <td style="padding:24px 24px 0 24px">
          <h2 style="margin:0 0 8px;color:#111">Pengajuan Kost Ditolak</h2>
          <p style="margin:0;color:#555">Hai ${
            name || "Pengguna"
          }, pengajuan Anda untuk <b>${kostName}</b> telah ditolak.</p>
        </td>
      </tr>
      ${
        reason
          ? `<tr><td style="padding:24px;color:#444;font-size:14px"><b>Alasan Penolakan:</b><br/>${reason}</td></tr>`
          : ""
      }
      <tr>
        <td style="padding:0 24px 24px 24px;color:#666;font-size:13px">
          Anda dapat mencari kost lainnya yang sesuai kebutuhan Anda di StayKost.
        </td>
      </tr>
    </table>
  </div>`;
}

export function paymentSuccessTemplate(
  name: string,
  kostName: string,
  amount: number,
  paymentDate: string
) {
  return `
  <div style="font-family:Arial,sans-serif;background:#f7f7f9;padding:24px">
    <table role="presentation" width="100%" style="max-width:560px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.06)">
      <tr>
        <td style="padding:24px 24px 0 24px">
          <h2 style="margin:0 0 8px;color:#111">Pembayaran Berhasil</h2>
          <p style="margin:0;color:#555">Hai ${
            name || "Pengguna"
          }, pembayaran Anda telah kami terima.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px">
          <p style="margin:0;color:#333;font-size:14px">
            <b>Kost:</b> ${kostName}<br/>
            <b>Jumlah:</b> Rp ${amount.toLocaleString("id-ID")}<br/>
            <b>Tanggal Pembayaran:</b> ${paymentDate}
          </p>
          <p style="margin:16px 0 0;color:#666">Terima kasih telah menggunakan StayKost.</p>
        </td>
      </tr>
    </table>
  </div>`;
}

export function stopRequestTemplate(
  ownerName: string,
  tenantName: string,
  kostName: string,
  stopDate: string
) {
  return `
  <div style="font-family:Arial,sans-serif;background:#f7f7f9;padding:24px">
    <table role="presentation" width="100%" style="max-width:560px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.06)">
      <tr>
        <td style="padding:24px 24px 0 24px">
          <h2 style="margin:0 0 8px;color:#111">Pengajuan Berhenti Sewa</h2>
          <p style="margin:0;color:#555">Hai ${
            ownerName || "Pemilik Kost"
          }, penyewa <b>${tenantName}</b> mengajukan berhenti sewa di kost <b>${kostName}</b>.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;color:#333;font-size:14px">
          <p><b>Tanggal Berhenti:</b> ${stopDate}</p>
          <p style="margin:16px 0 0;color:#666">Silakan tinjau pengajuan ini di dashboard pemilik.</p>
        </td>
      </tr>
    </table>
  </div>`;
}

export function stopRequestApprovedTemplate(
  name: string,
  kostName: string,
  stopDate: string
) {
  return `
  <div style="font-family:Arial,sans-serif;background:#f7f7f9;padding:24px">
    <table role="presentation" width="100%" style="max-width:560px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.06)">
      <tr>
        <td style="padding:24px 24px 0 24px">
          <h2 style="margin:0 0 8px;color:#111">Pengajuan Berhenti Sewa Disetujui</h2>
          <p style="margin:0;color:#555">Hai ${
            name || "Pengguna"
          }, pengajuan berhenti sewa Anda untuk <b>${kostName}</b> telah disetujui oleh pemilik kost.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;color:#333;font-size:14px">
          <p>Anda dapat melakukan <b>check-out</b> pada tanggal <b>${stopDate}</b>.</p>
          <p style="margin:16px 0 0;color:#666">Terima kasih telah menjadi penyewa di StayKost. Kami harap Anda mendapatkan pengalaman yang menyenangkan.</p>
        </td>
      </tr>
    </table>
  </div>`;
}

export function stopRequestRejectedTemplate(
  name: string,
  kostName: string,
  reason?: string
) {
  return `
  <div style="font-family:Arial,sans-serif;background:#f7f7f9;padding:24px">
    <table role="presentation" width="100%" style="max-width:560px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.06)">
      <tr>
        <td style="padding:24px 24px 0 24px">
          <h2 style="margin:0 0 8px;color:#111">Pengajuan Berhenti Sewa Ditolak</h2>
          <p style="margin:0;color:#555">Hai ${
            name || "Pengguna"
          }, pengajuan berhenti sewa Anda untuk <b>${kostName}</b> telah ditolak oleh pemilik kost.</p>
        </td>
      </tr>
      ${
        reason
          ? `<tr><td style="padding:24px;color:#444;font-size:14px"><b>Alasan Penolakan:</b><br/>${reason}</td></tr>`
          : ""
      }
      <tr>
        <td style="padding:0 24px 24px 24px;color:#666;font-size:13px">
          Silakan hubungi pemilik kost untuk informasi lebih lanjut.
        </td>
      </tr>
    </table>
  </div>`;
}
