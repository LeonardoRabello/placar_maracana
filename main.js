// Constantes
const CHAR_SPACING = 1; // Espaçamento entre caracteres em pixels
const DISPLAY_WIDTH = 256; // Largura do display
const DISPLAY_HEIGHT = 32; // Altura do display
const SCORE_MARGIN = 10; // Margem do placar em relação ao final do display
const CLOCK_X = 10; // Posição X do relógio
const CLOCK_Y = 12; // Posição Y do relógio

// Cache para os JSONs carregados
const charCache = {};
const FORBIDDEN_CHARS = ['W', 'Y', 'K'];
let maracanaData = null;
let lastClockTime = '';

// Criar grid de pixels
const display = document.getElementById('display');
const pixels = [];

for (let i = 0; i < 32 * 256; i++) {
    const pixel = document.createElement('div');
    pixel.className = 'pixel';
    display.appendChild(pixel);
    pixels.push(pixel);
}

// Função para carregar logo do Maracanã
async function loadMaracana() {
    try {
        const response = await fetch('assets/bitfiles/maracana.json');
        if (!response.ok) {
            console.warn('Maracanã logo não encontrado');
            return null;
        }
        const data = await response.json();

        maracanaData = data.bitlines;
        return maracanaData;
    } catch (error) {
        console.error('Erro ao carregar Maracanã:', error);
        return null;
    }
}

async function loadImage(image_name) {
    try {
        const response = await fetch(`./assets/bitfiles/${image_name}.json`);
        if (!response.ok) {
            console.warn('Imagem não encontrada');
            return null;
        }
        const data = await response.json();
        imageData = data.bitlines;
        return imageData;
    } catch (error) {
        console.error('Erro ao carregar imagem:', error);
        return null;
    }
}

// Função para carregar JSON de caractere
async function loadChar(char) {
    if (charCache[char]) {
        return charCache[char];
    }

    try {
        // Mapear ':' para 'dois-pontos.json'
        let filename = char;
        if (char === ':') {
            filename = 'dois-pontos';
        }

        const response = await fetch(`assets/bitfiles/${filename}.json`);
        if (!response.ok) {
            console.warn(`Caractere ${char} não encontrado`);
            return null;
        }
        const data = await response.json();
        charCache[char] = data.bitlines;
        return data.bitlines;
    } catch (error) {
        console.error(`Erro ao carregar ${char}:`, error);
        return null;
    }
}

// Função para validar input
function validateInput(text) {
    const invalid = [];
    for (let char of text.toUpperCase()) {
        if (FORBIDDEN_CHARS.includes(char)) {
            invalid.push(char);
        }
    }
    return invalid;
}

// Função para limpar display
function clearDisplay() {
    pixels.forEach(pixel => pixel.classList.remove('on'));
}

// Função para limpar área específica do display
function clearArea(startX, startY, width, height) {
    for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
            const pixelIndex = y * 256 + x;
            if (pixelIndex < pixels.length) {
                pixels[pixelIndex].classList.remove('on');
            }
        }
    }
}

// Função para desenhar imagem no display (35x20)
function drawImage(bitlines, startX, startY) {
    if (!bitlines) return;

    for (let y = 0; y < bitlines.length; y++) {
        const line = bitlines[y];
        for (let x = 0; x < line.length; x++) {
            if (line[x] === '1') {
                const pixelIndex = (startY + y) * 256 + (startX + x);
                if (pixelIndex < pixels.length) {
                    pixels[pixelIndex].classList.add('on');
                }
            }
        }
    }
}

// Função para desenhar caractere no display
function drawChar(bitlines, startX, startY) {
    if (!bitlines) return 7; // Retorna largura padrão se não houver dados

    for (let y = 0; y < bitlines.length && y < 7; y++) {
        const line = bitlines[y];
        for (let x = 0; x < line.length && x < 7; x++) {
            if (line[x] === '1') {
                const pixelIndex = (startY + y) * 256 + (startX + x);
                if (pixelIndex < pixels.length) {
                    pixels[pixelIndex].classList.add('on');
                }
            }
        }
    }
    return 7; // Largura do caractere
}

// Função para renderizar texto no display
async function renderText(text, startX, startY) {
    let currentX = startX;

    for (let char of text.toUpperCase()) {
        const bitlines = await loadChar(char);
        const charWidth = drawChar(bitlines, currentX, startY);
        currentX += charWidth + CHAR_SPACING; // +1 para espaçamento entre caracteres
    }
}

// Função para obter hora atual formatada
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Função para atualizar apenas o relógio
async function updateClock() {
    const currentTime = getCurrentTime();
    
    // Só atualiza se o tempo mudou
    if (currentTime !== lastClockTime) {
        // Limpar apenas a área do relógio (8 caracteres * 8 pixels = 64 pixels de largura, 7 de altura)
        clearArea(CLOCK_X, CLOCK_Y, 72, 7);
        
        // Desenhar novo relógio
        await renderText(currentTime, CLOCK_X, CLOCK_Y);
        
        lastClockTime = currentTime;
    }
}

// Função para atualizar display completo
async function updateDisplay() {
    clearDisplay();

    // Desenhar relógio
    const currentTime = getCurrentTime();
    await renderText(currentTime, CLOCK_X, CLOCK_Y);
    lastClockTime = currentTime;

    // Desenhar logo do Maracanã
    if (maracanaData) {
        drawImage(maracanaData, 70, 6);
    }
    // const govrj = await loadImage('suderj')
    // drawImage(govrj, 13, 0)

    const homeTeam = document.getElementById('hometeam').value;
    const awayTeam = document.getElementById('awayteam').value;
    const homeScore = document.getElementById('homescore').value;
    const awayScore = document.getElementById('awayscore').value;

    // Renderizar time mandante na linha 5
    if (homeTeam) {
        await renderText(homeTeam, 175, 5);
        const homeLogo = await loadImage(homeTeam)
        if (homeLogo) {
            //drawImage(homeLogo, 120, 5)
        }
    }

    // Renderizar placar mandante (fixo a 10 pixels do final do display)
    if (homeScore !== '') {
        const scoreX = DISPLAY_WIDTH - SCORE_MARGIN;
        await renderText(homeScore.toString(), scoreX, 5);
    }

    // Renderizar time visitante na linha 20
    if (awayTeam) {
        await renderText(awayTeam, 175, 20);
        const awayLogo = await loadImage(awayTeam)
        if (awayLogo) {
            //drawImage(awayLogo, 120, 20 )
        }
    }

    // Renderizar placar visitante (fixo a 10 pixels do final do display)
    if (awayScore !== '') {
        const scoreX = DISPLAY_WIDTH - SCORE_MARGIN;
        await renderText(awayScore.toString(), scoreX, 20);
    }
}

// enviarbinparaobackend
async function gerarEBinEEnviarParaBackend() {
  const IN_W = 256;
  const IN_H = 32;

  const OUT_W = 128;
  const OUT_H = 64;

  const bytesPerRow = OUT_W / 8; // 16
  const totalBytes = OUT_H * bytesPerRow; // 1024 bytes
  const buffer = new Uint8Array(totalBytes);

  function inPixel(x, y) {
    if (x < 0 || x >= DISPLAY_WIDTH || y < 0 || y >= DISPLAY_HEIGHT) return false;
    const idx = y * DISPLAY_WIDTH + x;
    return pixels[idx].classList.contains('on');
  }

  let i = 0;
  for (let yOut = 0; yOut < OUT_H; yOut++) {
    for (let byteIndex = 0; byteIndex < bytesPerRow; byteIndex++) {
      let byte = 0;

      for (let bit = 0; bit < 8; bit++) {
        const xOut = byteIndex * 8 + bit;

        let xIn, yIn;
        if (yOut < 32) {
          xIn = xOut;
          yIn = yOut;
        } else {
          xIn = xOut + 128;
          yIn = yOut - 32;
        }

        if (inPixel(xIn, yIn)) {
          byte |= (1 << bit); // LSB-first (XBM)
        }
      }

      buffer[i++] = byte;
    }
  }

  // ===== ENVIO PARA BACKEND =====
  const blob = new Blob([buffer], {
    type: 'application/octet-stream'
  });

  const formData = new FormData();
  formData.append('file', blob, 'display.bin');

  const response = await fetch(
    'https://placar-maracana-backend.onrender.com/upload',
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao enviar o .bin para o backend');
  }

  const result = await response.json();
  return result;
}

// Event listeners para inputs de texto
document.getElementById('hometeam').addEventListener('input', function(e) {
    const value = e.target.value.toUpperCase();
    const invalid = validateInput(value);

    document.getElementById('home-count').textContent = value.length;

    if (invalid.length > 0) {
        document.getElementById('home-error').textContent = 
            `Caracteres não permitidos: ${invalid.join(', ')}`;
        e.target.value = value.split('').filter(c => !FORBIDDEN_CHARS.includes(c)).join('');
    } else {
        document.getElementById('home-error').textContent = '';
    }

    updateDisplay();
});

document.getElementById('awayteam').addEventListener('input', function(e) {
    const value = e.target.value.toUpperCase();
    const invalid = validateInput(value);

    document.getElementById('away-count').textContent = value.length;

    if (invalid.length > 0) {
        document.getElementById('away-error').textContent = 
            `Caracteres não permitidos: ${invalid.join(', ')}`;
        e.target.value = value.split('').filter(c => !FORBIDDEN_CHARS.includes(c)).join('');
    } else {
        document.getElementById('away-error').textContent = '';
    }

    updateDisplay();
});

// Event listeners para inputs de placar
document.getElementById('homescore').addEventListener('input', function(e) {
    if (e.target.value < 0) e.target.value = 0;
    if (e.target.value > 9) e.target.value = 9;
    updateDisplay();
});

document.getElementById('awayscore').addEventListener('input', function(e) {
    if (e.target.value < 0) e.target.value = 0;
    if (e.target.value > 9) e.target.value = 9;
    updateDisplay();
});

// Event listener para botão de exportar
document.getElementById('export-btn').addEventListener('click', gerarEBinEEnviarParaBackend);

// Inicializar
(async function init() {
    await loadMaracana();
    clearDisplay();
    updateDisplay();

    // Atualizar display a cada segundo para o relógio
    setInterval(updateClock, 1000);
    setInterval(gerarEBinEEnviarParaBackend, 1000);
})();