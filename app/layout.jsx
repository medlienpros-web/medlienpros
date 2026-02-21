import "./globals.css";

export const metadata = {
  title: "MedLien Pros",
  description: "Medical Lien Filing Services",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
