"use client"

import { UploadDamageImage, type UploadDamageImageSubmitPayload } from "./upload-damage-image";

export default function Admin() {
  const handleSubmit = (payload: UploadDamageImageSubmitPayload) => {
    console.log("Damage submission:", payload);
  };
  return <UploadDamageImage onSubmit={handleSubmit} />;
}
