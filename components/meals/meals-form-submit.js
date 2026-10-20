"use client";

import { useFormStatus } from "react-dom";

export default function MealsFormSubmit({ actionText }) {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending}>
      {pending ? "Submitting..." : actionText}
    </button>
  );
}
