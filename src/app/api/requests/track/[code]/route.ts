import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request, { params }: { params: { code: string } }) {
  try {
    const code = params.code.toUpperCase();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("permit_requests")
      .select("request_number, event_title, governorate, status, created_at")
      .eq("request_number", code)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}