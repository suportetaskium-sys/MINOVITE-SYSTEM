import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateDelivery, ORIGIN } from './server/shipping.js';
import { addBusinessDays } from './server/holidays.js';

test('origem permanece fixa no CEP informado', () => {
  assert.equal(ORIGIN.cep, '04948-970');
  assert.equal(ORIGIN.uf, 'SP');
});

test('São Paulo capital usa faixa mais curta', () => {
  const estimate = estimateDelivery({ uf: 'SP', city: 'São Paulo', orderDate: '2026-08-11' });
  assert.equal(estimate.locationType, 'capital');
  assert.equal(estimate.minBusinessDays, 2);
  assert.equal(estimate.maxBusinessDays, 4);
});

test('Recife recebe ajuste Nordeste e identifica capital', () => {
  const estimate = estimateDelivery({ uf: 'PE', city: 'Recife', orderDate: '2026-08-11' });
  assert.equal(estimate.region, 'Nordeste');
  assert.equal(estimate.locationType, 'capital');
  assert.equal(estimate.minBusinessDays, 7);
  assert.equal(estimate.maxBusinessDays, 10);
});

test('dias úteis ignoram finais de semana', () => {
  assert.equal(addBusinessDays('2026-08-14', 1), '2026-08-17');
});

test('UF inválida é rejeitada', () => {
  assert.throws(() => estimateDelivery({ uf: 'XX', city: 'Teste', orderDate: '2026-08-11' }));
});
