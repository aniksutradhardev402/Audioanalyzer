// // src/pages/AnalysisWrapper.tsx
// import { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { getResult, getStatus } from '../lib/api';
// import { AnalysisResult } from '../types/analysis';
// import { DawAnalysisPage } from './DawAnalysisPage';

// export function AnalysisWrapper() {
//   const { taskId } = useParams<{ taskId: string }>();
//   const [result, setResult] = useState<AnalysisResult | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!taskId) return;
//     let cancelled = false;
//     let timer: number | undefined;

//     const poll = async () => {
//       try {
//         const status = await getStatus(taskId);
//         if (cancelled) return;

//         if (status.state === 'SUCCESS') {
//           const r = await getResult(taskId);
//           if (!cancelled) setResult(r);
//         } else if (status.state === 'FAILURE') {
//           if (!cancelled) setError('Analysis failed');
//         } else {
//           timer = window.setTimeout(poll, 3000);
//         }
//       } catch (e) {
//         if (!cancelled) setError('Server error');
//       }
//     };

//     poll();
//     return () => {
//       cancelled = true;
//       if (timer) window.clearTimeout(timer);
//     };
//   }, [taskId]);

//   if (error) {
//     return (
//       <main className="flex min-h-screen items-center justify-center bg-[#02040a] text-slate-100">
//         <p>{error}</p>
//       </main>
//     );
//   }

//   if (!result) {
//     return (
//       <main className="flex min-h-screen items-center justify-center bg-[#02040a] text-slate-100">
//         <p>Analyzing track…</p>
//       </main>
//     );
//   }

//   return <DawAnalysisPage result={result} />;
// }
// --- IGNORE ---