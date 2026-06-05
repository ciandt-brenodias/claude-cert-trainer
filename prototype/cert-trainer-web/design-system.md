# Design System — claude-cert-trainer
Gerado em: 2026-05-27 | Estilo: minimalist | Stack: React 18 + Vite + Tailwind v4

## Paleta
- Background:   #FAFAFA  (gray-50)
- Surface:      #FFFFFF  (white — cards, sidebar)
- Primary text: #111827  (gray-900)
- Muted text:   #6B7280  (gray-500)
- Subtle text:  #9CA3AF  (gray-400)
- Accent:       #6366F1  (indigo-500) — único acento, XP bars, links ativos, badges
- Accent hover: #4F46E5  (indigo-600)
- Accent bg:    #EEF2FF  (indigo-50)  — highlights suaves
- Border:       #E5E7EB  (gray-200)
- Border focus: #6366F1  (indigo-500)
- Success:      #10B981  (emerald-500) — respostas corretas
- Error:        #EF4444  (red-500)    — respostas erradas
- Warning:      #F59E0B  (amber-500)  — tempo quase esgotado

## Tipografia
- Heading:  Inter — weights 600/700 — tracking -0.02em
- Body:     Inter — weight 400/500 — line-height 1.6
- Mono:     JetBrains Mono — scores, timers, domain codes, XP display

## Tokens
- Radius:   sm=4px  md=8px  lg=12px  xl=16px
- Spacing:  xs=4  sm=8  md=16  lg=24  xl=32  2xl=48  3xl=64  (px)
- Shadow:   sm=0 1px 2px rgba(0,0,0,.06)  md=0 4px 6px rgba(0,0,0,.07)  lg=0 10px 15px rgba(0,0,0,.08)
- Sidebar:  240px fixa (desktop), colapsável (mobile)
- Max content width: 800px centrado

## Componentes base
- Botão primário:   bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition
- Botão secundário: bg-white border border-gray-200 text-gray-700 hover:bg-gray-50
- Botão ghost:      text-gray-500 hover:text-gray-900 hover:bg-gray-100
- Card:             bg-white border border-gray-200 rounded-xl p-6 shadow-sm
- Badge domínio:    text-xs font-mono uppercase tracking-wide bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded
- XP bar:           bg-gray-100 rounded-full h-1.5; fill bg-indigo-500 transition-all
- Option button:    border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50
  - correct:  border-emerald-500 bg-emerald-50 text-emerald-800
  - wrong:    border-red-400    bg-red-50    text-red-800
  - selected: border-indigo-500 bg-indigo-50

## Layout do app
- Shell: sidebar esquerda 240px + main content area
- Sidebar: logo no topo, nav links, user info + XP no rodapé
- Main: max-w-[800px] mx-auto px-6 py-8
- Tela de questão: single-column focada, sem sidebar visível (immersive mode)
