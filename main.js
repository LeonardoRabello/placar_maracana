const API_URL = 'https://placar-maracana-backend.onrender.com';

// Elementos
const hometeamInput = document.getElementById('hometeam');
const homescoreInput = document.getElementById('homescore');
const awayteamInput = document.getElementById('awayteam');
const awayscoreInput = document.getElementById('awayscore');
const imageSelect = document.getElementById('image');
const submitBtn = document.getElementById('submit-btn');
const exportBtn = document.getElementById('export-btn');
const statusDiv = document.getElementById('status');
const displayContent = document.getElementById('display-content');
const homeCount = document.getElementById('home-count');
const awayCount = document.getElementById('away-count');

// Contador de caracteres
hometeamInput.addEventListener('input', () => {
    homeCount.textContent = hometeamInput.value.length;
});

awayteamInput.addEventListener('input', () => {
    awayCount.textContent = awayteamInput.value.length;
});

// Função para mostrar status
function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
}

// Enviar configuração
submitBtn.addEventListener('click', async () => {
    try {
        submitBtn.disabled = true;
        showStatus('Enviando configuração...', 'loading');
        const config = {
            homeTeam: hometeamInput.value.toLowerCase() || 'MANDANTE',
            homeScore: parseInt(homescoreInput.value) || 0,
            awayTeam: awayteamInput.value.toLowerCase() || 'VISITANTE',
            awayScore: parseInt(awayscoreInput.value) || 0,
            image: imageSelect.value
        };

        const response = await fetch(`${API_URL}/config`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            throw new Error('Erro ao enviar configuração');
        }

        const result = await response.json();
        showStatus('Configuração enviada com sucesso!', 'success');

        // Buscar e exibir o display
        await fetchAndDisplayBinary();

    } catch (error) {
        console.error('Erro:', error);
        showStatus('Erro ao enviar configuração: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
    }
});

// Buscar e exibir o binário como imagem
async function fetchAndDisplayBinary() {
    try {
        showStatus('Gerando visualização...', 'loading');

        const response = await fetch(`${API_URL}/display`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar display');
        }

        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);

        // Configurações
        const OUT_W = 256;
        const OUT_H = 64;
        const bytesPerRow = OUT_W / 8; // 32 bytes por linha

        // Criar canvas
        const canvas = document.createElement('canvas');
        canvas.width = OUT_W;
        canvas.height = OUT_H;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.imageRendering = 'pixelated';
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(OUT_W, OUT_H);

        // Decodificar o binário
        let idx = 0;
        for (let yOut = 0; yOut < OUT_H; yOut++) {
            for (let byteIndex = 0; byteIndex < bytesPerRow; byteIndex++) {
                const byte = data[idx];
                idx++;

                for (let bit = 0; bit < 8; bit++) {
                    const xOut = byteIndex * 8 + bit;
                    const pixelIndex = (yOut * OUT_W + xOut) * 4;

                    // LSB-first
                    if (byte & (1 << bit)) {
                        imageData.data[pixelIndex] = 255;     // R
                        imageData.data[pixelIndex + 1] = 255; // G
                        imageData.data[pixelIndex + 2] = 255; // B
                        imageData.data[pixelIndex + 3] = 255; // A
                    } else {
                        imageData.data[pixelIndex] = 0;       // R
                        imageData.data[pixelIndex + 1] = 0;   // G
                        imageData.data[pixelIndex + 2] = 0;   // B
                        imageData.data[pixelIndex + 3] = 255; // A
                    }
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Exibir a imagem
        displayContent.innerHTML = '';
        displayContent.appendChild(canvas);

        showStatus('Display atualizado!', 'success');

    } catch (error) {
        console.error('Erro:', error);
        showStatus('Erro ao atualizar display: ' + error.message, 'error');
    }
}

// Exportar BIN
exportBtn.addEventListener('click', async () => {
    try {
        exportBtn.disabled = true;
        showStatus('Exportando BIN...', 'loading');

        const response = await fetch(`${API_URL}/display`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Erro ao exportar BIN');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `placar_${Date.now()}.bin`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showStatus('BIN exportado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro:', error);
        showStatus('Erro ao exportar BIN: ' + error.message, 'error');
    } finally {
        exportBtn.disabled = false;
    }
});