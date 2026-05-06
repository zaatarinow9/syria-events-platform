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

      // 1. إشعار للإدارة
      await transporter.sendMail({
        from: `"نظام وينكم" <${process.env.EMAIL_USER}>`,
        to: "a7mad.y.alkilani@gmail.com",
        subject: `طلب جديد: ${data.eventTitle} (${request_number})`,
        html: `<div dir="rtl"><h2>وصل طلب جديد للمراجعة</h2><p>الفعالية: ${data.eventTitle}</p></div>`,
      });

      // 2. إشعار للمستخدم (احترافي)
      await transporter.sendMail({
        from: `"منصة وينكم" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: `تأكيد استلام طلبك - كود التتبع: ${request_number}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background: #073D35; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #C8A75A; margin: 0;">منصة وينكم للفعاليات</h1>
            </div>
            <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #073D35;">أهلاً بك يا ${data.fullName}،</h2>
              <p>لقد تم استلام طلبك لتنظيم فعالية <strong>"${data.eventTitle}"</strong> بنجاح.</p>
              <div style="background: #fdfbf7; border: 1px solid #C8A75A; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 0; color: #555;">كود التتبع المرجعي الخاص بك:</p>
                <h2 style="margin: 10px 0; font-family: monospace; letter-spacing: 5px; color: #073D35;">${request_number}</h2>
              </div>
              <h3>تفاصيل الطلب:</h3>
              <ul style="list-style: none; padding: 0;">
                <li>📍 <strong>الموقع:</strong> ${data.governorate} - ${data.city}</li>
                <li>📅 <strong>التاريخ:</strong> ${data.eventDate}</li>
                <li>⏰ <strong>الوقت:</strong> من ${data.startTime} إلى ${data.endTime}</li>
              </ul>
              <p>يمكنك الآن استخدام هذا الكود لتتبع حالة الطلب ورفع وثائق الموافقة الرسمية عبر الرابط أدناه:</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/track" style="background: #073D35; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-bold: true;">تتبع الطلب الآن</a>
              </div>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ request_number });
  } catch (err) {
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}