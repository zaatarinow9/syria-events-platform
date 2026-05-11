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

    // معالجة صورة الحملة (الشعار) إن وجدت كـ Base64
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
        // لا نوقف الطلب إن فشل رفع الصورة فقط
      }
    }

    const payload = {
      request_number: request_number,
      full_name: data.fullName || "",
      email: data.email || "",
      phone: data.phone || "",
      submitter_role: data.submitterRole || "",
      organization_name: data.organizationName || null,
      event_title: data.eventTitle || "",
      event_type: data.eventType || "",
      governorate: data.governorate || "",
      city: data.city || null,
      location: data.location || "",
      latitude: Number(data.latitude) || 34.8,
      longitude: Number(data.longitude) || 38.0,
      event_date: data.eventDate || "2024-01-01",
      expected_attendees: Number(data.expectedAttendees) || 1,
      start_time: data.startTime || "00:00",
      end_time: data.endTime || "00:00",
      route: data.route || null,
      event_goal: data.eventGoal || "",
      committee_head_name: data.committeeHeadName || data.fullName,
      committee_head_phone: data.committeeHeadPhone || data.phone,
      committee_head_email: data.committeeHeadEmail || data.email,
      member_1_name: data.member1Name || null,
      member_1_phone: data.member1Phone || null,
      member_2_name: data.member2Name || null,
      member_2_phone: data.member2Phone || null,
      campaign_image: campaign_image_path // حفظ مسار الشعار
    };

    const { error: dbError } = await supabase.from("permit_requests").insert([payload]);

    if (dbError) {
      console.error("Supabase Error:", dbError);
      return NextResponse.json(
        { error: `خطأ في قاعدة البيانات: ${dbError.message || dbError.details}` }, 
        { status: 400 }
      );
    }

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        await transporter.sendMail({
          from: `"منصة وينكم" <${process.env.EMAIL_USER}>`,
          to: data.email,
          subject: `تم استلام طلبك بنجاح | كود التتبع: ${request_number}`,
          html: `<div dir="rtl"><h2>أهلاً بك، تم تسجيل طلبك: ${data.eventTitle}</h2><p>كود التتبع الخاص بك هو: <b>${request_number}</b></p></div>`,
        });
      } catch (mailErr) {}
    }

    return NextResponse.json({ request_number });
  } catch (err) {
    console.error("Internal Server Error:", err);
    return NextResponse.json({ error: "حدث خطأ داخلي في الخادم" }, { status: 500 });
  }
}