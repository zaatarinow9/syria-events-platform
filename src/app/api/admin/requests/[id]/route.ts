import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = createAdminClient();

    const { data: updatedData, error } = await supabase
      .from("permit_requests")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (body.status === "published" && updatedData) {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        await transporter.sendMail({
          from: `"منصة وينكم" <${process.env.EMAIL_USER}>`,
          to: updatedData.email,
          subject: `تمت الموافقة! فعاليتك الآن منشورة على منصة وينكم 🎉`,
          html: `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
              <meta charset="UTF-8">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
              </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: 'thmanyah', 'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(47, 158, 109, 0.1); border: 1px solid #f0f0f0;">
                      <tr>
                        <td style="background-color: #2F9E6D; padding: 40px 30px; text-align: center; border-bottom: 4px solid #1c744e;">
                          <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 40px; display: inline-block; line-height: 80px; margin-bottom: 15px;">
                            <span style="font-size: 40px;">🎉</span>
                          </div>
                          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">تمت الموافقة والنشر</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px 30px;">
                          <h2 style="color: #073D35; font-size: 24px; margin: 0 0 20px 0; font-weight: 700;">مرحباً ${updatedData.full_name}،</h2>
                          <p style="color: #555555; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                            يسعدنا إعلامك بأنه قد تمت مراجعة الوثائق المرفقة وتمت الموافقة على طلبك بنجاح. فعاليتك <strong style="color: #073D35;">"${updatedData.event_title}"</strong> أصبحت الآن منشورة ومتاحة للجمهور عبر منصتنا.
                          </p>
                          
                          <div style="background-color: #f8faf9; border-right: 4px solid #C8A75A; padding: 20px; border-radius: 8px 0 0 8px; margin-bottom: 30px;">
                            <p style="color: #333333; margin: 0; font-size: 15px; line-height: 1.6; font-weight: 500;">
                              نحن فخورون بجهودكم في تنظيم الأنشطة المدنية ونتمنى لكم فعالية ناجحة ومثمرة تلبي كافة التطلعات.
                            </p>
                          </div>

                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/events/${updatedData.id}" style="display: inline-block; background-color: #073D35; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: bold; font-size: 16px; border-bottom: 3px solid #052e28;">عرض صفحة الفعالية</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f5f8f7; padding: 25px; text-align: center; border-top: 1px solid #eeeeee;">
                          <p style="color: #888888; font-size: 13px; margin: 0; line-height: 1.6;">
                            مع تحيات فريق عمل<br>
                            <strong style="color: #073D35;">منصة وينكم للفعاليات</strong>
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
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}