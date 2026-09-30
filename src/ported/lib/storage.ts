import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "site-images";

/** Returns long-lived signed URL (1 year) — bucket is private. */
export async function signedUrlFor(path: string, expiresIn = 60 * 60 * 24 * 365): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error || !data) throw error ?? new Error("sign failed");
  return data.signedUrl;
}

async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  try {
    const bitmap = await createImageBitmap(file);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close?.();
    return dims;
  } catch {
    return { width: 0, height: 0 };
  }
}

export async function uploadImage(file: File, folder = "uploads", alt = "", tags: string[] = []) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "application/octet-stream", cacheControl: "31536000" });
  if (upErr) throw upErr;
  const url = await signedUrlFor(path);
  const { width, height } = await readImageDimensions(file);
  const { data: row, error: dbErr } = await supabase
    .from("media_assets")
    .insert({
      storage_path: path,
      url,
      alt,
      width,
      height,
      size_bytes: file.size,
      mime_type: file.type || "application/octet-stream",
      tags,
    })
    .select()
    .single();
  if (dbErr) throw dbErr;
  return row;
}

export async function uploadRawFile(file: File, folder = "docs") {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return { path, url: await signedUrlFor(path), name: file.name, ext };
}
