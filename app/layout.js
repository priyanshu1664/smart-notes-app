import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/ui/Header";
import Providers from "@/components/Providers";
import Footer from "@/components/ui/Footer";

export const metadata = {
  title: "Smart Notes App",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={` h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <div className="flex flex-row">
            <Sidebar />
            <main className="flex-1 p-6 bg-gray-100 ">{children}</main>
          </div>
          <Footer></Footer>
        </Providers>
      </body>
    </html>
  );
}
