import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { LoadingProvider } from '@/components/loading-provider';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tạp Chí Phương Đông',
  description: 'Tạp chí văn hóa phương đông - Nơi lưu giữ và chia sẻ văn hóa truyền thống',
  keywords: 'tạp chí, văn hóa, phương đông, truyền thống, online magazine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <LoadingProvider>
          {children}
          <Footer />
        </LoadingProvider>
        <Toaster />
      </body>
    </html>
  );
}