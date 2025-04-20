"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Banner() {
  const covers = ["/img/cover.jpg", "/img/cover2.jpg", "/img/cover3.jpg"];
  const [index, setIndex] = useState(0);
  const router = useRouter();

  return (
    <div className="relative h-[calc(100vh-54px)] w-screen p-1" onClick={() => setIndex(index + 1)}>
      <Image src={covers[index % 3]} alt="cover" fill={true} objectFit="cover" />
      <div className="relative top-2/5 z-10 -translate-y-1/2 text-center flex justify-center items-center">
        <div className="p-7 mx-2 flex flex-col justify-center items-center gap-2 bg-[rgb(0,0,0,0.8)] text-white rounded-xl shadow-[0_0_8px_rgb(255,255,255)] text-shadow-[0_0_2px_rgb(255,255,255)]">
          <h1 className="text-4xl font-medium">Co-working Space</h1>
          <h3 className="font-serif text-xl">Find Co-working Space and Meeting Rooms</h3>
        </div>
      </div>
      <button
        className="absolute right-0 bottom-0 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 focus:from-blue-600 focus:via-blue-700 focus:to-blue-800 shadow-xl hover:shadow-2xl focus:shadow-2xl font-medium rounded-lg text-md font-semibold px-5 py-2.5 text-center me-2 mb-2"
        onClick={(e) => {
          e.stopPropagation();
          router.push("/coworking-space");
        }}
      >
        Select Your Co-working Space NOW
      </button>
    </div>
  );
}
