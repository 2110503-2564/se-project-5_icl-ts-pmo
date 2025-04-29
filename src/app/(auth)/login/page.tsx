import { readSearchParams, SearchParams } from "@/utils";
import LoginForm from "./LoginForm";

export default async function Login({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const redirected = readSearchParams(params, "redirected");

  return <LoginForm redirected={redirected} />;
}
