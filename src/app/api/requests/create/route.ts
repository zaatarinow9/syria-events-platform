import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

function generateShortCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
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

    let campaign_image_path = null;

    if (data.campaignLogo) {
      try {
        const matches = data.campaignLogo.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          const fileExt = mimeType.split('/')[1] || 'png';
          const fileName = `logo-${request_number}-${Date.now()}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("request-files")
            .upload(fileName, buffer, { contentType: mimeType });

          if (!uploadError && uploadData) {
            campaign_image_path = uploadData.path;
          }
        }
      } catch (imageErr) {
        console.error("فشل رفع صورة الحملة:", imageErr);
      }
    }

    const payload = {
      request_number,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      submitter_role: data.submitterRole,
      organization_name: data.organizationName || null,
      event_title: data.eventTitle,
      event_type: data.eventType,
      governorate: data.governorate,
      city: data.city || null,
      location: data.location,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      event_date: data.eventDate,
      expected_attendees: Number(data.expectedAttendees),
      start_time: data.startTime,
      end_time: data.endTime,
      route: data.route || null,
      event_goal: data.eventGoal,
      committee_head_name: data.committeeHeadName,
      committee_head_phone: data.committeeHeadPhone,
      committee_head_email: data.committeeHeadEmail,
      member_1_name: data.member1Name || null,
      member_1_phone: data.member1Phone || null,
      member_2_name: data.member2Name || null,
      member_2_phone: data.member2Phone || null,
      campaign_image: campaign_image_path
    };

    const { error: dbError } = await supabase.from("permit_requests").insert([payload]);
    if (dbError) throw dbError;

    // إرسال الإيميل بتصميم "رهيب"
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const trackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://syria-events-platform.vercel.app'}/track/${request_number}`;

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
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
                body { font-family: 'Tajawal', Tahoma, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
              </style>
            </head>
            <body>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f6; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eef2f1;">
                      <tr>
                        <td align="center" style="background-color: #073D35; padding: 40px 20px;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">مَنْصَـــة وَيْنِكُـــم</h1>
                          <p style="color: #C8A75A; margin: 10px 0 0 0; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 2px;">الفعاليات المدنية السورية</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px 30px; text-align: right;" dir="rtl">
                          <h2 style="color: #073D35; font-size: 20px; margin-bottom: 20px;">مرحباً ${data.fullName}،</h2>
                          <p style="color: #4b5563; line-height: 1.8; font-size: 16px;">
                            لقد تم استلام طلبك لتنظيم فعالية <strong>"${data.eventTitle}"</strong> بنجاح. فريق الإدارة سيقوم بمراجعة البيانات والوثائق المرفقة في أقرب وقت.
                          </p>
                          
                          <div style="background-color: #FDFBF7; border: 2px dashed #C8A75A; border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0;">
                            <p style="color: #073D35; font-size: 14px; margin-bottom: 10px; font-weight: bold;">كود التتبع الخاص بك</p>
                            <span style="font-family: monospace; font-size: 36px; font-weight: bold; color: #C8A75A; letter-spacing: 5px;">${request_number}</span>
                          </div>

                          <p style="color: #6b7280; font-size: 14px; margin-bottom: 30px;">
                            يرجى الاحتفاظ بهذا الكود لتتمكن من تتبع حالة الطلب، رفع وثيقة الموافقة لاحقاً، أو تعديل البيانات.
                          </p>

                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="center">
                                <a href="${trackUrl}" style="background-color: #073D35; color: #ffffff; padding: 15px 35px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; border-bottom: 3px solid #052e28;">تتبع حالة الطلب الآن</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #edf2f1;">
                          <p style="color: #9ca3af; font-size: 12px; margin: 0;">هذا الإيميل مرسل تلقائياً من منصة وينكم للفعاليات المدنية.</p>
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
      } catch (mailErr) {
        console.error("Mail Error:", mailErr);
      }
    }

    return NextResponse.json({ request_number });
  } catch (err) {
    console.error("Internal Server Error:", err);
    return NextResponse.json({ error: "حدث خطأ داخلي في الخادم" }, { status: 500 });
  }
}