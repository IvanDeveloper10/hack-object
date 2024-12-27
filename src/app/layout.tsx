import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const poppins = Poppins({
  weight: ['400', '500', '800', '900'],
  style: ['normal'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Object Detection Time Real',
  description: 'Web application that detects objects in a real-time video or by importing image files',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={poppins.className}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
