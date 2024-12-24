import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const poppins = Poppins({
  weight: ['400', '500', '600', '900'],
  style: ['normal'],
});

export const metadata: Metadata = {
  title: 'Object Detection',
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
