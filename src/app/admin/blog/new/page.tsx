import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import AdminBlogEditor from "../ui/AdminBlogEditor";

export const dynamic = "force-dynamic";

export default async function AdminBlogNewPage(): Promise<JSX.Element> {
  await requireAdmin();

  return (
    <main className="mx-auto w-full max-w-4xl p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">Admin</p>
          <h1 className="text-2xl font-semibold">Yeni Blog Yazısı</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/blog"
            className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Listeye dön
          </Link>
        </div>
      </div>

      <AdminBlogEditor postId="new" />
    </main>
  );
}
