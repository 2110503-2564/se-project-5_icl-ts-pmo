export function appeadSearch<T extends object>(query: T) {
  const result = {} as { [P in keyof T]: string };
  Object.keys(query).forEach((e) => {
    const key = e as keyof T;
    if (query[key]) {
      result[key] = String(query[key]);
    }
  });
  const search = new URLSearchParams(result).toString();
  return search ? `?${search}` : "";
}
