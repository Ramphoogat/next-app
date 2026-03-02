"use client";
import { Suspense } from "react";
import VerifyOtp from "@/components/VerifyOtp";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading verify...</div>}>
      <VerifyOtp />
    </Suspense>
  );
}