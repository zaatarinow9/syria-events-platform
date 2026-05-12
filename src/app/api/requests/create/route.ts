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

    const { data: insertedData, error: dbError } = await supabase.from("permit_requests").insert([payload]).select().single();
    if (dbError) throw dbError;

    // إعداد النقل عبر البريد
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://syria-events-platform.vercel.app';
        const trackUrl = `${baseUrl}/track/${request_number}`;
        const adminUrl = `${baseUrl}/admin/requests/${insertedData.id}`;

        // 1️⃣ إرسال إيميل التأكيد للمستخدم (تصميم فخم)
        await transporter.sendMail({
          from: `"منصة وينكم" <${process.env.EMAIL_USER}>`,
          to: data.email,
          subject: `تم استلام طلبك بنجاح | كود التتبع: ${request_number}`,
          html: `
            <div dir="rtl" style="font-family: 'Tajawal', Tahoma, Arial, sans-serif; background-color: #f4f7f6; padding: 30px;">
              <table width="100%" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; border: 1px solid #eef2f1;">
                <tr style="background-color: #073D35; text-align: center;">
                  <td style="padding: 30px;">
                    <h1 style="color: white; margin: 0;">مَنْصَـــة وَيْنِكُـــم</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px; text-align: right;">
                    <h2 style="color: #073D35;">مرحباً ${data.fullName}،</h2>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.8;">لقد تم تسجيل طلبك <strong>"${data.eventTitle}"</strong> بنجاح.</p>
                    <div style="background: #FDFBF7; border: 2px dashed #C8A75A; padding: 20px; text-align: center; margin: 20px 0;">
                      <p style="margin: 0; font-size: 14px;">كود التتبع الخاص بك</p>
                      <p style="font-size: 32px; font-weight: bold; color: #C8A75A; margin: 10px 0;">${request_number}</p>
                    </div>
                    <a href="${trackUrl}" style="display: block; background: #073D35; color: white; padding: 15px; text-align: center; text-decoration: none; border-radius: 12px; font-weight: bold;">تتبع حالة الطلب</a>
                  </td>
                </tr>
              </table>
            </div>
          `,
        });

        // 2️⃣ إرسال إيميل تنبيه لك (كإدمن)
        await transporter.sendMail({
          from: `"نظام التنبيهات" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER, // سيرسل لنفس إيميل الإدارة
          subject: `🔔 طلب جديد بانتظار المراجعة: ${data.eventTitle}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #fff;">
              <div style="border: 1px solid #eee; border-right: 5px solid #C8A75A; padding: 20px; border-radius: 10px;">
                <h2 style="color: #073D35; margin-top: 0;">وصول طلب ترخيص جديد</h2>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p><strong>اسم الفعالية:</strong> ${data.eventTitle}</p>
                <p><strong>المقدم:</strong> ${data.fullName} (${data.submitterRole})</p>
                <p><strong>المحافظة:</strong> ${data.governorate}</p>
                <p><strong>التاريخ:</strong> ${data.eventDate}</p>
                <p><strong>العدد المتوقع:</strong> ${data.expectedAttendees}</p>
                <div style="margin-top: 30px;">
                  <a href="${adminUrl}" style="background: #C8A75A; color: #073D35; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">فتح تفاصيل الطلب في لوحة الإدارة</a>
                </div>
              </div>
            </div>
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