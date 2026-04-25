"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/server/actions/profile";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ProfileField = {
  key: string;
  label: string;
  value: string;
  type: "text" | "email" | "number";
};

type ProfileEditorProps = {
  fields: ProfileField[];
};

type FormErrors = {
  form?: string;
};

function buildState(fields: ProfileField[]) {
  return Object.fromEntries(fields.map((field) => [field.key, field.value]));
}

export function ProfileEditor({ fields }: ProfileEditorProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => buildState(fields));
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setValues(buildState(fields));
  }, [fields]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors({});
    setSuccess(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess(null);

    const result = await updateProfileAction(values);
    setLoading(false);

    if (!result.success) {
      setErrors({ form: result.message || getErrorMessage(result.code) });
      return;
    }

    setSuccess("Profile updated successfully.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Edit profile</h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your visible account details. Changes are sent directly to the gateway.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <Input
            key={field.key}
            id={field.key}
            name={field.key}
            type={field.type}
            label={field.label}
            value={values[field.key] ?? ""}
            onChange={handleChange}
          />
        ))}
      </div>

      {fields.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">
          No editable fields were returned by the gateway.
        </p>
      )}

      {errors.form && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {errors.form}
        </p>
      )}

      {success && (
        <p className="mt-4 text-sm text-emerald-700" role="status">
          {success}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" loading={loading}>
          Save changes
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.refresh()}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>
    </form>
  );
}
