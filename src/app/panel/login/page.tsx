import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function PanelLoginPage(): never {
  // ✅ Senin mevcut gerçek login sayfan hangi route ise buraya yaz
  // Büyük ihtimalle /login
  redirect("/login");
}