import "./globals.css";

export const metadata = {
  title: "BP Training Question Collector",
  description: "A short BP debate training question survey."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="site-credit">Created by Zhihao</footer>
      </body>
    </html>
  );
}
