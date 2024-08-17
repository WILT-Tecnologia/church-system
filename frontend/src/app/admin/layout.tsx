type PrivateLayoutProps = {
  children: React.ReactNode;
};
export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  /* const session = await getServerSession(nextAuthOptions);

  if (!session) {
    redirect("/login");
  } */
  return <>{children}</>;
}
