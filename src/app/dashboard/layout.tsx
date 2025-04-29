import SideNav from "./SideNav";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-[calc(100vh-3rem)] items-start justify-start">
      <SideNav />
      <div className="h-full w-full overflow-y-scroll">{children}</div>
    </div>
  );
}
