// ID: API_CREATE_GEO_STORAGE
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
      latitude: data.latitude, // <-- خزن خط العرض هنا
      longitude: data.longitude, // <-- خزن خط الطول هنا
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

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://syria-events-platform.vercel.app";
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

      await transporter.sendMail({
        from: `"منصة وينكم" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: `تم استلام طلبك بنجاح | كود التتبع: ${request_number}`,
        html: `<div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;"><h2>تم استلام طلبك: ${request_number}</h2><p>يمكنك التتبع عبر: <a href="${cleanBaseUrl}/track">${cleanBaseUrl}/track</a></p></div>`,
      });

      await transporter.sendMail({
        from: `"نظام وينكم" <${process.env.EMAIL_USER}>`,
        to: "a7mad.y.alkilani@gmail.com",
        subject: `إشعار إداري: طلب جديد (${request_number})`,
        html: `<div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;"><h2>يوجد طلب ترخيص جديد بانتظار المراجعة</h2><p><strong>رقم المرجع:</strong> ${request_number}</p><p><strong>الفعالية:</strong> ${data.eventTitle}</p></div>`,
      });
    }

    return NextResponse.json({ request_number });
  } catch (err) {
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}