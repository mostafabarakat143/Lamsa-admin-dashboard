export type CatalogStatus = "ACTIVE" | "ARCHIVED";
export type Availability = "AVAILABLE" | "UNAVAILABLE" | "ALL";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "FULFILLED"
  | "CANCELLED";
export type UserRole = "CUSTOMER" | "ADMIN";
export type UserStatus = "ACTIVE" | "DISABLED";

export type PageMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type Paginated<T> = {
  items: T[];
  meta: PageMeta;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
};

export type Subcategory = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
    status: CatalogStatus;
  };
};

export type ProductImage = {
  id: number;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: number;
  subcategoryId: number;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  priceMinor: number;
  currency: string;
  stockQty: number;
  isAvailable: boolean;
  inStock: boolean;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
  subcategory: {
    id: number;
    name: string;
    slug: string;
    status: CatalogStatus;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    status: CatalogStatus;
  };
  images: ProductImage[];
};

export type OrderItem = {
  id: number;
  productId: number;
  productNameSnapshot: string;
  productSkuSnapshot: string;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
};

export type OrderCustomer = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export type Order = {
  id: number;
  userId: number;
  status: OrderStatus;
  totalMinor: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customer?: OrderCustomer;
};

export type AdminUser = {
  id: number;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
  } | null;
};

export type ContactMessage = {
  id: number;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
};

export type DashboardData = {
  totals: {
    products: number;
    users: number;
    categories: number;
    subcategories: number;
    orders: number;
  };
  ordersByStatus: Record<OrderStatus, number>;
  ordersOverTime: Array<{ period: string; count: number }>;
  range: {
    from: string | null;
    to: string | null;
    bucket: "month" | "day";
  };
};

export type ApiLoadError = {
  kind: "error" | "unreachable" | "unauthorized";
  message: string;
  status?: number;
};
