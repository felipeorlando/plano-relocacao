import { useState } from "react";

/**
 * Plano de Relocação Brasil → EUA — visual limpo, inspirado no Notion.
 * Cores por assunto, emojis nos títulos, callouts para o caminho crítico.
 * Dólar e Score são trilhos SEPARADOS de propósito.
 */

const TRACKS = {
  imig: { label: "Imigração", strong: "#337EA9", bg: "#D3E5EF", fg: "#183347" },
  dogs: { label: "Cães", strong: "#448361", bg: "#DBEDDB", fg: "#1C3829" },
  casa: { label: "Moradia", strong: "#9065B0", bg: "#E8DEEE", fg: "#492F64" },
  carro: { label: "Carro", strong: "#D9730D", bg: "#FADEC9", fg: "#5C3B23" },
  dolar: { label: "Dólar", strong: "#CB912F", bg: "#FDECC8", fg: "#4D3C0E" },
  score: { label: "Score", strong: "#C14C8A", bg: "#F5E0E9", fg: "#5C1A36" },
};

const PROPS = [
  { emoji: "📍", label: "Origem", value: "São Paulo · GRU" },
  { emoji: "🛬", label: "Destino", value: "Flórida" },
  { emoji: "👥", label: "Passageiros", value: "2 adultos + 4 cães" },
  { emoji: "🧭", label: "Estratégia", value: "O-1A para entrar + I-485 por dentro (I-140 NIW como base)" },
];

const CALLOUTS = [
  {
    emoji: "🦴", tone: "warn", title: "Caminho crítico — cães",
    text: "Microchip (antes da vacina) → vacina antirrábica → coletar sangue ≥30 dias depois → laboratório aprovado pela CDC → ≥28 dias antes de entrar. Se o titer reprovar, volta +30 dias. É o trilho mais longo de todos — por isso começa já na semana 0.",
  },
  {
    emoji: "⏰", tone: "warn", title: "Caminho crítico — janela EB-2",
    text: "O I-485 só pode ser protocolado e aprovado enquanto a priority date está Current (risco de retroceder por volta de 30/set/2026). A corrida é entrar com o O-1 e protocolar dentro dessa janela.",
  },
  {
    emoji: "💳", tone: "info", title: "Como o Score funciona (pra não confundir)",
    text: "Nenhum cartão brasileiro constrói teu score americano — eles só alimentam tua APROVAÇÃO via Nova Credit (leitura do Serasa). O FICO só começa quando você chega com o SSN, que o O-1 te dá. O Amex BR é OPCIONAL: dá um cartão premium via Global Transfer, mas o plano funciona sem ele, via Chase + Nova Credit. Dólar e Score são trilhos separados: render dólar não toca no score.",
  },
];

const LEGS = [
  {
    code: "00", emoji: "🚀", title: "Ignição", window: "Agora · semana 0–1", now: true,
    note: "Daqui uma semana: o contrato com a D4U vira a trilha O-1A. Do Brasil, o jogo é PREPARAR — o score só começa na chegada.",
    tasks: [
      { track: "imig", text: "Pivotar o contrato D4U para a trilha O-1A. Pausar a via consular do EB-2; o I-140 NIW (já aprovado) fica preservado como base do futuro I-485." },
      { track: "imig", text: "Reunir evidências O-1A: contribuição original (PR no RepoBar/OpenClaw), alta remuneração, papel crítico (GraphQL Router PayPal/Venmo). Disparar IEEE Senior Member como 4º critério." },
      { track: "dogs", text: "Confirmar microchip ISO em cada um dos 4 cães — implantado ANTES da vacina antirrábica, senão a vacina é inválida.", crit: true },
      { track: "dogs", text: "Verificar vacina antirrábica válida e atualizada em todos. Maior lead time do plano — não dá pra deixar pra depois." },
      { track: "dolar", text: "Abrir a Wise e ativar o Rende+ em dólar (~3,5% num fundo de Tesouro americano da BlackRock, liquidez diária, zero complexidade de corretora). Receber o pagamento dos clientes US direto em USD pelos dados de conta americana da Wise (routing 026 / CFSB) — sem conversão e sem IOF na entrada. É o 'deixa rendendo e esquece'." },
      { track: "score", text: "OPCIONAL: tirar um Amex BR agora. Ele não constrói score, mas maturando 3 meses destrava o Global Transfer (cartão premium na chegada). Se for hassle/custo, dá pra pular — o plano funciona sem." },
      { track: "score", text: "Manter o Serasa limpo: pagar TODOS os cartões brasileiros (Visa/Master/Amex) em dia. É esse histórico que o Nova Credit vai ler pra te aprovar nos EUA." },
    ],
  },
  {
    code: "01", emoji: "🛫", title: "Subindo", window: "Petição O-1A · ≈ semana 1–8",
    note: "Petição em curso e o relógio dos cães rodando em paralelo.",
    tasks: [
      { track: "imig", text: "D4U protocola o I-129 (O-1A). Com premium processing, decisão em ~15 dias úteis." },
      { track: "imig", text: "Agendar entrevista de visto NÃO-imigrante (DS-160) no consulado. O O-1 não é atingido pela pausa de visto de imigrante do Brasil." },
      { track: "dogs", text: "Titer antirrábico: coletar sangue ≥30 dias após a vacina e enviar a laboratório aprovado pela CDC. Coleta ≥28 dias antes da entrada. Se reprovar, revacina e recoleta 30 dias depois.", crit: true },
      { track: "dogs", text: "Reservar vaga em instalação registrada pela CDC no aeroporto de chegada (exame na chegada). 4 cães = capacidade e custo, reservar cedo." },
      { track: "dolar", text: "Manter o caixa rendendo no Rende+ da Wise. Sem ação extra — é piloto automático." },
      { track: "score", text: "Seguir com pagamentos limpos nos cartões BR e o Amex BR maturando (se tirou). Tudo isso alimenta a aprovação futura via Nova Credit." },
    ],
  },
  {
    code: "02", emoji: "🛂", title: "Travessia", window: "Visto, voo dos cães e entrada · ≈ semana 8–12",
    note: "Carimbo do visto, os cães voam e você entra.",
    tasks: [
      { track: "imig", text: "Entrevista consular → carimbo do O-1 no passaporte." },
      { track: "casa", text: "Reservar a ponte: casa inteira pet-friendly (Airbnb mensal 28+ ou mobiliado de médio prazo) para 4 pessoas + 4 cães. Nada de prédio nem extended-stay. Duração tem que cobrir a chegada REAL dos cães, não a sua data de pouso." },
      { track: "dogs", text: "Vet completa o Certification of Foreign Rabies Vaccination and Microchip (endossado pela autoridade). Submeter o CDC Dog Import Form online — um por cão — e guardar o recibo." },
      { track: "dogs", text: "LIGAR para as linhas aéreas e confirmar: (1) aceitam cães do Brasil (alto risco); (2) a rota chega num aeroporto com instalação CDC; (3) comportam os 4 (cargo/manifesto, caixas IATA). Apresentar o recibo do CDC à companhia antes do embarque.", crit: true },
      { track: "imig", text: "ENTRAR nos EUA com o O-1. O O-1 já autoriza trabalho para o peticionário a partir da entrada." },
    ],
  },
  {
    code: "03", emoji: "🛬", title: "Em solo — ajuste de status", window: "≈ mês 3–5",
    note: "Corrida contra a janela EB-2. E aqui o SSN finalmente destrava o trilho de score.",
    tasks: [
      { track: "imig", text: "Protocolar o I-485 (adjustment of status) com base no I-140 NIW aprovado, dentro da janela EB-2 ROW Current. Pedir EAD + Advance Parole no mesmo combo.", crit: true },
      { track: "imig", text: "Obter o SSN (via O-1). É ELE que destrava a construção de score — antes dele, nenhum cartão pontua teu FICO." },
      { track: "score", text: "Com o SSN: abrir um cartão Chase optando pelo Nova Credit. Ele importa teu Serasa, te aprova com limite real apesar do arquivo americano em branco, e reporta aos 3 bureaus desde o dia 1. Este é o MOTOR do FICO." },
      { track: "score", text: "Se tirou o Amex BR: disparar o Global Transfer → Amex US premium + relacionamento Amex, em paralelo. Bônus, não obrigatório." },
      { track: "carro", text: "Pré-aprovação em credit union ou lender de imigrante (Nova Credit), 20%+ de entrada → financiar um Kia modesto. Não torrar o caixa à vista — o Kia também vira tradeline parcelada (credit mix)." },
      { track: "casa", text: "Caçar o aluguel longo: casa de landlord particular + depósito reforçado + garantidor (TheGuarantors / Insurent) + carta de renda. Atenção a HOA e zona de enchente/seguro na Flórida." },
      { track: "dolar", text: "Abrir uma conta-corrente americana como 'hub de cash' — priorizar a maior rede de ATMs sem tarifa (Chase / BofA). Puxar da Wise por ACH (USD→USD, grátis e sem conversão) quando precisar de dinheiro vivo; a mesma conta serve de relacionamento pro mortgage. (Schwab se quiser banco + corretora juntos.)" },
    ],
  },
  {
    code: "04", emoji: "🧭", title: "Cruzeiro — estabilização", window: "≈ mês 5–12",
    note: "Trabalho livre, independência e score subindo.",
    tasks: [
      { track: "imig", text: "EAD + Advance Parole na mão → trabalhar para qualquer um e viajar livremente." },
      { track: "imig", text: "Aos 180 dias de I-485 pendente → portabilidade AC21. A partir daqui você fica de fato independente do Raavi / SocialLadder." },
      { track: "score", text: "Manter utilização baixa (abaixo de ~10% do limite) e tudo pago em dia. Um 2º cartão + o financiamento do Kia engrossam o arquivo e aceleram rumo aos 700+ — otimização de velocidade pro mortgage, não necessidade." },
      { track: "carro", text: "Refinanciar o Kia quando o FICO subir (refi de carro é trivial e comum)." },
      { track: "dolar", text: "Regime de cruzeiro: Wise rendendo + cartão pro dia a dia; conta-corrente US como hub de cash (ATMs grátis) abastecida por ACH da Wise sem conversão." },
    ],
  },
  {
    code: "FL", emoji: "🏁", title: "Aproximação final — Green Card & casa", window: "≈ mês 12–24", dest: true,
    note: "Destino: residência permanente e a casa própria.",
    tasks: [
      { track: "imig", text: "Aprovação do I-485 → Green Card. Residência permanente, sua, base para a cidadania lá na frente." },
      { track: "casa", text: "Score maduro + renda documentada → qualificar o mortgage (a linha dos 18 meses) → comprar a casa." },
    ],
  },
];

export default function PlanoRelocacao() {
  const [active, setActive] = useState(new Set(Object.keys(TRACKS)));
  const toggle = (k) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next.size === 0 ? new Set(Object.keys(TRACKS)) : next;
    });

  return (
    <div className="nz">
      <style>{css}</style>

      <h1 className="nz-title">✈️ Plano de Voo: Brasil → EUA</h1>
      <p className="nz-lead">
        Entrar com o <b>O-1A</b> (não afetado pela pausa consular) e fazer o <b>I-485</b> por dentro, usando o
        I-140 NIW já aprovado como base. O EB-2 não é abandonado — só pauso a via consular.
      </p>

      <div className="nz-props">
        {PROPS.map((p) => (
          <div className="nz-prop" key={p.label}>
            <span className="nz-prop-label"><span className="nz-emoji">{p.emoji}</span>{p.label}</span>
            <span className="nz-prop-value">{p.value}</span>
          </div>
        ))}
      </div>

      <div className="nz-callouts">
        {CALLOUTS.map((c) => (
          <div className={`nz-callout ${c.tone}`} key={c.title}>
            <span className="nz-callout-emoji">{c.emoji}</span>
            <div>
              <div className="nz-callout-title">{c.title}</div>
              <div className="nz-callout-text">{c.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="nz-filter">
        <span className="nz-filter-label">Assuntos</span>
        {Object.entries(TRACKS).map(([k, t]) => {
          const on = active.has(k);
          return (
            <button
              key={k}
              className={`nz-tag-btn ${on ? "on" : "off"}`}
              aria-pressed={on}
              onClick={() => toggle(k)}
              style={on ? { background: t.bg, color: t.fg } : undefined}
            >
              <span className="nz-tag-dot" style={{ background: on ? t.strong : "#C7C6C2" }} />
              {t.label}
            </button>
          );
        })}
      </div>

      <ol className="nz-timeline">
        {LEGS.map((leg) => {
          const visible = leg.tasks.filter((t) => active.has(t.track));
          if (visible.length === 0) return null;
          return (
            <li className={`nz-leg ${leg.now ? "now" : ""} ${leg.dest ? "dest" : ""}`} key={leg.code}>
              <div className="nz-rail">
                <span className="nz-node" />
              </div>
              <div className="nz-body">
                <div className="nz-eyebrow">
                  {leg.dest ? "DESTINO" : `LEG ${leg.code}`} · {leg.window}
                  {leg.now && <span className="nz-now-tag">Agora</span>}
                </div>
                <h2 className="nz-leg-title"><span className="nz-emoji-h">{leg.emoji}</span>{leg.title}</h2>
                {leg.note && <p className="nz-leg-note">{leg.note}</p>}
                <ul className="nz-items">
                  {visible.map((t, i) => (
                    <li className="nz-item" key={i}>
                      <span className="nz-bullet" style={{ background: TRACKS[t.track].strong }} />
                      <span className="nz-item-text">
                        <span className="nz-tag" style={{ background: TRACKS[t.track].bg, color: TRACKS[t.track].fg }}>
                          {TRACKS[t.track].label}
                        </span>
                        {t.text}
                        {t.crit && <span className="nz-crit">🔴 caminho crítico</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="nz-foot">
        Dois prazos mandam no plano: a cadeia do titer dos cães (longa, começa já) e a janela EB-2 Current para o I-485.
        O score só arranca na chegada, com o SSN. Números de USCIS e regras da CDC mudam — confirme os exatos com a D4U,
        o vet/autoridade e a companhia aérea. É um mapa de execução, não aconselhamento jurídico ou tributário.
      </p>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.nz{
  --text:#37352F; --muted:#787774; --faint:#9B9A97;
  --divider:#E9E9E7; --hover:#F1F1EF; --panel:#F7F6F3;
  font-family:'Inter',ui-sans-serif,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;
  color:var(--text); background:#fff; line-height:1.5;
  max-width:820px; margin:0 auto; padding:40px clamp(18px,4vw,40px) 60px;
  -webkit-font-smoothing:antialiased;
}
.nz *{box-sizing:border-box;}

.nz-title{font-size:clamp(28px,5vw,40px); font-weight:700; letter-spacing:-.02em; line-height:1.15; margin:0 0 12px;}
.nz-lead{font-size:15px; color:#5b5a56; max-width:660px; margin:0 0 26px;}
.nz-lead b{color:var(--text); font-weight:600;}

.nz-props{display:grid; grid-template-columns:1fr 1fr; gap:2px 28px; padding:16px 18px; background:var(--panel); border-radius:10px; margin-bottom:22px;}
.nz-prop{display:flex; align-items:baseline; gap:10px; padding:5px 0; min-width:0;}
.nz-prop-label{flex:0 0 116px; font-size:13.5px; color:var(--muted); display:flex; align-items:center; gap:7px;}
.nz-prop-value{font-size:13.5px; color:var(--text); font-weight:500; min-width:0;}
.nz-emoji{font-size:14px;}

.nz-callouts{display:flex; flex-direction:column; gap:10px; margin-bottom:30px;}
.nz-callout{display:flex; gap:12px; padding:14px 16px; border-radius:10px; background:var(--panel);}
.nz-callout.warn{background:#FBEEE6;}
.nz-callout.info{background:#EEF1F4;}
.nz-callout-emoji{font-size:18px; line-height:1.4; flex:0 0 auto;}
.nz-callout-title{font-size:13.5px; font-weight:600; margin-bottom:3px;}
.nz-callout-text{font-size:13.5px; color:#5b5a56;}

.nz-filter{display:flex; flex-wrap:wrap; align-items:center; gap:7px; padding-bottom:22px; margin-bottom:8px; border-bottom:1px solid var(--divider);}
.nz-filter-label{font-size:12px; color:var(--faint); margin-right:4px; text-transform:uppercase; letter-spacing:.06em;}
.nz-tag-btn{display:inline-flex; align-items:center; gap:6px; cursor:pointer; border:none; font-family:inherit;
  font-size:13px; font-weight:500; padding:4px 11px; border-radius:6px; background:#F1F1EF; color:#787774; transition:opacity .15s, transform .15s;}
.nz-tag-btn.off{opacity:.6;}
.nz-tag-btn:hover{transform:translateY(-1px); opacity:1;}
.nz-tag-btn:focus-visible{outline:2px solid #337EA9; outline-offset:2px;}
.nz-tag-dot{width:8px; height:8px; border-radius:50%;}

.nz-timeline{list-style:none; margin:18px 0 0; padding:0;}
.nz-leg{display:grid; grid-template-columns:24px 1fr; gap:4px; position:relative;}
.nz-rail{position:relative; display:flex; justify-content:center;}
.nz-rail::before{content:""; position:absolute; top:8px; bottom:0; width:1.5px; background:var(--divider);}
.nz-leg:last-child .nz-rail::before{display:none;}
.nz-node{position:relative; z-index:1; width:11px; height:11px; border-radius:50%; margin-top:6px; background:#fff; border:2px solid #C7C6C2;}
.nz-leg.now .nz-node{border-color:#337EA9; background:#337EA9; box-shadow:0 0 0 4px rgba(51,126,169,.14);}
.nz-leg.dest .nz-node{border-color:#37352F; background:#37352F; border-radius:2px; transform:rotate(45deg); margin-top:7px;}

.nz-body{padding:0 0 28px 8px;}
.nz-eyebrow{font-size:11.5px; font-weight:600; letter-spacing:.08em; color:var(--faint); text-transform:uppercase; display:flex; align-items:center; gap:8px;}
.nz-now-tag{text-transform:none; letter-spacing:0; font-size:11px; font-weight:600; color:#0B6E99; background:#D3E5EF; padding:2px 8px; border-radius:5px;}
.nz-leg-title{font-size:20px; font-weight:600; letter-spacing:-.01em; margin:5px 0 3px; display:flex; align-items:center; gap:9px;}
.nz-emoji-h{font-size:19px;}
.nz-leg-note{font-size:13.5px; color:var(--muted); margin:0 0 13px;}

.nz-items{list-style:none; margin:0; padding:0;}
.nz-item{display:flex; gap:10px; padding:7px 8px 7px 6px; margin-left:-8px; border-radius:6px; transition:background .12s;}
.nz-item:hover{background:var(--hover);}
.nz-bullet{flex:0 0 auto; width:6px; height:6px; border-radius:50%; margin-top:9px;}
.nz-item-text{font-size:14px; color:#2f2e2b; line-height:1.55;}
.nz-tag{display:inline-block; font-size:11.5px; font-weight:500; padding:1px 8px; border-radius:4px; margin-right:8px; vertical-align:1px; white-space:nowrap;}
.nz-crit{display:inline-block; font-size:11px; font-weight:600; color:#B4332B; background:#FBE4E1; padding:1px 8px; border-radius:4px; margin-left:8px; white-space:nowrap;}

.nz-foot{font-size:12.5px; color:var(--faint); line-height:1.6; margin-top:30px; padding-top:18px; border-top:1px solid var(--divider);}

@media (max-width:560px){
  .nz{padding:30px 16px 46px;}
  .nz-props{grid-template-columns:1fr;}
  .nz-prop-label{flex-basis:104px;}
}
@media (prefers-reduced-motion: reduce){
  .nz-tag-btn, .nz-item{transition:none;}
}
`;
