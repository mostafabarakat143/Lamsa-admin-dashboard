import type {
  AdminUser,
  Category,
  ContactMessage,
  DashboardData,
  Order,
  OrderCustomer,
  OrderItem,
  OrderStatus,
  Product,
  ProductImage,
  Subcategory,
} from "@/types/api";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asCatalogStatus(value: unknown): "ACTIVE" | "ARCHIVED" | null {
  return value === "ACTIVE" || value === "ARCHIVED" ? value : null;
}

function asOrderStatus(value: unknown): OrderStatus | null {
  return value === "PENDING" ||
    value === "CONFIRMED" ||
    value === "FULFILLED" ||
    value === "CANCELLED"
    ? value
    : null;
}

function asUserRole(value: unknown): "CUSTOMER" | "ADMIN" | null {
  return value === "CUSTOMER" || value === "ADMIN" ? value : null;
}

function asUserStatus(value: unknown): "ACTIVE" | "DISABLED" | null {
  return value === "ACTIVE" || value === "DISABLED" ? value : null;
}

export function parseCategory(value: unknown): Category | null {
  if (!isRecord(value)) return null;
  const status = asCatalogStatus(value.status);
  if (
    typeof value.id !== "number" ||
    typeof value.name !== "string" ||
    typeof value.slug !== "string" ||
    !status ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    imageUrl: typeof value.imageUrl === "string" ? value.imageUrl : null,
    status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function parseSubcategory(value: unknown): Subcategory | null {
  if (!isRecord(value) || !isRecord(value.category)) return null;
  const status = asCatalogStatus(value.status);
  const catStatus = asCatalogStatus(value.category.status);
  if (
    typeof value.id !== "number" ||
    typeof value.categoryId !== "number" ||
    typeof value.name !== "string" ||
    typeof value.slug !== "string" ||
    !status ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    typeof value.category.id !== "number" ||
    typeof value.category.name !== "string" ||
    typeof value.category.slug !== "string" ||
    !catStatus
  ) {
    return null;
  }
  return {
    id: value.id,
    categoryId: value.categoryId,
    name: value.name,
    slug: value.slug,
    description: typeof value.description === "string" ? value.description : null,
    status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    category: {
      id: value.category.id,
      name: value.category.name,
      slug: value.category.slug,
      status: catStatus,
    },
  };
}

function parseImage(value: unknown): ProductImage | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "number" ||
    typeof value.url !== "string" ||
    typeof value.sortOrder !== "number" ||
    typeof value.isPrimary !== "boolean" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }
  return {
    id: value.id,
    url: value.url,
    altText: typeof value.altText === "string" ? value.altText : null,
    sortOrder: value.sortOrder,
    isPrimary: value.isPrimary,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function parseProduct(value: unknown): Product | null {
  if (
    !isRecord(value) ||
    !isRecord(value.category) ||
    !isRecord(value.subcategory) ||
    !Array.isArray(value.images)
  ) {
    return null;
  }
  const status = asCatalogStatus(value.status);
  const catStatus = asCatalogStatus(value.category.status);
  const subStatus = asCatalogStatus(value.subcategory.status);
  if (
    typeof value.id !== "number" ||
    typeof value.subcategoryId !== "number" ||
    typeof value.name !== "string" ||
    typeof value.slug !== "string" ||
    typeof value.sku !== "string" ||
    typeof value.priceMinor !== "number" ||
    typeof value.currency !== "string" ||
    typeof value.stockQty !== "number" ||
    typeof value.isAvailable !== "boolean" ||
    typeof value.inStock !== "boolean" ||
    !status ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    typeof value.category.id !== "number" ||
    typeof value.category.name !== "string" ||
    typeof value.subcategory.id !== "number" ||
    typeof value.subcategory.name !== "string" ||
    !catStatus ||
    !subStatus
  ) {
    return null;
  }

  const images = value.images
    .map(parseImage)
    .filter((image): image is ProductImage => image !== null);

  return {
    id: value.id,
    subcategoryId: value.subcategoryId,
    name: value.name,
    slug: value.slug,
    sku: value.sku,
    description: typeof value.description === "string" ? value.description : null,
    priceMinor: value.priceMinor,
    currency: value.currency,
    stockQty: value.stockQty,
    isAvailable: value.isAvailable,
    inStock: value.inStock,
    status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    subcategory: {
      id: value.subcategory.id,
      name: value.subcategory.name,
      slug:
        typeof value.subcategory.slug === "string"
          ? value.subcategory.slug
          : "",
      status: subStatus,
    },
    category: {
      id: value.category.id,
      name: value.category.name,
      slug: typeof value.category.slug === "string" ? value.category.slug : "",
      status: catStatus,
    },
    images,
  };
}

function parseOrderItem(value: unknown): OrderItem | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "number" ||
    typeof value.productId !== "number" ||
    typeof value.productNameSnapshot !== "string" ||
    typeof value.productSkuSnapshot !== "string" ||
    typeof value.unitPriceMinor !== "number" ||
    typeof value.quantity !== "number" ||
    typeof value.lineTotalMinor !== "number"
  ) {
    return null;
  }
  return {
    id: value.id,
    productId: value.productId,
    productNameSnapshot: value.productNameSnapshot,
    productSkuSnapshot: value.productSkuSnapshot,
    unitPriceMinor: value.unitPriceMinor,
    quantity: value.quantity,
    lineTotalMinor: value.lineTotalMinor,
  };
}

function parseOrderCustomer(value: unknown): OrderCustomer | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.id !== "number" || typeof value.email !== "string") {
    return undefined;
  }
  return {
    id: value.id,
    email: value.email,
    firstName: typeof value.firstName === "string" ? value.firstName : null,
    lastName: typeof value.lastName === "string" ? value.lastName : null,
  };
}

export function parseOrder(value: unknown): Order | null {
  if (!isRecord(value) || !Array.isArray(value.items)) return null;
  const status = asOrderStatus(value.status);
  if (
    typeof value.id !== "number" ||
    typeof value.userId !== "number" ||
    !status ||
    typeof value.totalMinor !== "number" ||
    typeof value.currency !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }
  const items = value.items
    .map(parseOrderItem)
    .filter((item): item is OrderItem => item !== null);
  return {
    id: value.id,
    userId: value.userId,
    status,
    totalMinor: value.totalMinor,
    currency: value.currency,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    items,
    customer: parseOrderCustomer(value.customer),
  };
}

export function parseAdminUser(value: unknown): AdminUser | null {
  if (!isRecord(value)) return null;
  const role = asUserRole(value.role);
  const status = asUserStatus(value.status);
  if (
    typeof value.id !== "number" ||
    typeof value.email !== "string" ||
    !role ||
    !status ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }

  let profile: AdminUser["profile"] = null;
  if (isRecord(value.profile)) {
    profile = {
      firstName:
        typeof value.profile.firstName === "string"
          ? value.profile.firstName
          : null,
      lastName:
        typeof value.profile.lastName === "string"
          ? value.profile.lastName
          : null,
      phone: typeof value.profile.phone === "string" ? value.profile.phone : null,
      avatarUrl:
        typeof value.profile.avatarUrl === "string"
          ? value.profile.avatarUrl
          : null,
    };
  } else if (value.profile === null) {
    profile = null;
  }

  return {
    id: value.id,
    email: value.email,
    role,
    status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    profile,
  };
}

export function parseContactMessage(value: unknown): ContactMessage | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "number" ||
    typeof value.name !== "string" ||
    typeof value.phone !== "string" ||
    typeof value.email !== "string" ||
    typeof value.message !== "string" ||
    typeof value.createdAt !== "string"
  ) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    phone: value.phone,
    email: value.email,
    message: value.message,
    createdAt: value.createdAt,
  };
}

export function parseDashboard(value: unknown): DashboardData | null {
  if (
    !isRecord(value) ||
    !isRecord(value.totals) ||
    !isRecord(value.ordersByStatus)
  ) {
    return null;
  }
  if (
    typeof value.totals.products !== "number" ||
    typeof value.totals.users !== "number" ||
    typeof value.totals.categories !== "number" ||
    typeof value.totals.subcategories !== "number" ||
    typeof value.totals.orders !== "number" ||
    !Array.isArray(value.ordersOverTime)
  ) {
    return null;
  }

  const statuses: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "FULFILLED",
    "CANCELLED",
  ];
  const ordersByStatus = {
    PENDING: 0,
    CONFIRMED: 0,
    FULFILLED: 0,
    CANCELLED: 0,
  } as Record<OrderStatus, number>;
  for (const status of statuses) {
    const count = value.ordersByStatus[status];
    ordersByStatus[status] = typeof count === "number" ? count : 0;
  }

  const ordersOverTime: Array<{ period: string; count: number }> = [];
  for (const row of value.ordersOverTime) {
    if (
      isRecord(row) &&
      typeof row.period === "string" &&
      typeof row.count === "number"
    ) {
      ordersOverTime.push({ period: row.period, count: row.count });
    }
  }

  const rangeRaw = isRecord(value.range) ? value.range : {};
  const bucket =
    rangeRaw.bucket === "day" || rangeRaw.bucket === "month"
      ? rangeRaw.bucket
      : "month";

  return {
    totals: {
      products: value.totals.products,
      users: value.totals.users,
      categories: value.totals.categories,
      subcategories: value.totals.subcategories,
      orders: value.totals.orders,
    },
    ordersByStatus,
    ordersOverTime,
    range: {
      from: typeof rangeRaw.from === "string" ? rangeRaw.from : null,
      to: typeof rangeRaw.to === "string" ? rangeRaw.to : null,
      bucket,
    },
  };
}
