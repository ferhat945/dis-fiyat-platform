import { redirect } from "next/navigation";

export default function HizmetlerServiceRedirect({ params }: { params: { service: string } }): never {
  redirect(`/hizmet/${encodeURIComponent(params.service)}`);
}
