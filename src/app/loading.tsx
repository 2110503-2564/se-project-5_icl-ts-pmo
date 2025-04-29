import Image from "next/image";

export default function Loading() {
  return (
    <main className="flex h-[calc(100vh-3rem)] w-full items-center justify-center">
      <Image className="animate-rotate" src="/img/logo.jpg" alt="Logo" width={128} height={128} />
    </main>
  );
}
