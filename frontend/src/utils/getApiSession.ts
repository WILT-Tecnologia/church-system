import { NextApiRequest } from "next";

export async function getApiSession<T = any>(
  req: NextApiRequest
): Promise<T | null> {
  try {
    const cookie = req.headers.cookie;

    const options = cookie ? { headers: { cookie } } : {};

    const baseUrl = `${process.env.NEXTAUTH_URL_INTERNAL}/admin`;
    const res = await fetch(`${baseUrl}/session`, options);

    const data = await res.json();
    if (!res.ok) throw data;
    return Object.keys(data).length > 0 ? data : null; // Return null if data empty
  } catch (error) {
    return null;
  }
}
