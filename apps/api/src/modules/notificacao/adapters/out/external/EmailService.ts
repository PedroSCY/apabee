import { Injectable, Logger } from '@nestjs/common'
import { Resend } from 'resend'

const REMETENTE = 'Apabee <noreply@apabee.com.br>'

function buildHtml(titulo: string, corpo: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Cabeçalho -->
        <tr>
          <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:24px 32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.5px;">🐝 Apabee</p>
            <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Associação Pratense de Apicultura · Prata - PB</p>
          </td>
        </tr>
        <!-- Corpo -->
        <tr>
          <td style="background:#fff;padding:32px;">
            <h1 style="margin:0 0 12px;font-size:18px;color:#111827;font-weight:600;">${titulo}</h1>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">${corpo}</p>
            <a href="https://apabee.vercel.app/dashboard"
               style="display:inline-block;padding:10px 24px;background:#f59e0b;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">
              Acessar o sistema
            </a>
          </td>
        </tr>
        <!-- Rodapé -->
        <tr>
          <td style="background:#f3f4f6;padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              APA · Prata - PB · <a href="mailto:contato@apabee.org.br" style="color:#9ca3af;">contato@apabee.org.br</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly resend: Resend | null

  constructor() {
    const key = process.env.RESEND_API_KEY
    this.resend = key ? new Resend(key) : null
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY não configurada — e-mails transacionais desabilitados')
    }
  }

  async send(to: string, subject: string, titulo: string, corpo: string): Promise<void> {
    if (!this.resend) return
    try {
      await this.resend.emails.send({
        from: REMETENTE,
        to,
        subject,
        html: buildHtml(titulo, corpo),
      })
    } catch (err) {
      this.logger.error(`Falha ao enviar e-mail para ${to}: ${(err as Error).message}`)
    }
  }
}
