import { nextAuthOptions } from "@/auth/nextAuthOptions";
import { getServerSession } from "next-auth";

type PrivateLayoutProps = {
  children: React.ReactNode;
};
export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const session = await getServerSession(nextAuthOptions);

  // if (!session) {
  //   redirect("/sign-in");
  // }
  return <>{children}</>;
}
