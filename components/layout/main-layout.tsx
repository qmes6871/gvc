import { Header } from "./header";
import { Footer } from "./footer";

interface MainLayoutProps {
  children: React.ReactNode;
  /** true = dark hero overlay mode (homepage), false = normal light page */
  heroMode?: boolean;
}

export function MainLayout({ children, heroMode = false }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header forceSolid={!heroMode} />
      <main className={`flex-1 ${heroMode ? "pt-14" : ""}`}>{children}</main>
      <Footer />
    </div>
  );
}
