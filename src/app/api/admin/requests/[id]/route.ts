import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: Request, context: any) {
  try {
    const { id } = context.params;
    const body = await req.json();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("permit_requests")
      .update(body)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}