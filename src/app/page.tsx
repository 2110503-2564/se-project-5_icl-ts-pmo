"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const covers = ["/img/cover.jpg", "/img/cover2.jpg", "/img/cover3.jpg"];
  const [index, setIndex] = useState(0);
  const router = useRouter();

  return (
    <main>
      <div
        className="relative h-[calc(100vh-54px)] w-screen p-1"
        onClick={() => setIndex((index) => (index + 1) % 3)}
      >
        <Image className="object-cover" src={covers[index]} alt="cover" fill={true} />
        <div className="relative top-2/5 z-10 flex -translate-y-1/2 items-center justify-center text-center">
          <div className="mx-2 flex flex-col items-center justify-center gap-2 rounded-xl bg-[rgb(0,0,0,0.8)] p-7 text-white shadow-[0_0_8px_rgb(255,255,255)] text-shadow-[0_0_2px_rgb(255,255,255)]">
            <h1 className="text-4xl font-medium">Co-working Space</h1>
            <h3 className="font-serif text-xl">Find Co-working Space and Meeting Rooms</h3>
          </div>
        </div>
        <button
          className="text-md absolute right-0 bottom-0 me-2 mb-2 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2.5 text-center font-medium text-white shadow-xl hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 hover:shadow-2xl focus:from-blue-600 focus:via-blue-700 focus:to-blue-800 focus:shadow-2xl"
          onClick={(e) => {
            e.stopPropagation();
            router.push("/coworking-space");
          }}
        >
          Select Your Co-working Space NOW
        </button>
      </div>
    </main>
  );
}
