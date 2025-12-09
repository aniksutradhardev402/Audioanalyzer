// import { useState, useEffect, useRef } from 'react'
// import './App.css'

// // Define the base URL for your Flask API
// const API_URL = 'http://localhost:5000';

// function App() {
//   const [file, setFile] = useState(null);
//   const [taskId, setTaskId] = useState(null);
//   const [status, setStatus] = useState('Ready to upload a file.');
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//   // Use a ref to hold the interval ID to avoid issues with state updates in setInterval
//   const intervalRef = useRef(null);

//   const handleFileChange = (event) => {
//     setFile(event.target.files[0]);
//     setStatus('File selected. Click "Analyze Audio" to start.');
//     setResult(null);
//     setError(null);
//     setTaskId(null);
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       setError('Please select a file first.');
//       return;
//     }

//     setIsProcessing(true);
//     setError(null);
//     setResult(null);
//     setStatus('Uploading file...');

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const response = await fetch(`${API_URL}/upload`, {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error(`Upload failed with status: ${response.status}`);
//       }

//       const data = await response.json();
//       setTaskId(data.task_id);
//       setStatus('File uploaded. Analysis has started...');

//     } catch (err) {
//       setError(err.message);
//       setIsProcessing(false);
//     }
//   };

//   // This effect runs when the taskId changes
//   useEffect(() => {
//     if (taskId) {
//       // Start polling for the status
//       intervalRef.current = setInterval(async () => {
//         try {
//           const response = await fetch(`${API_URL}/status/${taskId}`);
//           const data = await response.json();


//           // Update status message based on backend info
//           // The 'status' field from the backend can be a string or a dictionary
//           let currentStatus = data.status;
//           if (typeof currentStatus === 'object' && currentStatus !== null) {
//             currentStatus = currentStatus.status || 'Processing...';
//           }
//           setStatus(currentStatus);
          // Only surface final state here — the main app shows detailed progress.
          // if (data.state !== 'SUCCESS' && data.state !== 'FAILURE') {
          //   setStatus('Processing...');
          // }

//           if (data.state === 'SUCCESS') {
//             clearInterval(intervalRef.current); // Stop polling
//             setStatus('Analysis complete! Fetching results...');
//             // Fetch the final result
//             const resultResponse = await fetch(`${API_URL}/result/${taskId}`);
//             const resultData = await resultResponse.json();
//             setResult(resultData);
//             setStatus('Done!');
//             setIsProcessing(false);
//           } else if (data.state === 'FAILURE') {
//             clearInterval(intervalRef.current); // Stop polling on failure
//             setError(data.status || 'An unknown error occurred during analysis.');
//             setIsProcessing(false);
//           }
//         } catch (err) {
//           setError('Failed to get task status.');
//           clearInterval(intervalRef.current);
//           setIsProcessing(false);
//         }
//       }, 3000); // Poll every 3 seconds
//     }

//     // Cleanup function to clear the interval when the component unmounts or taskId changes
//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, [taskId]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-950">
//       <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-xl border border-slate-800">
//         <h1 className="text-3xl font-bold text-white mb-3">
//           Audio Analysis Backend
//         </h1>
//         <p className="text-slate-300 mb-6">
//           Upload an audio file (.mp3, .wav) to analyze its properties.
//         </p>

//         <div className="space-y-4">
//           <input
//             type="file"
//             onChange={handleFileChange}
//             disabled={isProcessing}
//             className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 disabled:opacity-50"
//             accept="audio/*"
//           />
//           <button
//             onClick={handleUpload}
//             disabled={!file || isProcessing}
//             className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition disabled:bg-slate-600 disabled:cursor-not-allowed"
//           >
//             {isProcessing ? 'Analyzing...' : 'Analyze Audio'}
//           </button>
//         </div>

//         <div className="mt-6 text-white">
//           <p className="font-semibold">Status: <span className="font-normal text-slate-300">{status}</span></p>
//           {error && <p className="text-red-400 mt-2">Error: {error}</p>}
//           {result && (
//             <pre className="mt-4 p-4 bg-slate-800 rounded-lg text-xs text-slate-200 overflow-x-auto">
//               {JSON.stringify(result, null, 2)}
//             </pre>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App
