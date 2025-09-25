import { redirect } from "next/navigation";

// B2C landing is disabled in LK; redirect locale root to dashboard
export default function LandingPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/dashboard`);
}
