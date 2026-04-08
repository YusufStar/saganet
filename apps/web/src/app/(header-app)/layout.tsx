import { Header } from "@/components/layout/Header";

export default function HeaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
