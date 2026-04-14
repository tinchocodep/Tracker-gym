import "./globals.css";

export const metadata = {
  title: "Martin · Tracker",
  description: "Cut hacia julio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
