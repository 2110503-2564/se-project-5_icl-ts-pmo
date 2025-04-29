"use client";

import { ClockIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { concatAddress } from "@/utils";
import { CoworkingSpaceType } from "@/libs/types";

export default function InfoWithIcon({ coworkingSpace }: { coworkingSpace: CoworkingSpaceType }) {
  const openTime = new Date(coworkingSpace.openTime);
  const closeTime = new Date(coworkingSpace.closeTime);
  return [
    { Icon: PhoneIcon, text: coworkingSpace.tel },
    { Icon: ClockIcon, text: `${openTime.toLocaleTimeString()} - ${closeTime.toLocaleTimeString()}` },
    { Icon: MapPinIcon, text: concatAddress(coworkingSpace) },
  ].map(({ Icon, text }) => {
    return (
      <div className="flex items-center gap-2" key={text}>
        <Icon width="1rem" height="1rem" />
        <span>{text}</span>
      </div>
    );
  });
}
