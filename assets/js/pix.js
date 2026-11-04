// Pix "BR Code" estático (padrão EMV do Banco Central), com valor.
// A chave é celular: 61995045476 não passa no dígito verificador de CPF,
// e chave de celular vai no formato +55DDDNUMERO.
const PIX = { key: '+5561995045476', name: 'BICHOS E CIA', city: 'VALPARAISO' };

const tlv = (id, value) => id + String(value.length).padStart(2, '0') + value;

function crc16(text) { // CRC16-CCITT-FALSE, exigido pelo campo 63
  let crc = 0xffff;
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function pixPayload(amount, pix = PIX) {
  const body =
    tlv('00', '01') +
    tlv('26', tlv('00', 'br.gov.bcb.pix') + tlv('01', pix.key)) +
    tlv('52', '0000') +
    tlv('53', '986') +
    (amount ? tlv('54', amount.toFixed(2)) : '') +
    tlv('58', 'BR') +
    tlv('59', pix.name) +
    tlv('60', pix.city) +
    tlv('62', tlv('05', '***')) +
    '6304';
  return body + crc16(body);
}

if (typeof module !== 'undefined') module.exports = { PIX, crc16, tlv, pixPayload };
