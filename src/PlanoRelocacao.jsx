import { useRef, useState } from "react";
import {
  FloatingArrow,
  FloatingPortal,
  arrow,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";

/**
 * Plano de Relocação Brasil → EUA — visual limpo, inspirado no Notion.
 * Trilhas por assunto, emojis, callouts, tooltips (underline tracejado).
 * Inclui a trilha "Setup" (vida prática) e o status da Maria (dependente O-3).
 * Peticionário do O-1: a própria LLC (auto-patrocínio) — sem empregador terceiro.
 * Tooltips via @floating-ui/react: portal + flip/shift (não vazam da tela),
 * hover + foco + toque + Esc/clique-fora pra fechar.
 */

const TRACKS = {
  imig: { label: "Imigração", strong: "#337EA9", bg: "#D3E5EF", fg: "#183347" },
  dogs: { label: "Cães", strong: "#448361", bg: "#DBEDDB", fg: "#1C3829" },
  casa: { label: "Moradia", strong: "#9065B0", bg: "#E8DEEE", fg: "#492F64" },
  carro: { label: "Carro", strong: "#D9730D", bg: "#FADEC9", fg: "#5C3B23" },
  dolar: { label: "Dólar", strong: "#CB912F", bg: "#FDECC8", fg: "#4D3C0E" },
  score: { label: "Score", strong: "#C14C8A", bg: "#F5E0E9", fg: "#5C1A36" },
  setup: { label: "Setup", strong: "#2F9E9B", bg: "#DCEEED", fg: "#1C3D3C" },
};

// Glossário: termos pouco comuns p/ BR ou de processo migratório.
const GLOSSARY = {
  "O-1A": "Visto de não-imigrante para habilidade extraordinária (ciência, negócios, etc.). Deixa entrar e trabalhar nos EUA e não é afetado pela pausa de visto de imigrante do Brasil.",
  "O-1": "O mesmo status O-1A — habilidade extraordinária, autoriza entrada e trabalho nos EUA.",
  "O-3": "Visto de dependente (cônjuge/filho) do titular O-1. Deixa morar nos EUA com você, mas NÃO autoriza trabalho — isso só vem com o EAD do I-485.",
  "I-129": "Formulário de petição de trabalhador não-imigrante (o pedido do O-1), protocolado pelo peticionário na USCIS.",
  "I-140": "Petição de imigrante por emprego/talento. O teu (EB-2 NIW) já está APROVADO — é a base que permite protocolar o I-485.",
  "I-485": "Pedido de 'adjustment of status': ajustar teu status para residente permanente (green card) estando DENTRO dos EUA, sem voltar ao consulado.",
  "I-94": "Registro eletrônico de entrada/saída dos EUA, que mostra teu status e prazo de permanência. Serve de prova de status legal (ex.: para tirar a carteira de motorista).",
  "EB-2": "Categoria de green card por qualificação avançada. No teu caso com NIW (National Interest Waiver), que dispensa oferta de emprego. 'ROW' = fila geral (fora dos países com fila própria); 'Current' = fila aberta pra você agora.",
  "EAD": "Employment Authorization Document — cartão que autoriza trabalhar para QUALQUER empregador enquanto o I-485 está pendente.",
  "Advance Parole": "Autorização para sair e reentrar nos EUA com o I-485 pendente, sem abandonar o pedido de green card. Vem no mesmo cartão (combo) que o EAD.",
  "premium processing": "Serviço pago da USCIS que acelera a DECISÃO de uma petição (ex.: I-129) para ~15 dias úteis. Acelera a análise — não exige sua presença nos EUA nem muda o resultado.",
  "DS-160": "Formulário online de pedido de visto de não-imigrante, preenchido antes da entrevista no consulado.",
  "USCIS": "U.S. Citizenship and Immigration Services — a agência de imigração dos EUA que decide as petições.",
  "SSA": "Social Security Administration — o órgão americano onde você solicita o SSN.",
  "CDC": "Centers for Disease Control — agência de saúde dos EUA. Regula a entrada de cães e classifica o Brasil como país de alto risco para raiva canina.",
  "Nova Credit": "Serviço que traduz teu histórico de crédito brasileiro (Serasa) para um formato que credores americanos leem. Ajuda na APROVAÇÃO apesar do arquivo americano em branco — mas não cria um score americano.",
  "Global Transfer": "Programa do Amex que usa tua relação interna com o Amex de um país elegível (Brasil incluído) para te dar um Amex americano só com passaporte, sem SSN.",
  "SSN": "Social Security Number — número de 9 dígitos do governo americano, o 'CPF' dos EUA. Liga você aos bureaus de crédito e é exigido para emprego, banco, cartão, carteira e seguro. O O-1 te dá direito a um.",
  "FICO": "O score de crédito padrão dos EUA (300–850). Quanto maior, melhores as condições de crédito, aluguel e financiamento.",
  "bureaus": "As 3 agências de crédito dos EUA (Experian, Equifax, TransUnion) que registram teu histórico e calculam teu score.",
  "tradeline": "Cada linha de crédito ativa no teu relatório (um cartão, um financiamento). Ter várias, bem pagas, fortalece e acelera o score.",
  "credit mix": "A variedade de tipos de crédito (rotativo como cartão + parcelado como financiamento). Um mix variado ajuda o FICO.",
  "credit union": "Cooperativa de crédito americana — costuma ter as menores taxas de financiamento e ser mais amigável a recém-chegado que os bancos grandes.",
  "mortgage": "Financiamento imobiliário nos EUA. A qualificação depende do score (FICO), renda comprovada e do DTI (relação dívida/renda mensal) — por isso carro e cartões impactam aqui.",
  "Schwab": "Charles Schwab — corretora americana que também tem banco. Junta corretora + conta + crédito futuro num lugar só, e converte de não-residente (W-8BEN) para residente (W-9) sem reabrir.",
  "ACH": "Automated Clearing House — rede de transferências bancárias domésticas dos EUA, em dólar. Barata (ou grátis) e o jeito padrão de mover USD entre contas americanas.",
  "Rende+": "Recurso da Wise que aplica teu saldo em dólar num fundo de Tesouro americano (BlackRock), rendendo juros diários com liquidez total.",
  "HOA": "Homeowners Association — associação de moradores de condomínios/bairros planejados nos EUA. Cobra taxa mensal e impõe regras (inclusive limite de pets, que pode te afetar com 4 cães).",
  "TheGuarantors / Insurent": "Empresas que servem de fiador (garantidor) de aluguel nos EUA. Por uma taxa, avalizam teu contrato — útil para quem chega sem histórico de crédito/aluguel americano.",
  "carta de renda": "Comprovante de renda para landlords/credores. Trabalhando na sua própria LLC, você mesmo emite a carta em papel timbrado da empresa (cargo + renda) e reforça com contratos, faturas, extratos da conta da empresa e declarações de imposto. Um contador assinando dá ainda mais peso.",
  "ACA": "O 'marketplace' de planos de saúde do Obamacare (Healthcare.gov). Quem é lawfully present (como no O-1) pode comprar; mudar de país pros EUA abre uma janela especial de inscrição.",
  "Special Enrollment Period": "Janela para se inscrever num plano de saúde fora do período normal, aberta por um evento de vida — mudar de país pros EUA conta. Tipicamente ~60 dias.",
  "lawfully present": "Status de presença legal nos EUA. Inclui vistos de trabalho como o O-1 — e é o que te torna elegível ao marketplace de saúde (ACA).",
  "utilities": "Contas de serviços da casa nos EUA — luz, água, gás, internet. Algumas exigem SSN/crédito ou depósito para ativar.",
  "ER": "Emergency Room (pronto-socorro). Por lei, estabiliza qualquer um com ou sem seguro — mas a conta sem cobertura é altíssima.",
};

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
const TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
const TERM_RE = new RegExp("(" + TERMS.map(escapeRe).join("|") + ")", "g");

function Term({ term, def }) {
  const [open, setOpen] = useState(false);
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top",
    // top/left positioning deixa o `transform` livre p/ a animação de entrada.
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(9),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
  });

  const hover = useHover(context, {
    move: false,
    handleClose: safePolygon(),
    delay: { open: 80, close: 60 },
  });
  const focus = useFocus(context);
  const click = useClick(context); // toque/clique no mobile
  const dismiss = useDismiss(context); // Esc + clique fora
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, click, dismiss, role]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: { open: 140, close: 90 },
    initial: { opacity: 0, transform: "translateY(3px)" },
  });

  return (
    <>
      <span ref={refs.setReference} className="term" tabIndex={0} {...getReferenceProps()}>
        {term}
      </span>
      {isMounted && (
        <FloatingPortal>
          <span
            ref={refs.setFloating}
            className="term-pop"
            style={{ ...floatingStyles, ...transitionStyles }}
            {...getFloatingProps()}
          >
            {def}
            <FloatingArrow ref={arrowRef} context={context} fill="#2B2A28" tipRadius={1} />
          </span>
        </FloatingPortal>
      )}
    </>
  );
}

// Marca a PRIMEIRA ocorrência de cada termo (em ordem de leitura) com tooltip.
function withTerms(text, ctx, prefix) {
  if (!text) return text;
  const parts = [];
  let last = 0, m, i = 0;
  TERM_RE.lastIndex = 0;
  while ((m = TERM_RE.exec(text)) !== null) {
    const term = m[0], start = m.index;
    if (start > last) parts.push(text.slice(last, start));
    if (!ctx.used.has(term)) {
      ctx.used.add(term);
      parts.push(<Term key={prefix + "-" + (i++)} term={term} def={GLOSSARY[term]} />);
    } else {
      parts.push(term);
    }
    last = start + term.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const PROPS = [
  { emoji: "📍", label: "Origem", value: "São Paulo · GRU" },
  { emoji: "🛬", label: "Destino", value: "Flórida" },
  { emoji: "👥", label: "Passageiros", value: "Você + Maria (O-3) + 4 cães" },
  { emoji: "🧭", label: "Estratégia", value: "O-1A para entrar (peticionado pela sua própria LLC) + I-485 por dentro, com o I-140 NIW como base" },
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
    note: "Petição em curso, papelada da Maria e o relógio dos cães rodando em paralelo.",
    tasks: [
      { track: "imig", text: "A D4U prepara e protocola o I-129 (O-1A) tendo a sua própria LLC como peticionária — você se auto-patrocina, sem empregador terceiro. Feito com você ainda no Brasil; com premium processing, decisão em ~15 dias úteis. (O carimbo do visto vem depois, no consulado — LEG 02.)" },
      { track: "imig", text: "Maria (cônjuge) vai como dependente O-3. Apostilar a certidão de casamento (Convenção de Haia) — comprova o vínculo pro visto O-3 dela. Lembrar: O-3 NÃO autoriza trabalho." },
      { track: "imig", text: "Agendar a entrevista de visto NÃO-imigrante (DS-160) no consulado — pra você e pra Maria. O O-1 não é atingido pela pausa de visto de imigrante do Brasil." },
      { track: "dogs", text: "Titer antirrábico: coletar sangue ≥30 dias após a vacina e enviar a laboratório aprovado pela CDC. Coleta ≥28 dias antes da entrada. Se reprovar, revacina e recoleta 30 dias depois.", crit: true },
      { track: "dogs", text: "Reservar vaga em instalação registrada pela CDC no aeroporto de chegada (exame na chegada). 4 cães = capacidade e custo, reservar cedo." },
      { track: "setup", text: "Pesquisar plano de saúde americano (marketplace ACA pra Flórida) e cotar um seguro-saúde internacional/de viagem pra cobrir a janela entre o pouso e o plano americano ativo." },
      { track: "score", text: "Seguir com pagamentos limpos nos cartões BR e o Amex BR maturando (se tirou). Tudo isso alimenta a aprovação futura via Nova Credit." },
    ],
  },
  {
    code: "02", emoji: "🛂", title: "Travessia", window: "Visto, voo dos cães e entrada · ≈ semana 8–12",
    note: "Carimbo do visto (seu e da Maria), os cães voam e vocês entram.",
    tasks: [
      { track: "imig", text: "Entrevista consular → carimbo do O-1 no passaporte." },
      { track: "imig", text: "Maria pega o visto O-3 (dependente) no consulado junto com você, com base na tua petição, e entra com você." },
      { track: "setup", text: "Contratar o seguro-saúde de viagem/internacional ANTES de embarcar — cobre emergências do pouso até o plano americano entrar. Um ER nos EUA sem seguro é financeiramente catastrófico." },
      { track: "casa", text: "Reservar a ponte: casa inteira pet-friendly (Airbnb mensal 28+ ou mobiliado de médio prazo) para 4 pessoas + 4 cães. Nada de prédio nem extended-stay. Duração tem que cobrir a chegada REAL dos cães, não a sua data de pouso." },
      { track: "dogs", text: "Vet completa o Certification of Foreign Rabies Vaccination and Microchip (endossado pela autoridade). Submeter o CDC Dog Import Form online — um por cão — e guardar o recibo." },
      { track: "dogs", text: "LIGAR para as linhas aéreas e confirmar: (1) aceitam cães do Brasil (alto risco); (2) a rota chega num aeroporto com instalação CDC; (3) comportam os 4 (cargo/manifesto, caixas IATA). Apresentar o recibo do CDC à companhia antes do embarque.", crit: true },
      { track: "imig", text: "ENTRAR nos EUA com o O-1 (e a Maria com o O-3). O O-1 já autoriza trabalho para a sua LLC peticionária a partir da entrada." },
    ],
  },
  {
    code: "03", emoji: "🛬", title: "Em solo — ajuste de status e setup de morador", window: "≈ mês 3–5",
    note: "Corrida contra a janela EB-2, e a fase mais corrida: o SSN destrava quase tudo (carteira, banco, crédito, seguro).",
    tasks: [
      { track: "imig", text: "Protocolar o I-485 (adjustment of status) com base no I-140 NIW aprovado, dentro da janela EB-2 ROW Current. Pedir EAD + Advance Parole no mesmo combo.", crit: true },
      { track: "imig", text: "Solicitar o SSN na SSA (com o O-1). É ELE que destrava carteira, banco, crédito, seguro e o FICO — antes dele, nada disso anda." },
      { track: "imig", text: "Com o I-485 protocolado, a Maria entra com um I-485 derivado (cônjuge do principal EB-2) e pede o próprio EAD + Advance Parole. Com o EAD dela (sai em alguns meses), ela pode trabalhar." },
      { track: "setup", text: "Pegar uma linha americana (eSIM ou pré-pago) logo na chegada — número US é exigido pra banco, cartões e quase tudo." },
      { track: "setup", text: "Tirar a carteira de motorista da Flórida (até 30 dias como residente): passaporte + I-94 + SSN + 2 comprovantes de endereço na FL. Brasil não tem reciprocidade, então tem prova escrita + de direção." },
      { track: "setup", text: "Inscrever-se num plano de saúde no marketplace ACA da Flórida — o O-1 é lawfully present, logo elegível; mudar pro país abre um Special Enrollment Period (~60 dias). Com tua renda alta, conta com prêmio cheio (subsídio pouco ou nenhum). Vale pra você e pra Maria." },
      { track: "score", text: "Com o SSN: abrir um cartão Chase optando pelo Nova Credit. Ele importa teu Serasa, te aprova com limite real apesar do arquivo americano em branco, e reporta aos 3 bureaus desde o dia 1. Este é o MOTOR do FICO." },
      { track: "score", text: "Se tirou o Amex BR: disparar o Global Transfer → Amex US premium + relacionamento Amex, em paralelo. Bônus, não obrigatório." },
      { track: "dolar", text: "Abrir uma conta-corrente americana como 'hub de cash' — priorizar a maior rede de ATMs sem tarifa (Chase / BofA). Puxar da Wise por ACH (USD→USD, grátis e sem conversão) quando precisar de dinheiro vivo; a mesma conta serve de relacionamento pro mortgage. (Schwab se quiser banco + corretora juntos.)" },
      { track: "carro", text: "Pré-aprovação em credit union ou lender de imigrante (Nova Credit), 20%+ de entrada → financiar um Kia modesto. Não torrar o caixa à vista — o Kia também vira tradeline parcelada (credit mix)." },
      { track: "casa", text: "Caçar o aluguel longo: casa de landlord particular + depósito reforçado + garantidor (TheGuarantors / Insurent) + carta de renda. Atenção a HOA e zona de enchente/seguro na Flórida." },
      { track: "setup", text: "Ao fechar o aluguel longo, ligar as utilities (luz, água, internet) — algumas pedem SSN/crédito ou depósito. Internet é prioridade pro teu trabalho remoto." },
      { track: "dogs", text: "Achar um veterinário local na Flórida, transferir o histórico dos 4 cães e manter o calendário de vacinas. Checar se o condado exige licença/registro de pet." },
    ],
  },
  {
    code: "04", emoji: "🧭", title: "Cruzeiro — estabilização", window: "≈ mês 5–12",
    note: "Trabalho livre, score subindo e vida prática nos trilhos. Como você se auto-patrocina, nunca esteve preso a ninguém.",
    tasks: [
      { track: "imig", text: "EAD + Advance Parole na mão (seu e da Maria) → trabalhar para qualquer um e viajar livremente." },
      { track: "imig", text: "Como o NIW é auto-petição e o O-1 é pela sua própria LLC, você não fica preso a nenhum empregador terceiro em momento algum. O EAD só amplia ainda mais a autorização de trabalho." },
      { track: "score", text: "Manter utilização baixa (abaixo de ~10% do limite) e tudo pago em dia. Um 2º cartão + o financiamento do Kia engrossam o arquivo e aceleram rumo aos 700+ — otimização de velocidade pro mortgage, não necessidade." },
      { track: "carro", text: "Refinanciar o Kia quando o FICO subir (refi de carro é trivial e comum)." },
      { track: "dolar", text: "Regime de cruzeiro: Wise rendendo + cartão pro dia a dia; conta-corrente US como hub de cash (ATMs grátis) abastecida por ACH da Wise sem conversão." },
      { track: "setup", text: "Vida prática estabilizada: plano de saúde ativo, carteira da Flórida e utilities no nome. Ficar de olho em renovações (registro do carro, seguro)." },
    ],
  },
  {
    code: "FL", emoji: "🏁", title: "Aproximação final — Green Card & casa", window: "≈ mês 12–24", dest: true,
    note: "Destino: residência permanente e a casa própria.",
    tasks: [
      { track: "imig", text: "Aprovação do I-485 → Green Card (seu e da Maria). Residência permanente, base para a cidadania lá na frente." },
      { track: "casa", text: "Score maduro + renda documentada → qualificar o mortgage (a linha dos 18 meses) → comprar a casa." },
    ],
  },
];

export default function PlanoRelocacao() {
  const [active, setActive] = useState(new Set(Object.keys(TRACKS)));
  const ctx = { used: new Set() };

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
        Entrar com o <b>O-1A</b> (não afetado pela pausa consular), peticionado pela <b>sua própria LLC</b>, e fazer o
        {" "}<b>I-485</b> por dentro, usando o I-140 NIW já aprovado como base. A Maria entra como dependente e ajusta junto.
        O EB-2 não é abandonado — só pauso a via consular.
      </p>

      <div className="nz-props">
        {PROPS.map((p, i) => (
          <div className="nz-prop" key={p.label}>
            <span className="nz-prop-label"><span className="nz-emoji">{p.emoji}</span>{p.label}</span>
            <span className="nz-prop-value">{withTerms(p.value, ctx, "prop" + i)}</span>
          </div>
        ))}
      </div>

      <div className="nz-callouts">
        {CALLOUTS.map((c, i) => (
          <div className={`nz-callout ${c.tone}`} key={c.title}>
            <span className="nz-callout-emoji">{c.emoji}</span>
            <div>
              <div className="nz-callout-title">{c.title}</div>
              <div className="nz-callout-text">{withTerms(c.text, ctx, "co" + i)}</div>
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
                {leg.note && <p className="nz-leg-note">{withTerms(leg.note, ctx, leg.code + "n")}</p>}
                <ul className="nz-items">
                  {visible.map((t, i) => (
                    <li className="nz-item" key={i}>
                      <span className="nz-bullet" style={{ background: TRACKS[t.track].strong }} />
                      <span className="nz-item-text">
                        <span className="nz-tag" style={{ background: TRACKS[t.track].bg, color: TRACKS[t.track].fg }}>
                          {TRACKS[t.track].label}
                        </span>
                        {withTerms(t.text, ctx, leg.code + "t" + i)}
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
        Termos sublinhados (tracejado) têm explicação — passe o mouse ou toque. Dois prazos mandam no plano: a cadeia do
        titer dos cães (longa, começa já) e a janela EB-2 Current para o I-485. O score e o setup de morador só arrancam na
        chegada, com o SSN. Números de USCIS, regras da CDC e prazos da Flórida mudam — confirme os exatos com a D4U, o
        vet/autoridade, a companhia aérea e o DMV. É um mapa de execução, não aconselhamento jurídico, médico ou tributário.
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
.nz-lead{font-size:15px; color:#5b5a56; max-width:670px; margin:0 0 26px;}
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
.nz-eyebrow{font-size:11.5px; font-weight:600; letter-spacing:.08em; color:var(--faint); text-transform:uppercase; display:flex; align-items:center; gap:8px; flex-wrap:wrap;}
.nz-now-tag{text-transform:none; letter-spacing:0; font-size:11px; font-weight:600; color:#0B6E99; background:#D3E5EF; padding:2px 8px; border-radius:5px;}
.nz-leg-title{font-size:20px; font-weight:600; letter-spacing:-.01em; margin:5px 0 3px; display:flex; align-items:flex-start; gap:9px;}
.nz-emoji-h{font-size:19px;}
.nz-leg-note{font-size:13.5px; color:var(--muted); margin:0 0 13px;}

.nz-items{list-style:none; margin:0; padding:0;}
.nz-item{display:flex; gap:10px; padding:7px 8px 7px 6px; margin-left:-8px; border-radius:6px; transition:background .12s;}
.nz-item:hover{background:var(--hover);}
.nz-bullet{flex:0 0 auto; width:6px; height:6px; border-radius:50%; margin-top:9px;}
.nz-item-text{font-size:14px; color:#2f2e2b; line-height:1.55;}
.nz-tag{display:inline-block; font-size:11.5px; font-weight:500; padding:1px 8px; border-radius:4px; margin-right:8px; vertical-align:1px; white-space:nowrap;}
.nz-crit{display:inline-block; font-size:11px; font-weight:600; color:#B4332B; background:#FBE4E1; padding:1px 8px; border-radius:4px; margin-left:8px; white-space:nowrap;}

/* Termos com tooltip (posicionamento via @floating-ui em portal) */
.term{border-bottom:1px dashed #9B9A97; cursor:help; text-decoration:none; color:inherit; border-radius:1px;}
.term:focus-visible{outline:2px solid #337EA9; outline-offset:2px;}
.term-pop{
  width:max-content; max-width:280px;
  background:#2B2A28; color:#fff; font-size:12.5px; font-weight:400; line-height:1.45; text-align:left;
  text-transform:none; letter-spacing:0; white-space:normal;
  padding:10px 12px; border-radius:9px; box-shadow:0 8px 26px rgba(0,0,0,.22);
  z-index:9999;
}

.nz-foot{font-size:12.5px; color:var(--faint); line-height:1.6; margin-top:30px; padding-top:18px; border-top:1px solid var(--divider);}

@media (max-width:560px){
  .nz{padding:30px 16px 46px;}
  .nz-props{grid-template-columns:1fr;}
  .nz-prop-label{flex-basis:104px;}
  .term-pop{max-width:240px;}
}
@media (prefers-reduced-motion: reduce){
  .nz-tag-btn, .nz-item{transition:none;}
}
`;
