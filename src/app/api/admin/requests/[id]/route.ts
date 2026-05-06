import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // انتظار الـ Promise لحل مشكلة Next.js 15
    const body = await req.json();
    const supabase = createAdminClient();

    // 1. تحديث الطلب في قاعدة البيانات
    const { data: updatedData, error } = await supabase
      .from("permit_requests")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // 2. إذا كانت الحالة الجديدة "published" (منشور/موافق عليه)، أرسل إيميلاً للمستخدم
    if (body.status === "published" && updatedData) {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        await transporter.sendMail({
          from: `"منصة وينكم" <${process.env.EMAIL_USER}>`,
          to: updatedData.email,
          subject: `تهانينا! تمت الموافقة على فعالية: ${updatedData.event_title}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
              <div style="background: #073D35; padding: 20px; text-align: center; border-radius: 10px;">
                <h1 style="color: #C8A75A; margin: 0;">تمت الموافقة بنجاح</h1>
              </div>
              <div style="padding: 20px;">
                <h2>مرحباً ${updatedData.full_name}،</h2>
                <p>نود إعلامك بأن الإدارة قد وافقت على طلبك لتنظيم فعالية <strong>"${updatedData.event_title}"</strong>.</p>
                <p>طلبك الآن منشور بشكل رسمي على المنصة ويمكن للجميع رؤيته.</p>
                <p>نتمنى لكم فعالية ناجحة وموفقة.</p>
                <hr style="border: none; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #888;">هذا البريد مرسل تلقائياً من نظام منصة وينكم.</p>
              </div>
            </div>
          `,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH Error:", err);
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}