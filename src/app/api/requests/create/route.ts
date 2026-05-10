// ID: API_BULLETPROOF_INSERT
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

    // تأمين دقيق جداً لكل حقل لمنع أي خطأ من Supabase
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
      expected_attendees: Number(data.expectedAttendees) || 1, // التأكد من أنه رقم
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

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://syria-events-platform.vercel.app";
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

        await transporter.sendMail({
          from: `"منصة وينكم" <${process.env.EMAIL_USER}>`,
          to: data.email,
          subject: `تم استلام طلبك بنجاح | كود التتبع: ${request_number}`,
          html: `<div dir="rtl"><h2>أهلاً بك، تم تسجيل طلبك: ${data.eventTitle}</h2><p>كود التتبع الخاص بك هو: <b>${request_number}</b></p></div>`,
        });

        await transporter.sendMail({
          from: `"نظام وينكم" <${process.env.EMAIL_USER}>`,
          to: "a7mad.y.alkilani@gmail.com",
          subject: `إشعار إداري: طلب جديد (${request_number})`,
          html: `<div dir="rtl"><h2>يوجد طلب ترخيص جديد بانتظار المراجعة</h2><p><strong>رقم المرجع:</strong> ${request_number}</p><p><strong>الفعالية:</strong> ${data.eventTitle}</p></div>`,
        });
      } catch (mailErr) {}
    }

    return NextResponse.json({ request_number });
  } catch (err) {
    console.error("Internal Server Error:", err);
    return NextResponse.json({ error: "حدث خطأ داخلي في الخادم" }, { status: 500 });
  }
}