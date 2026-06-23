import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const image = formData.get("image") as File | null;
  const rawText = formData.get("raw_text") as string;
  const extractedData = formData.get("extracted_data") as string;
  const incorrectFields = formData.get("incorrect_fields") as string;
  const comment = formData.get("comment") as string;

  let imageUrl: string | null = null;

  // Subir imagen al Storage de Supabase
  if (image) {
    const ext = image.name.split(".").pop() ?? "jpg";
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("feedback-images")
      .upload(fileName, image, { contentType: image.type });

    if (!uploadError) {
      const { data } = supabase.storage
        .from("feedback-images")
        .getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }
  }

  // Guardar registro en la tabla feedback
  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    user_email: user.email,
    image_url: imageUrl,
    raw_text: rawText,
    extracted_data: JSON.parse(extractedData),
    incorrect_fields: JSON.parse(incorrectFields),
    comment: comment || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
