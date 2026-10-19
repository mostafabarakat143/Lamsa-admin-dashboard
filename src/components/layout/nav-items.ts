import {
  FolderTree,
  LayoutDashboard,
  Mail,
  Package,
  ShoppingBag,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/users", label: "Users", icon: Users },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/subcategories", label: "Subcategories", icon: FolderTree },
];
