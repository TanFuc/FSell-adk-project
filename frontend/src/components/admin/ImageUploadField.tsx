import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/services/api";
import { optimizeImageFile } from "@/lib/image-upload";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadFieldProps {
  id: string;
  label: string;
  value: string;
  required?: boolean;
  placeholder?: string;
  onChange: (url: string) => void;
}

export function ImageUploadField({
  id,
  label,
  value,
  required,
  placeholder,
  onChange,
}: ImageUploadFieldProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const optimized = await optimizeImageFile(file);
      const uploaded = await adminApi.uploadImage(optimized);
      onChange(uploaded.imageUrl);
      toast({
        title: "Upload thành công",
        description: "Ảnh đã được tối ưu và lưu lên cloud",
        variant: "success",
      });
    } catch {
      toast({
        title: "Upload thất bại",
        description: "Không thể xử lý hoặc tải ảnh lên",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://..."}
        />
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {value && (
        <img
          src={value}
          alt="Preview"
          className="w-full h-32 object-cover rounded mt-2 border"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
    </div>
  );
}
