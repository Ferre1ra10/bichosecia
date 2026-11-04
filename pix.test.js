// node pix.test.js
const assert = require('assert');
const { PIX, crc16, pixPayload } = require('./assets/js/pix.js');

// Exemplo público do manual do BR Code (Banco Central): CRC conhecido = 1D3D
const bcb = '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304';
assert.strictEqual(crc16(bcb), '1D3D');

const p = pixPayload(150.5);
assert.ok(p.includes('5406150.50'), 'valor com 2 casas e tamanho certo');
assert.ok(p.includes('0114' + PIX.key), 'chave no campo 26.01');
assert.strictEqual(crc16(p.slice(0, -4)), p.slice(-4));
assert.ok(PIX.name.length <= 25 && PIX.city.length <= 15, 'limites do padrão');
assert.ok(pixPayload(1234.56).includes('54071234.56'));
console.log('ok', p);
