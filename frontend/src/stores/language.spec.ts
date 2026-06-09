import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLanguage } from './language';

vi.mock('../i18n/index', () => ({
  default: { changeLanguage: vi.fn() },
}));

import i18n from '../i18n/index';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useLanguage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useLanguage.setState({ lang: 'en' });
    vi.clearAllMocks();
  });

  it('defaults to en when localStorage has no value', () => {
    expect(useLanguage.getState().lang).toBe('en');
  });

  it('setLang updates the store', () => {
    useLanguage.getState().setLang('pt-BR');
    expect(useLanguage.getState().lang).toBe('pt-BR');
  });

  it('setLang persists to localStorage', () => {
    useLanguage.getState().setLang('pt-BR');
    expect(localStorageMock.getItem('lang')).toBe('pt-BR');
  });

  it('setLang calls i18n.changeLanguage', () => {
    useLanguage.getState().setLang('pt-BR');
    expect(i18n.changeLanguage).toHaveBeenCalledWith('pt-BR');
  });

  it('setLang back to en updates store and calls i18n', () => {
    useLanguage.getState().setLang('pt-BR');
    useLanguage.getState().setLang('en');
    expect(useLanguage.getState().lang).toBe('en');
    expect(i18n.changeLanguage).toHaveBeenLastCalledWith('en');
  });
});
