import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BadgeModal } from './BadgeModal';
import type { BadgeEarned } from '../../api/exams';

const badges: BadgeEarned[] = [
  { slug: 'first-correct', name: 'Primeira resposta', description: 'Acertou a primeira questão' },
];

describe('BadgeModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders badge name and description when badges are present', () => {
    render(<BadgeModal badges={badges} onClose={vi.fn()} />);

    expect(screen.getByText('Primeira resposta')).toBeInTheDocument();
    expect(screen.getByText('Acertou a primeira questão')).toBeInTheDocument();
  });

  it('renders nothing when badges array is empty', () => {
    render(<BadgeModal badges={[]} onClose={vi.fn()} />);

    expect(screen.queryByText('Badge unlocked!')).not.toBeInTheDocument();
  });

  it('calls onClose when Continue button is clicked', () => {
    const onClose = vi.fn();
    render(<BadgeModal badges={badges} onClose={onClose} />);

    fireEvent.click(screen.getByText('Continue'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose after AUTO_CLOSE_MS timeout', () => {
    const onClose = vi.fn();
    render(<BadgeModal badges={badges} onClose={onClose} />);

    act(() => vi.advanceTimersByTime(4000));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<BadgeModal badges={badges} onClose={onClose} />);

    const backdrop = container.querySelector('.fixed.inset-0');
    if (backdrop) fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows plural label when multiple badges are earned', () => {
    const multi: BadgeEarned[] = [
      { slug: 'first-correct', name: 'First Correct', description: 'desc1' },
      { slug: 'streak-3', name: '3-Day Streak', description: 'desc2' },
    ];
    render(<BadgeModal badges={multi} onClose={vi.fn()} />);

    expect(screen.getByText('2 badges unlocked!')).toBeInTheDocument();
  });
});
