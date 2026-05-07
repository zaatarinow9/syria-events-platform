import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const resolvedParams = await params;
    const code = resolvedParams.code.toUpperCase();
    const supabase = createAdminClient();

    // تم تعديل الاستعلام لجلب كافة البيانات (*)
    const { data, error } = await supabase
      .from("permit_requests")
      .select("*")
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