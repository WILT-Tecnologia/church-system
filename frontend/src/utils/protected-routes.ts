import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

async function protectedRoutes(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  return session;
}

export default protectedRoutes;
