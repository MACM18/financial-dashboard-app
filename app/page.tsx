import { redirect } from "next/navigation";

export default function Home() {
  // This is an app – redirect straight to the dashboard.
  redirect("/dashboard");
}
