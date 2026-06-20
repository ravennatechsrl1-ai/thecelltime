import { SupabaseClient } from "@supabase/supabase-js";

export async function uploadProductImage(
  supabase: SupabaseClient,
  file: File
): Promise<string> {
  const fileExt = (file.name.split(".").pop() ?? "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const safeExt = fileExt || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const contentType =
    file.type ||
    (safeExt === "png"
      ? "image/png"
      : safeExt === "webp"
        ? "image/webp"
        : "image/jpeg");

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, fileBuffer, { contentType, upsert: false });

  if (uploadError) {
    throw new Error("Image upload failed.");
  }

  const { data: publicUrlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
