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
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          });

          const eventUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://syria-events-platform.vercel.app'}/events/${updatedData.id}`;

          await transporter.sendMail({
            from: `"منصة وينكم" <${process.env.EMAIL_USER}>`,
            to: updatedData.email,
            subject: `أخبار رائعة! تمت الموافقة على نشر فعاليتك 🎉`,
            html: `
              <!DOCTYPE html>
              <html lang="ar" dir="rtl">
              <head>
                <meta charset="UTF-8">
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
                  body { font-family: 'Tajawal', Tahoma, Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 0; }
                </style>
              </head>
              <body>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; padding: 40px 20px;">
                  <tr>
                    <td align="center">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(47, 158, 109, 0.1); border: 1px solid #dcfce7;">
                        <tr>
                          <td align="center" style="background-color: #2F9E6D; padding: 50px 20px;">
                            <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; line-height: 80px; margin-bottom: 20px; display: inline-block;">
                                <span style="font-size: 40px;">🎉</span>
                            </div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold;">تم النشر بنجاح!</h1>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 40px 30px; text-align: right;" dir="rtl">
                            <h2 style="color: #073D35; font-size: 22px; margin-bottom: 20px;">تهانينا ${updatedData.full_name}،</h2>
                            <p style="color: #374151; line-height: 1.8; font-size: 16px;">
                              يسعدنا إبلاغك بأن طلبك لتنظيم فعالية <strong style="color: #2F9E6D;">"${updatedData.event_title}"</strong> قد تمت مراجعته والموافقة عليه. الفعالية الآن متاحة للجمهور عبر منصتنا.
                            </p>
                            
                            <div style="background-color: #f8fafc; border-right: 4px solid #C8A75A; padding: 20px; margin: 30px 0; border-radius: 8px 0 0 8px;">
                              <p style="color: #4b5563; font-size: 15px; margin: 0; line-height: 1.6;">
                                يمكنك الآن مشاركة رابط الفعالية المباشر مع جمهورك والبدء في الترويج لها. نتمنى لكم تنظيماً ناجحاً!
                              </p>
                            </div>

                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td align="center" style="padding-top: 20px;">
                                  <a href="${eventUrl}" style="background-color: #073D35; color: #ffffff; padding: 18px 45px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(7, 61, 53, 0.2);">مشاهدة الفعالية على الموقع</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding: 30px 20px; color: #9ca3af; font-size: 13px;">
                            مع تحيات فريق <strong style="color: #073D35;">وينكم</strong>
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
        } catch (mailError) {
          console.error("خطأ صامت في إرسال الإيميل:", mailError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Database Update Error:", err);
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}