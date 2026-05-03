import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PromotionStep2Image } from "./PromotionStep2Image";

describe("PromotionStep2Image", () => {
  it("renders upload area when no image is present", () => {
    render(
      <PromotionStep2Image
        imagePreview={null}
        imageUrl=""
        onImageChange={vi.fn()}
        onImageRemove={vi.fn()}
      />,
    );

    expect(screen.getByText("Sube una imagen")).toBeInTheDocument();
    expect(screen.getByText("Recomendado 328 x 200px PNG.")).toBeInTheDocument();
    expect(screen.getByText("Seleccionar archivo")).toBeInTheDocument();
  });

  it("renders image preview when imagePreview is provided", () => {
    render(
      <PromotionStep2Image
        imagePreview="data:image/png;base64,abc123"
        imageUrl=""
        onImageChange={vi.fn()}
        onImageRemove={vi.fn()}
      />,
    );

    const img = screen.getByAltText("Preview");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "data:image/png;base64,abc123");
  });

  it("renders image preview from imageUrl when no imagePreview", () => {
    render(
      <PromotionStep2Image
        imagePreview={null}
        imageUrl="https://example.com/image.png"
        onImageChange={vi.fn()}
        onImageRemove={vi.fn()}
      />,
    );

    const img = screen.getByAltText("Preview");
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("example.com%2Fimage.png");
  });

  it("prefers imagePreview over imageUrl", () => {
    render(
      <PromotionStep2Image
        imagePreview="data:image/png;base64,preview"
        imageUrl="https://example.com/image.png"
        onImageChange={vi.fn()}
        onImageRemove={vi.fn()}
      />,
    );

    const img = screen.getByAltText("Preview");
    expect(img).toHaveAttribute("src", "data:image/png;base64,preview");
  });

  it("calls onImageChange when file input changes", () => {
    const onImageChange = vi.fn();
    const { container } = render(
      <PromotionStep2Image
        imagePreview={null}
        imageUrl=""
        onImageChange={onImageChange}
        onImageRemove={vi.fn()}
      />,
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["dummy"], "test.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onImageChange).toHaveBeenCalled();
  });

  it("calls onImageRemove when remove button is clicked", () => {
    const onImageRemove = vi.fn();
    render(
      <PromotionStep2Image
        imagePreview="data:image/png;base64,abc"
        imageUrl=""
        onImageChange={vi.fn()}
        onImageRemove={onImageRemove}
      />,
    );

    const removeButton = screen.getByRole("button");
    fireEvent.click(removeButton);

    expect(onImageRemove).toHaveBeenCalled();
  });

  it("renders info banner", () => {
    render(
      <PromotionStep2Image
        imagePreview={null}
        imageUrl=""
        onImageChange={vi.fn()}
        onImageRemove={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/El 70% del banner es imagen/i),
    ).toBeInTheDocument();
  });
});
