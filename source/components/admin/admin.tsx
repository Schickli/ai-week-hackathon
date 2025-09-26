"use client";

import {
  UploadDamageImage,
  type UploadDamageImageSubmitPayload,
} from "./upload-damage-image";

export default function Admin() {
  const handleSubmit = (payload: UploadDamageImageSubmitPayload) => {
    console.log("Damage submission:", payload);

    try {
      fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error submitting damage report:", error);
    }
  };
  return <UploadDamageImage onSubmit={handleSubmit} />;
}
