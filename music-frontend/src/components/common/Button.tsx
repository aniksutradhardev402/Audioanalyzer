import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import clsx from 'clsx';

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost';
  }
>;

export function Button({ variant = 'primary', className, ...props }: Props) {
  const base =
    'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<typeof variant, string> = {
    primary:
      'app-accent-bg hover:brightness-95 text-on-accent px-4 py-2 shadow-lg',
    ghost:
      'border border-app bg-app-elevated/40 hover:bg-app-elevated/60 text-app px-3 py-2',
  };

  return <button className={clsx(base, variants[variant], className)} {...props} />;
}
