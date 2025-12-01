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
      'bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 shadow-lg shadow-cyan-500/30',
    ghost:
      'border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 text-slate-50 px-3 py-2',
  };

  return <button className={clsx(base, variants[variant], className)} {...props} />;
}
