import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "./ProductCard";

const mockProduct = {
  id: "prod-1",
  name: "Test Product",
  description: "A tasty test product",
  price: 9990,
  image: "/test-image.jpg",
};

const formatPrice = (price: number) => `$${price.toLocaleString("es-CL")}`;

describe("ProductCard", () => {
  it("renders product name", () => {
    render(
      <ProductCard
        product={mockProduct}
        imageShape="rounded-xl"
        isVertical={false}
        showDescriptions={true}
        showPrice={true}
        formatPrice={formatPrice}
      />,
    );
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("renders formatted price when showPrice is true and price > 0", () => {
    render(
      <ProductCard
        product={mockProduct}
        imageShape="rounded-xl"
        isVertical={false}
        showDescriptions={true}
        showPrice={true}
        formatPrice={formatPrice}
      />,
    );
    expect(screen.getByText("$9.990")).toBeInTheDocument();
  });

  it("does not render price when showPrice is false", () => {
    render(
      <ProductCard
        product={mockProduct}
        imageShape="rounded-xl"
        isVertical={false}
        showDescriptions={true}
        showPrice={false}
        formatPrice={formatPrice}
      />,
    );
    expect(screen.queryByText("$9.990")).not.toBeInTheDocument();
  });

  it("does not render price when price is 0", () => {
    render(
      <ProductCard
        product={{ ...mockProduct, price: 0 }}
        imageShape="rounded-xl"
        isVertical={false}
        showDescriptions={true}
        showPrice={true}
        formatPrice={formatPrice}
      />,
    );
    expect(screen.queryByText("$0")).not.toBeInTheDocument();
  });

  it("renders description when showDescriptions is true and description exists", () => {
    render(
      <ProductCard
        product={mockProduct}
        imageShape="rounded-xl"
        isVertical={false}
        showDescriptions={true}
        showPrice={true}
        formatPrice={formatPrice}
      />,
    );
    expect(screen.getByText("A tasty test product")).toBeInTheDocument();
  });

  it("does not render description when showDescriptions is false", () => {
    render(
      <ProductCard
        product={mockProduct}
        imageShape="rounded-xl"
        isVertical={false}
        showDescriptions={false}
        showPrice={true}
        formatPrice={formatPrice}
      />,
    );
    expect(screen.queryByText("A tasty test product")).not.toBeInTheDocument();
  });

  it("does not render description when description is null", () => {
    render(
      <ProductCard
        product={{ ...mockProduct, description: null }}
        imageShape="rounded-xl"
        isVertical={false}
        showDescriptions={true}
        showPrice={true}
        formatPrice={formatPrice}
      />,
    );
    expect(screen.queryByText("A tasty test product")).not.toBeInTheDocument();
  });

  it("calls onProductClick with product id when clicked", () => {
    const onProductClick = vi.fn();
    const { container } = render(
      <ProductCard
        product={mockProduct}
        imageShape="rounded-xl"
        isVertical={false}
        showDescriptions={true}
        showPrice={true}
        onProductClick={onProductClick}
        formatPrice={formatPrice}
      />,
    );
    (container.firstChild as HTMLElement).click();
    expect(onProductClick).toHaveBeenCalledWith("prod-1");
  });

  it("uses horizontal layout when isVertical is false", () => {
    const { container } = render(
      <ProductCard
        product={mockProduct}
        imageShape="rounded-xl"
        isVertical={false}
        showDescriptions={true}
        showPrice={true}
        formatPrice={formatPrice}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains("flex-row")).toBe(true);
  });

  it("uses vertical layout when isVertical is true", () => {
    const { container } = render(
      <ProductCard
        product={mockProduct}
        imageShape="rounded-xl"
        isVertical={true}
        showDescriptions={true}
        showPrice={true}
        formatPrice={formatPrice}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains("flex-col")).toBe(true);
  });
});
