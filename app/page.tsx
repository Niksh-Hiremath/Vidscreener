import HomeLanding from "./components/HomeLanding";
import { getSessionUser } from "./lib/session";

export default async function Home() {
  const user = await getSessionUser();

  return <HomeLanding isAuthenticated={Boolean(user)} />;
}
