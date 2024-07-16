import { redirect } from "next/navigation";

export default function PageRedirectInDasboard() {
  redirect("/admin/dashboard");
}
