'use client'

export default function UserDetail({phone, email, since}: {phone: string, email: string, since: Date}) {
  return (
    <div className="flex w-full flex-col items-start gap-8 py-4 pl-[15%]">
      {[
        { label: "Phone:", data: phone },
        { label: "Email:", data: email },
        { label: "Member Since:", data: since.toLocaleString() },
      ].map(({ label, data }) => (
        <div className="flex flex-col gap-2" key={label}>
          <span className="text-sm">{label}</span>
          <span className="rounded pl-4">{data}</span>
        </div>
      ))}
    </div>
  );
}