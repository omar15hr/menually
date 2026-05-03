import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import ImageUploader from "./ImageUploader";

// ── Mocks ─────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock("@/components/shared/PhotoUpload", () => ({
  default: ({
    children,
    imagePath,
    onPhotoUploaded,
  }: {
    children: React.ReactNode;
    imagePath: string;
    onPhotoUploaded: (url: string) => void;
  }) => (
    <div data-testid="photo-upload" data-image-path={imagePath}>
      {children}
      <button
        data-testid="trigger-upload"
        onClick={() => onPhotoUploaded("https://example.com/uploaded.jpg")}
      >
        Trigger Upload
      </button>
    </div>
  ),
}));

vi.mock("@/components/icons/CameraIcon", () => ({
  default: () => <svg data-testid="camera-icon" />,
}));

vi.mock("@/components/icons/XIcon", () => ({
  default: () => <svg data-testid="x-icon" />,
}));

// ── Tests ─────────────────────────────────────────────────────────────

describe("ImageUploader", () => {
  const defaultProps = {
    label: "Test Label",
    imagePath: "products",
    imageUrl: "",
    onImageUploaded: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the provided label", () => {
    render(<ImageUploader {...defaultProps} />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("shows upload prompt when no image is provided", () => {
    render(<ImageUploader {...defaultProps} recommendedSize="Recomendado 100x100px" />);
    expect(screen.getByText("Sube una imagen")).toBeInTheDocument();
    expect(screen.getByText("Recomendado 100x100px")).toBeInTheDocument();
    expect(screen.getByText("Seleccionar archivo")).toBeInTheDocument();
  });

  it("shows image preview and uploaded state when imageUrl is provided", () => {
    render(
      <ImageUploader
        {...defaultProps}
        imageUrl="https://example.com/image.jpg"
      />,
    );

    expect(screen.getByAltText("Test Label")).toHaveAttribute(
      "src",
      "https://example.com/image.jpg",
    );
    expect(screen.getByText("Archivo subido")).toBeInTheDocument();
  });

  it("calls onImageUploaded when PhotoUpload triggers onPhotoUploaded", () => {
    const onImageUploaded = vi.fn();
    render(
      <ImageUploader {...defaultProps} onImageUploaded={onImageUploaded} />,
    );

    fireEvent.click(screen.getByTestId("trigger-upload"));

    expect(onImageUploaded).toHaveBeenCalledTimes(1);
    expect(onImageUploaded).toHaveBeenCalledWith(
      "https://example.com/uploaded.jpg",
    );
  });

  it("passes imagePath to PhotoUpload", () => {
    render(<ImageUploader {...defaultProps} imagePath="logos" />);
    expect(screen.getByTestId("photo-upload")).toHaveAttribute(
      "data-image-path",
      "logos",
    );
  });

  it("uses default recommended size when not provided", () => {
    render(<ImageUploader {...defaultProps} />);
    expect(
      screen.getByText("Recomendado 328 x 200px PNG."),
    ).toBeInTheDocument();
  });
});
