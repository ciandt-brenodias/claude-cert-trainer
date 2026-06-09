import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExplainButton } from './ExplainButton';

vi.mock('../../api/claude', () => ({
  explainQuestion: vi.fn(),
}));

import { explainQuestion } from '../../api/claude';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('ExplainButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the explain button', () => {
    render(<ExplainButton questionId="q-1" userAnswer={0} />, { wrapper });

    expect(screen.getByText('Explain with Claude')).toBeInTheDocument();
  });

  it('calls explainQuestion API on first click', async () => {
    vi.mocked(explainQuestion).mockResolvedValue({ explanation: 'A is correct because...' });

    render(<ExplainButton questionId="q-1" userAnswer={0} />, { wrapper });
    fireEvent.click(screen.getByText('Explain with Claude'));

    await waitFor(() => {
      expect(explainQuestion).toHaveBeenCalledWith(
        expect.objectContaining({ questionId: 'q-1', userAnswer: 0 }),
        expect.anything(),
      );
    });
  });

  it('shows explanation text after successful API call', async () => {
    vi.mocked(explainQuestion).mockResolvedValue({ explanation: 'A is correct because...' });

    render(<ExplainButton questionId="q-1" userAnswer={0} />, { wrapper });
    fireEvent.click(screen.getByText('Explain with Claude'));

    await waitFor(() => {
      expect(screen.getByText('A is correct because...')).toBeInTheDocument();
    });
  });

  it('does not call API again on second click (toggle close)', async () => {
    vi.mocked(explainQuestion).mockResolvedValue({ explanation: 'A is correct because...' });

    render(<ExplainButton questionId="q-1" userAnswer={0} />, { wrapper });
    fireEvent.click(screen.getByText('Explain with Claude'));

    await waitFor(() => screen.getByText('Close explanation'));
    fireEvent.click(screen.getByText('Close explanation'));

    expect(explainQuestion).toHaveBeenCalledTimes(1);
  });
});
