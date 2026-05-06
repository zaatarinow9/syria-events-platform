import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    // التعديل هنا: يجب عمل await للـ params
    const resolvedParams = await params;
    const code = resolvedParams.code.toUpperCase();
    
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const supabase = createAdminClient();

    if (!files || files.length === 0 || files.length > 3) {
      return NextResponse.json({ error: "يجب رفع من 1 إلى 3 صور فقط" }, { status: 400 });
    }

    const { data: request, error: fetchError } = await supabase
      .from("permit_requests")
      .select("id, event_title, approval_documents")
      .eq("request_number", code)
      .single();

    if (fetchError || !request) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    const uploadedUrls = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${code}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      
      const { data, error } = await supabase.storage
        .from("request-files")
        .upload(fileName, buffer, { contentType: file.type });
        
      if (!error && data) uploadedUrls.push(data.path);
    }

    const currentDocs = request.approval_documents || [];
    const newDocs = [...currentDocs, ...uploadedUrls];

    await supabase
      .from("permit_requests")
      .update({ 
        approval_documents: newDocs, 
        status: "waiting_approval_document"
      })
      .eq("request_number", code);

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "a7mad.y.alkilani@gmail.com",
        subject: `تم رفع صور جديدة للطلب (${code})`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif;">
            <h2>قام المستخدم برفع صور موافقة جديدة</h2>
            <p><strong>رقم الطلب:</strong> ${code}</p>
            <p><strong>الفعالية:</strong> ${request.event_title}</p>
            <br/>
            <p>يرجى الدخول للوحة الإدارة لمراجعة الملفات المرفقة وتحديث حالة الطلب.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "حدث خطأ أثناء الرفع" }, { status: 500 });
  }
}