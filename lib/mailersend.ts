import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || "",
});

interface SendInquiryEmailParams {
  companyName: string;
  category: string;
  name: string;
  email: string;
  phone?: string;
  content: string;
}

/**
 * 1:1 문의 이메일을 관리자에게 발송
 */
export async function sendInquiryEmail({
  companyName,
  category,
  name,
  email,
  phone,
  content,
}: SendInquiryEmailParams) {
  const adminEmails = process.env.ADMIN_EMAIL;
  const fromEmail = process.env.MAILERSEND_SENDER_EMAIL;

  if (!adminEmails) {
    throw new Error("ADMIN_EMAIL 환경변수가 설정되지 않았습니다.");
  }

  if (!process.env.MAILERSEND_API_KEY) {
    throw new Error("MAILERSEND_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  // 발신자 (MailerSend에서 인증된 도메인 사용)
  const sentFrom = new Sender(fromEmail || "noreply@foodlink.co.kr", "FoodLink");

  // 수신자 (관리자) - 콤마로 구분된 여러 이메일 처리
  const adminEmailList = adminEmails
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
  
  if (adminEmailList.length === 0) {
    throw new Error("유효한 관리자 이메일이 없습니다.");
  }

  const recipients = adminEmailList.map((email) => new Recipient(email, "FoodLink Admin"));

  // 이메일 내용 생성
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #000000; border-bottom: 2px solid #000000; padding-bottom: 10px;">
        새로운 1:1 문의가 접수되었습니다
      </h2>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #333333;">파트너사 정보</h3>
        <p><strong>파트너사명:</strong> ${companyName}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #333333;">문의자 정보</h3>
        <p><strong>카테고리:</strong> ${category} (purchase: "구매 문의", partnership: "제휴 문의", other: "기타 제안",)</p> 
        <p><strong>이름:</strong> ${name}</p>
        <p><strong>이메일:</strong> ${email}</p>
        ${phone ? `<p><strong>연락처:</strong> ${phone}</p>` : ""}
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #333333;">문의 내용</h3>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
          ${content}
        </div>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dddddd; color: #666666; font-size: 12px;">
        <p>이 메일은 FoodLink 1:1 문의 시스템에서 자동 발송되었습니다.</p>
        <p>문의자에게 답변하시려면 위 이메일 주소로 직접 회신해주세요.</p>
      </div>
    </div>
  `;

  const textContent = `
새로운 1:1 문의가 접수되었습니다

파트너사 정보
- 파트너사명: ${companyName}

문의자 정보
- 카테고리: ${category}
- 이름: ${name}
- 이메일: ${email}
${phone ? `- 연락처: ${phone}` : ""}

문의 내용
${content}

---
이 메일은 FoodLink 1:1 문의 시스템에서 자동 발송되었습니다.
문의자에게 답변하시려면 위 이메일 주소로 직접 회신해주세요.
  `;

  // 이메일 파라미터 설정
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(new Sender(email, name)) // 답장은 문의자에게
    .setSubject(`[FoodLink] ${companyName}에 새로운 문의가 접수되었습니다`)
    .setHtml(htmlContent)
    .setText(textContent);

  try {
    await mailerSend.email.send(emailParams);
    return { success: true };
  } catch (error) {
    console.error("이메일 발송 실패:", error);
    throw error;
  }
}
