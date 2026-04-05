"use client";

import Image from "next/image";

import CameraIcon from "../icons/CameraIcon";
import PhotoUpload from "../shared/PhotoUpload";
import type { Database } from "@/types/database.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  error: string | null;
  successMsg: string | null;
  logoUrl: string;
  coverUrl: string;
  onLogoUrlSelected: (url: string) => void;
  onCoverUrlSelected: (url: string) => void;
  onChange: (field: keyof Menu, value: string | boolean) => void;
}

export function MenuEditTable({
  menu,
  onChange,
  error,
  successMsg,
  logoUrl,
  coverUrl,
  onLogoUrlSelected,
  onCoverUrlSelected,
}: Props) {
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
          <PhotoUpload imagePath={"logos"} onPhotoUploaded={onLogoUrlSelected}>
            <div className="flex gap-4 justify-center border-2 border-dashed rounded-2xl border-[#E4E4E6] p-4 cursor-pointer hover:border-[#25B205] transition-colors items-center">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Image placeholder"
                  width={300}
                  height={300}
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
            onPhotoUploaded={onCoverUrlSelected}
          >
            <div className="flex gap-4 justify-center border-2 border-dashed rounded-2xl border-[#E4E4E6] p-4 cursor-pointer hover:border-[#25B205] transition-colors items-center">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt="Image placeholder"
                  width={300}
                  height={300}
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
          <div className="flex flex-row flex-wrap gap-x-4 gap-y-3 justify-between px-2">
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
          <Row
            key={field}
            label={label}
            layout={type === "toggle" ? "row" : "col"}
          >
            <FieldInput
              field={field}
              type={type}
              value={menu[field]}
              options={options}
              onChange={onChange}
            />
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
    </div>
  );
}

function Row({
  label,
  children,
  layout = "col",
}: {
  label: string;
  children: React.ReactNode;
  layout?: "row" | "col";
}) {
  return (
    <div
      className={`flex px-4 py-3 min-h-12 ${
        layout === "row"
          ? "flex-row items-center justify-between"
          : "flex-col items-start gap-2"
      }`}
    >
      <span className="text-sm text-[#1C1C1C] font-semibold shrink-0">
        {label}
      </span>
      {children}
    </div>
  );
}

interface FieldInputProps {
  field: keyof Menu;
  type: EditableField["type"];
  value: Menu[keyof Menu];
  options?: EditableField["options"];
  onChange: (field: keyof Menu, value: string | boolean) => void;
}

function FieldInput({
  field,
  type,
  value,
  options,
  onChange,
}: FieldInputProps) {
  if (type === "select" && options) {
    return (
      <Select
        value={value as string}
        onValueChange={(val) => onChange(field, val)}
      >
        <SelectTrigger className="w-full border-[#E4E4E6] bg-[#FBFBFA] text-sm focus:ring-black/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (type === "toggle") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={value as boolean}
        onClick={() => onChange(field, !(value as boolean))}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 ${
          value ? "bg-[#114821]" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform ring-0 transition duration-200 ease-in-out ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    );
  }

  return null;
}
