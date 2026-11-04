# Bichos & Cia | Clínica Veterinária

Landing page da Clínica Veterinária Bichos & Cia, em Valparaíso de Goiás (GO).

## O que tem na página

- Serviços com link para o WhatsApp já com a mensagem certa
- Abas de castração, exames de imagem, exames laboratoriais e cirurgias
- Formulário de agendamento de castração que abre o WhatsApp
- Gerador de QR Code Pix com valor escolhido, Pix copia e cola e download da imagem
- Avaliação no Google, Instagram, mapa, rota, telefone e e-mail
- Layout para computador e celular, com animações que respeitam a preferência de movimento reduzido

## Como rodar

O site é HTML, CSS e JavaScript puros, sem instalação nem etapa de build.

```bash
python -m http.server 4173
```

Depois abra http://localhost:4173.

## Teste do Pix

```bash
node pix.test.js
```

## Estrutura

| Caminho | Conteúdo |
| --- | --- |
| `index.html` | Conteúdo da página |
| `assets/css/style.css` | Estilos |
| `assets/js/main.js` | Interações da página |
| `assets/js/pix.js` | Geração do código Pix (chave, nome e cidade ficam na constante `PIX`) |
| `assets/js/qrcode.js` | Biblioteca qrcode-generator |
| `assets/img/` | Logo e fotos |

## Publicação

O site é servido pelo GitHub Pages a partir da raiz da branch `main`. Cada push nessa branch atualiza o site.
