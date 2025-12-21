import { redirect } from "next/navigation";
import {
  adminResources,
  getAdminPath,
  getAdminResourceByKey,
} from "@/lib/admin/registry";

export default function AdminPage() {
  const defaultResource =
    getAdminResourceByKey("vehicles") ?? adminResources[0];
  const target = defaultResource ? getAdminPath(defaultResource) : "/";
  redirect(target);
}
