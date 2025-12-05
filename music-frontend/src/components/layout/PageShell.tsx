import { PropsWithChildren } from 'react';
import { Header } from './Header';

export function PageShell({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-app text-app">
      <Header />
      <main className="flex-1 pt-16">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
