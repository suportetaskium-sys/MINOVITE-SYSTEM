import { addBusinessDays } from './holidays.js';

export const ORIGIN = Object.freeze({
  cep: '04948-970',
  uf: 'SP',
  label: 'São Paulo/SP'
});

const REGION_BY_UF = {
  AC: 'Norte', AL: 'Nordeste', AP: 'Norte', AM: 'Norte', BA: 'Nordeste', CE: 'Nordeste',
  DF: 'Centro-Oeste', ES: 'Sudeste', GO: 'Centro-Oeste', MA: 'Nordeste', MT: 'Centro-Oeste',
  MS: 'Centro-Oeste', MG: 'Sudeste', PA: 'Norte', PB: 'Nordeste', PR: 'Sul', PE: 'Nordeste',
  PI: 'Nordeste', RJ: 'Sudeste', RN: 'Nordeste', RS: 'Sul', RO: 'Norte', RR: 'Norte',
  SC: 'Sul', SP: 'Sudeste', SE: 'Nordeste', TO: 'Norte'
};

const CAPITAL_BY_UF = {
  AC: 'rio branco', AL: 'maceio', AP: 'macapa', AM: 'manaus', BA: 'salvador', CE: 'fortaleza',
  DF: 'brasilia', ES: 'vitoria', GO: 'goiania', MA: 'sao luis', MT: 'cuiaba', MS: 'campo grande',
  MG: 'belo horizonte', PA: 'belem', PB: 'joao pessoa', PR: 'curitiba', PE: 'recife', PI: 'teresina',
  RJ: 'rio de janeiro', RN: 'natal', RS: 'porto alegre', RO: 'porto velho', RR: 'boa vista',
  SC: 'florianopolis', SP: 'sao paulo', SE: 'aracaju', TO: 'palmas'
};

const BASE_RANGES = {
  'SP-capital': [2, 4],
  'SP-interior': [3, 6],
  'Sudeste-capital': [3, 5],
  'Sudeste-interior': [4, 7],
  'Sul-capital': [4, 6],
  'Sul-interior': [5, 8],
  'Centro-Oeste-capital': [5, 7],
  'Centro-Oeste-interior': [6, 9],
  'Nordeste-capital': [6, 9],
  'Nordeste-interior': [7, 11],
  'Norte-capital': [8, 12],
  'Norte-interior': [9, 14]
};

const STATE_EXTRA = {
  MS: 1, MT: 1,
  AL: 1, CE: 1, PB: 1, PE: 1, RN: 1, SE: 1,
  MA: 2, PI: 2, PA: 2, TO: 2,
  RO: 3, AC: 3, AM: 3, AP: 3, RR: 3
};

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function ensureIsoDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return value;
  return new Date().toISOString().slice(0, 10);
}

export function estimateDelivery({ uf, city, orderDate }) {
  const state = String(uf || '').toUpperCase();
  const region = REGION_BY_UF[state];
  if (!region) throw new Error('UF inválida para cálculo de prazo.');

  const isCapital = normalizeText(city) === CAPITAL_BY_UF[state];
  const locationType = isCapital ? 'capital' : 'interior';
  const key = state === 'SP' ? `SP-${locationType}` : `${region}-${locationType}`;
  const base = BASE_RANGES[key];
  const extra = STATE_EXTRA[state] || 0;

  const minBusinessDays = base[0] + extra;
  const maxBusinessDays = base[1] + extra;
  const postingBusinessDays = 1;
  const referenceDate = ensureIsoDate(orderDate);

  const earliestDate = addBusinessDays(referenceDate, postingBusinessDays + minBusinessDays);
  const latestDate = addBusinessDays(referenceDate, postingBusinessDays + maxBusinessDays);

  return {
    origin: ORIGIN,
    region,
    locationType,
    postingBusinessDays,
    minBusinessDays,
    maxBusinessDays,
    earliestDate,
    latestDate,
    disclaimer: 'Estimativa interna baseada em faixa regional e dias úteis; não representa prazo oficial nem garantia dos Correios.'
  };
}
