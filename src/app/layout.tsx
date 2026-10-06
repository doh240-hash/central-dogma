import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '센트럴도그마 (Central Dogma) - 인터랙티브 분자생물학 가상 실험실',
  description: 'DNA 전사, RNA 가공, 리보솜 번역 및 원핵생물 vs 진핵생물 중심원리 비교 시뮬레이션 교구',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
