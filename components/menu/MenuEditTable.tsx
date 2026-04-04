"use client";

import Image from "next/image";

import CameraIcon from "../icons/CameraIcon";
import type { Database } from "@/types/database.types";
import PhotoUpload from "../shared/PhotoUpload";
import { useState } from "react";

type Menu = Database["public"]["Tables"]["menus"]["Row"];

type EditableField = {
  label: string;
  field: keyof Menu;
  type: "color" | "select" | "toggle";
  options?: { value: string; label: string }[];
};

const EDITABLE_FIELDS: EditableField[] = [
  {
    label: "Tipografía",
    field: "typography",
    type: "select",
    options: [
      { value: "inter", label: "Inter" },
      { value: "roboto", label: "Roboto" },
      { value: "montserrat", label: "Montserrat" },
    ],
  },
  {
    label: "Layout",
    field: "layout_card",
    type: "select",
    options: [
      { value: "horizontal", label: "Horizontal" },
      { value: "vertical", label: "Vertical" },
    ],
  },
  {
    label: "Forma de imagen",
    field: "image_product_shape",
    type: "select",
    options: [
      { value: "square", label: "Cuadrada" },
      { value: "rounded", label: "Redondeada" },
      { value: "circle", label: "Circular" },
    ],
  },
  { label: "Primario", field: "primary_color", type: "color" },
  { label: "Texto", field: "text_color", type: "color" },
  { label: "Fondo", field: "bg_color", type: "color" },
  { label: "Precio", field: "price_color", type: "color" },
  { label: "Descripción", field: "description_color", type: "color" },
  { label: "Mostrar precio", field: "show_price", type: "toggle" },
  {
    label: "Mostrar descripciones",
    field: "show_descriptions",
    type: "toggle",
  },
  { label: "Mostrar filtros", field: "show_filters", type: "toggle" },
];

const colorFields = EDITABLE_FIELDS.filter((f) => f.type === "color");
const otherFields = EDITABLE_FIELDS.filter((f) => f.type !== "color");

interface Props {
  menu: Menu;
  onChange: (field: keyof Menu, value: string | boolean) => void;
  onSave: () => void;
  isPending: boolean;
  error: string | null;
  successMsg: string | null;
}

export function MenuEditTable({
  menu,
  onChange,
  onSave,
  isPending,
  error,
  successMsg,
}: Props) {
  const [formData, setFormData] = useState<string>("");

  return (
    <div className="flex flex-col w-full max-w-sm bg-white border border-[#E4E4E6]">
      <div className="flex flex-col p-4 border-b">
        <h2 className="text-[#0F172A] text-base font-extrabold">Diseño</h2>
        <p className="text-[#58606E] text-sm">
          Ajusta colores, tipografías y estilo en segundos.
        </p>
      </div>

      <div className="bg-white overflow-hidden">
        <Row label="Slug">
          <span className="text-sm text-gray-400 font-semibold truncate max-w-50">
            {menu.slug}
          </span>
        </Row>

        <div className="flex flex-col gap-2 p-4">
          <span className="text-sm text-[#1C1C1C] font-semibold shrink-0">
            Logo
          </span>
          <PhotoUpload
            imagePath={"logos"}
            onPhotoUploaded={(url) => {
              setFormData(url);
            }}
          >
            <div className="flex gap-4 justify-center border-2 border-dashed rounded-2xl border-[#E4E4E6] p-4 cursor-pointer hover:border-[#25B205] transition-colors items-center">
              {formData ? (
                <Image
                  src={formData}
                  alt="Image placeholder"
                  width={56}
                  height={56}
                  className="rounded-full size-15"
                />
              ) : (
                <span className="bg-[#E5E7EA] px-2.5 py-4 rounded-full">
                  <CameraIcon />
                </span>
              )}
              <div className="text-sm">
                <h2 className="text-[#1C1C1C] font-semibold">
                  Sube una imagen
                </h2>
                <p className="text-[#58606E]">Recomendado 328 x 200px PNG.</p>
                <span className="text-[#25B205]">Seleccionar archivo</span>
              </div>
            </div>
          </PhotoUpload>
        </div>

        <div className="flex flex-col gap-2 p-4">
          <span className="text-sm text-[#1C1C1C] font-semibold shrink-0">
            Portada
          </span>
          <PhotoUpload
            imagePath={"backgrounds"}
            onPhotoUploaded={(url) => {
              setFormData(url);
            }}
          >
            <div className="flex gap-4 justify-center border-2 border-dashed rounded-2xl border-[#E4E4E6] p-4 cursor-pointer hover:border-[#25B205] transition-colors items-center">
              {formData ? (
                <Image
                  src={formData}
                  alt="Image placeholder"
                  width={56}
                  height={56}
                  className="rounded-full size-15"
                />
              ) : (
                <span className="bg-[#E5E7EA] px-2.5 py-4 rounded-full">
                  <CameraIcon />
                </span>
              )}
              <div className="text-sm">
                <h2 className="text-[#1C1C1C] font-semibold">
                  Sube una imagen
                </h2>
                <p className="text-[#58606E]">Recomendado 328 x 200px PNG.</p>
                <span className="text-[#25B205]">Seleccionar archivo</span>
              </div>
            </div>
          </PhotoUpload>
        </div>

        <div className="flex flex-col gap-2 px-4 py-3">
          <span className="text-sm text-[#1C1C1C] font-semibold">Colores</span>
          <div className="flex flex-row flex-wrap gap-x-4 gap-y-3">
            {colorFields.map(({ label, field }) => (
              <div key={field} className="flex flex-col items-center gap-1">
                <input
                  id={`edit-${field}`}
                  type="color"
                  value={menu[field] as string}
                  onChange={(e) => onChange(field, e.target.value)}
                  className="size-10 rounded-md cursor-pointer p-0.5"
                />
                <span className="text-xs font-mono text-gray-400">
                  {menu[field] as string}
                </span>
                <span className="text-xs text-[#58606E] text-center leading-tight max-w-14">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {otherFields.map(({ label, field, type, options }) => (
          <Row key={field} label={label}>
            {type === "select" && options && (
              <select
                id={`edit-${field}`}
                value={menu[field] as string}
                onChange={(e) => onChange(field, e.target.value)}
                className="px-2.5 py-1.5 border border-[#E4E4E6] rounded-lg text-sm bg-[#FBFBFA] focus:outline-none focus:ring-2 focus:ring-black/10 transition-shadow cursor-pointer"
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {type === "toggle" && (
              <button
                id={`edit-${field}`}
                type="button"
                role="switch"
                aria-checked={menu[field] as boolean}
                onClick={() => onChange(field, !(menu[field] as boolean))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 ${
                  menu[field] ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform ring-0 transition duration-200 ease-in-out ${
                    menu[field] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            )}
          </Row>
        ))}
      </div>

      {error && (
        <div className="mt-3 px-4 py-2.5 text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mt-3 px-4 py-2.5 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg">
          {successMsg}
        </div>
      )}

      <button
        onClick={onSave}
        disabled={isPending}
        className="mt-4 w-full px-4 py-2.5 text-sm font-medium bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start px-4 py-3 min-h-12 gap-2">
      <span className="text-sm text-[#1C1C1C] font-semibold shrink-0">
        {label}
      </span>
      {children}
    </div>
  );
}
