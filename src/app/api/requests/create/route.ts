import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

function generateShortCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const request_number = generateShortCode();
    const supabase = createAdminClient();

    const { error } = await supabase.from("permit_requests").insert([{
      request_number,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      submitter_role: data.submitterRole,
      organization_name: data.organizationName,
      event_title: data.eventTitle,
      event_type: data.eventType,
      governorate: data.governorate,
      city: data.city,
      location: data.location,
      event_date: data.eventDate,
      expected_attendees: data.expectedAttendees,
      start_time: data.startTime,
      end_time: data.endTime,
      route: data.route,
      event_goal: data.eventGoal,
      committee_head_name: data.committeeHeadName,
      committee_head_phone: data.committeeHeadPhone,
      committee_head_email: data.committeeHeadEmail,
      member_1_name: data.member1Name,
      member_1_phone: data.member1Phone,
      member_2_name: data.member2Name,
      member_2_phone: data.member2Phone,
    }]);

    if (error) throw error;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      // معالجة الرابط بشكل ذكي لتجنب الأخطاء
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://syria-events-platform.vercel.app";
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

      await transporter.sendMail({
        from: `"منصة وينكم" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: `تم استلام طلبك بنجاح | كود التتبع: ${request_number}`,
        html: `
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
            </style>
          </head>
          <body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: 'Cairo', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(7, 61, 53, 0.08); border: 1px solid #f0f0f0;">
                    <tr>
                      <td style="background-color: #073D35; padding: 40px 30px; text-align: center; border-bottom: 4px solid #C8A75A;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; font-family: 'Cairo', sans-serif;">منصة وينكم</h1>
                        <p style="color: #C8A75A; margin: 10px 0 0 0; font-size: 16px; font-family: 'Cairo', sans-serif;">للفعاليات والتجمعات المدنية السورية</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #073D35; font-size: 24px; margin: 0 0 20px 0; font-weight: 700; font-family: 'Cairo', sans-serif;">أهلاً بك، ${data.fullName}</h2>
                        <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; font-family: 'Cairo', sans-serif;">
                          لقد تم تسجيل طلبك لتنظيم فعالية <strong style="color: #073D35;">"${data.eventTitle}"</strong> في نظامنا بنجاح. يرجى الاحتفاظ بكود التتبع أدناه للرجوع لطلبك وإرفاق المستندات المطلوبة.
                        </p>
                        
                        <div style="background-color: #FDFBF7; border: 1px dashed #C8A75A; border-radius: 16px; padding: 25px; text-align: center; margin-bottom: 30px;">
                          <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0; font-weight: 600; font-family: 'Cairo', sans-serif;">كود التتبع المرجعي</p>
                          <div style="font-family: monospace; font-size: 36px; font-weight: bold; color: #073D35; letter-spacing: 8px;">${request_number}</div>
                        </div>

                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8faf9; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                          <tr>
                            <td style="padding-bottom: 15px;">
                              <span style="color: #888888; font-size: 13px; display: block; margin-bottom: 4px; font-family: 'Cairo', sans-serif;">موقع الفعالية</span>
                              <strong style="color: #333333; font-size: 15px; font-family: 'Cairo', sans-serif;">${data.governorate} - ${data.city}</strong>
                            </td>
                            <td style="padding-bottom: 15px;">
                              <span style="color: #888888; font-size: 13px; display: block; margin-bottom: 4px; font-family: 'Cairo', sans-serif;">تاريخ الفعالية</span>
                              <strong style="color: #333333; font-size: 15px; font-family: 'Cairo', sans-serif;">${data.eventDate}</strong>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <span style="color: #888888; font-size: 13px; display: block; margin-bottom: 4px; font-family: 'Cairo', sans-serif;">توقيت البداية</span>
                              <strong style="color: #333333; font-size: 15px; font-family: 'Cairo', sans-serif;" dir="ltr">${data.startTime}</strong>
                            </td>
                            <td>
                              <span style="color: #888888; font-size: 13px; display: block; margin-bottom: 4px; font-family: 'Cairo', sans-serif;">توقيت النهاية</span>
                              <strong style="color: #333333; font-size: 15px; font-family: 'Cairo', sans-serif;" dir="ltr">${data.endTime}</strong>
                            </td>
                          </tr>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <a href="${cleanBaseUrl}/track" style="display: inline-block; background-color: #073D35; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: bold; font-size: 16px; border-bottom: 3px solid #052e28; font-family: 'Cairo', sans-serif;">تتبع حالة الطلب الآن</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #f5f8f7; padding: 25px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="color: #888888; font-size: 13px; margin: 0; line-height: 1.6; font-family: 'Cairo', sans-serif;">
                          هذا البريد الإلكتروني مُرسل آلياً من نظام منصة وينكم.<br>
                          يرجى عدم الرد على هذا البريد.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      await transporter.sendMail({
        from: `"نظام وينكم" <${process.env.EMAIL_USER}>`,
        to: "a7mad.y.alkilani@gmail.com",
        subject: `إشعار إداري: طلب جديد (${request_number})`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #073D35;">يوجد طلب ترخيص جديد بانتظار المراجعة</h2>
            <p><strong>رقم المرجع:</strong> ${request_number}</p>
            <p><strong>اسم الفعالية:</strong> ${data.eventTitle}</p>
            <p><strong>المحافظة:</strong> ${data.governorate}</p>
            <p><strong>مقدم الطلب:</strong> ${data.fullName}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ request_number });
  } catch (err) {
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}