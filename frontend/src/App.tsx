import { Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-sm font-mono text-gray-400">cert-trainer — fase 1</p>
          </div>
        }
      />
    </Routes>
  );
}
