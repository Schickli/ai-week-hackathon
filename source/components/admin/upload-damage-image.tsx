"use client";

import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/shared/dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Input } from "../ui/input";

type UploadDamageImageSubmitPayload = {
  description: string;
  category: string;
  imageId: string;
  publicUrl: string;
};

type UploadDamageImageProps = {
  onSubmit?: (payload: UploadDamageImageSubmitPayload) => void;
};

const UploadDamageImage = ({ onSubmit }: UploadDamageImageProps) => {
  const props = useSupabaseUpload({
    bucketName: "damage-images",
    path: "v0",
    allowedMimeTypes: ["image/jpeg", "image/jpg"],
    maxFiles: 5,
    maxFileSize: 1000 * 1000 * 10, // 10MB,
    publicBucket: true,
    upsert: true,
  });

  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [category, setCategory] = useState("");

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;
      setSubmitting(true);
      // Ensure upload executed (if not already successful)
      let assetsToSubmit = props.assets;
      if (!props.isSuccess) {
        const result = await props.onUpload();
        assetsToSubmit = result.assets;
      }
      onSubmit({ description, imageId: assetsToSubmit[0].key, publicUrl: assetsToSubmit[0].publicUrl || "" ,category: category });
      // Reset form + dropzone state
      setDescription("");
      props.reset();
      setSubmitting(false);
    },
    [onSubmit, props, description, category]
  );

  return (
    <div className="flex flex-col h-auto w-auto">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs leading-relaxed">
          <strong className="block mb-1">API usage</strong>
          <p className="text-muted-foreground">
            You can also send this via our REST API: POST one image (max 10MB) + a
            text field description. The response returns an id and storage path.
            Full docs coming soon.
          </p>
        </div>
        <div>
          <Label htmlFor="damage-description" className="mb-1 block">
            Description
          </Label>
          <Textarea
            id="damage-description"
            placeholder="Short description of the damage..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-y min-h-24"
          />
        </div>
        <div>
          <Label className="mb-1 block">Image Upload</Label>
          <Dropzone {...props}>
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="submit"
            variant="default"
            disabled={
              submitting ||
              props.loading ||
              description.trim().length === 0 ||
              props.files.length === 0
            }
            className="inline-flex items-center gap-2 justify-center"
          >
            {submitting || props.loading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="h-4 w-4" /> <p>Case</p>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { UploadDamageImage, type UploadDamageImageSubmitPayload };
