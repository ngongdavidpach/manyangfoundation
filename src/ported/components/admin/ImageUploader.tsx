import React, { useState } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { uploadImage } from "../../lib/storage";

interface Props {
  value?: string;
  onChange: (url: string, path?: string) => void;
  label?: string;
  folder?: string;
}

export const ImageUploader: React.FC<Props> = ({
  value,
  onChange,
  label = "Image",
  folder = "uploads",
}) => {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handle = async (file: File) => {
    setErr(null);
    setBusy(true);
    try {
      const row = await uploadImage(file, folder, "", [folder]);
      onChange(row.url, row.storage_path);
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-600">{label}</label>
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="w-20 h-20 object-cover rounded-md border" />
        ) : (
          <div className="w-20 h-20 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])}
            className="block text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white file:text-xs file:font-medium hover:file:bg-blue-700"
          />
          {value && (
            <button
              onClick={() => onChange("")}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          )}
          {busy && (
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Upload className="w-3 h-3 animate-pulse" /> Optimizing & uploading…
            </p>
          )}
          {err && <p className="text-xs text-rose-600">{err}</p>}
        </div>
      </div>
    </div>
  );
};
