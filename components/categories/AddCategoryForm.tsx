"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PlusIcon from "@/components/icons/PlusIcon";
import CheckIcon from "@/components/icons/CheckIcon";
import LoaderIcon from "@/components/icons/LoaderIcon";
import XIcon from "@/components/icons/XIcon";

interface AddCategoryFormProps {
  onSubmit: (name: string) => Promise<{ error?: string }>;
}

export function AddCategoryForm({ onSubmit }: AddCategoryFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleCancel() {
    setIsEditing(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = inputRef.current?.value.trim();
    if (!name) return;

    setIsPending(true);
    const result = await onSubmit(name);
    setIsPending(false);

    if (result.error) {
      toast.error("Error al crear categoría");
    } else {
      toast.success("Categoría creada");
      setIsEditing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      {isEditing ? (
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            autoFocus
            type="text"
            placeholder="Ej. Platos principales"
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 text-[#114821] rounded-none cursor-pointer bg-white"
          >
            {isPending ? (
              <LoaderIcon className="text-white animate-spin" />
            ) : (
              <CheckIcon className="size-8" fill="#64748B" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={handleCancel}
            className="rounded-none text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <XIcon />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => setIsEditing(true)}
          className="bg-white border border-[#E4E4E6] py-6 w-full rounded-none cursor-pointer"
        >
          <span className="flex items-center gap-2 text-[#114821] text-base font-semibold">
            <PlusIcon /> Añadir categoría
          </span>
        </Button>
      )}
    </form>
  );
}
