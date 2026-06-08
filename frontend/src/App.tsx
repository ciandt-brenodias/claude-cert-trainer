import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from './components/sections/Dashboard';
import { PracticeSelect } from './components/sections/PracticeSelect';
import { QuestionView } from './components/sections/QuestionView';
import { ExamResult } from './components/sections/ExamResult';
import { Review } from './components/sections/Review';
import { Profile } from './components/sections/Profile';
import { AppShell } from './components/layout/AppShell';
import { Card } from './components/ui/Card';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10_000,
    },
  },
});

function NotFound() {
  return (
    <AppShell>
      <Card className="p-8 text-center">
        <p className="text-gray-500 text-sm">Página não encontrada</p>
      </Card>
    </AppShell>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/"                  element={<Dashboard />}      />
          <Route path="/practice"          element={<PracticeSelect />} />
          <Route path="/practice/session"  element={<QuestionView />}   />
          <Route path="/exam/result"       element={<ExamResult />}     />
          <Route path="/review"            element={<Review />}         />
          <Route path="/profile"           element={<Profile />}        />
          <Route path="*"                  element={<NotFound />}       />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
