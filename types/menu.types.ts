export type Menu = {
  slug: string;
  primary_color: string;
  text_color: string;
  bg_color: string;
  bg_image_url: string;
  logo_url: string;
  price_color: string;
  typography: string;
  layout_card: string;
  image_product_shape: string;
  show_price: string;
  show_descriptions: string;
  show_filters: string;
};

export type MenuActionState = {
  success: boolean;
  error: string | null;
};
