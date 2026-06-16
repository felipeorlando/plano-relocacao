# ✈️ Plano de Voo: Brasil → EUA

Timeline visual (estilo Notion) do plano de relocação São Paulo → Flórida: estratégia de
imigração (O-1A para entrar + I-485 por dentro, com I-140 NIW como base), logística dos 4 cães
(microchip → vacina → titer aprovado pela CDC), moradia, carro e construção de dólar/score.

Filtros por assunto, callouts para os dois caminhos críticos (titer dos cães e janela EB-2) e
marcação do ponto "Agora" e do destino.

> Mapa de execução, não aconselhamento jurídico ou tributário. Confirme números de USCIS e
> regras da CDC com a D4U, o vet/autoridade e a companhia aérea.

## Stack

- [Vite](https://vite.dev/) + [React 18](https://react.dev/)
- Componente único, CSS inline (sem dependências de UI)

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build de produção

```bash
npm run build    # gera ./dist
npm run preview  # serve o build localmente
```

## Deploy

Hospedado na Vercel (detecção automática de Vite — sem configuração extra).
