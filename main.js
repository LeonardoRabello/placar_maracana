// LED Array Configuration
const WIDTH = 256;
const HEIGHT = 32;
const BASE_LED_SIZE = 4;
const BASE_PADDING = 1;

// State
let ledArray = new Uint8Array(WIDTH * HEIGHT);
let zoomLevel = 1.0;
let isDrawing = false;
let drawMode = 1; // 1 = turn on, 0 = turn off

// Touch/pinch zoom state
let lastTouchDistance = 0;
let isPinching = false;

// Canvas setup
const canvas = document.getElementById('ledCanvas');
const ctx = canvas.getContext('2d');

// Colors
const BG_COLOR = '#000000';
const LED_OFF_COLOR = '#333333';
const LED_ON_COLOR = '#FFFFFF';

// Initialize
function init() {
    updateCanvasSize();
    drawAllLEDs();
    setupEventListeners();
}

function getLEDSize() {
    return BASE_LED_SIZE * zoomLevel;
}

function getPadding() {
    return BASE_PADDING * zoomLevel;
}

function getCellSize() {
    return getLEDSize() + getPadding();
}

function updateCanvasSize() {
    const cellSize = getCellSize();
    canvas.width = WIDTH * cellSize;
    canvas.height = HEIGHT * cellSize;
}

function drawAllLEDs() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const ledSize = getLEDSize();
    const cellSize = getCellSize();
    
    for (let row = 0; row < HEIGHT; row++) {
        for (let col = 0; col < WIDTH; col++) {
            const idx = row * WIDTH + col;
            const x = col * cellSize;
            const y = row * cellSize;
            
            ctx.fillStyle = ledArray[idx] ? LED_ON_COLOR : LED_OFF_COLOR;
            ctx.beginPath();
            ctx.arc(x + ledSize/2, y + ledSize/2, ledSize/2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    updateStatus();
}

function drawLED(row, col) {
    const idx = row * WIDTH + col;
    const ledSize = getLEDSize();
    const cellSize = getCellSize();
    const x = col * cellSize;
    const y = row * cellSize;
    
    ctx.fillStyle = ledArray[idx] ? LED_ON_COLOR : LED_OFF_COLOR;
    ctx.beginPath();
    ctx.arc(x + ledSize/2, y + ledSize/2, ledSize/2, 0, Math.PI * 2);
    ctx.fill();
}

function getLEDFromCoords(x, y) {
    const cellSize = getCellSize();
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    
    if (row >= 0 && row < HEIGHT && col >= 0 && col < WIDTH) {
        return { row, col };
    }
    return null;
}

function getTouchDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function setZoom(newZoom) {
    const oldZoom = zoomLevel;
    zoomLevel = Math.max(0.5, Math.min(8.0, newZoom));
    
    if (oldZoom !== zoomLevel) {
        updateCanvasSize();
        drawAllLEDs();
    }
}

function setupEventListeners() {
    // Mouse events for drawing
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + canvas.parentElement.scrollLeft;
        const y = e.clientY - rect.top + canvas.parentElement.scrollTop;
        const led = getLEDFromCoords(x, y);
        
        if (led) {
            isDrawing = true;
            const idx = led.row * WIDTH + led.col;
            drawMode = ledArray[idx] ? 0 : 1;
            ledArray[idx] = drawMode;
            drawLED(led.row, led.col);
            updateStatus();
        }
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left + canvas.parentElement.scrollLeft;
            const y = e.clientY - rect.top + canvas.parentElement.scrollTop;
            const led = getLEDFromCoords(x, y);
            
            if (led) {
                const idx = led.row * WIDTH + led.col;
                ledArray[idx] = drawMode;
                drawLED(led.row, led.col);
                updateStatus();
            }
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });
    
    // Mouse wheel zoom
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(zoomLevel + delta);
    }, { passive: false });
    
    // Touch events for drawing
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            // Single touch - drawing
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left + canvas.parentElement.scrollLeft;
            const y = touch.clientY - rect.top + canvas.parentElement.scrollTop;
            const led = getLEDFromCoords(x, y);
            
            if (led) {
                isDrawing = true;
                const idx = led.row * WIDTH + led.col;
                drawMode = ledArray[idx] ? 0 : 1;
                ledArray[idx] = drawMode;
                drawLED(led.row, led.col);
                updateStatus();
            }
        } else if (e.touches.length === 2) {
            // Two touches - pinch zoom
            isPinching = true;
            isDrawing = false;
            lastTouchDistance = getTouchDistance(e.touches[0], e.touches[1]);
        }
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        if (e.touches.length === 1 && isDrawing && !isPinching) {
            // Single touch - drawing
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left + canvas.parentElement.scrollLeft;
            const y = touch.clientY - rect.top + canvas.parentElement.scrollTop;
            const led = getLEDFromCoords(x, y);
            
            if (led) {
                const idx = led.row * WIDTH + led.col;
                ledArray[idx] = drawMode;
                drawLED(led.row, led.col);
                updateStatus();
            }
        } else if (e.touches.length === 2 && isPinching) {
            // Two touches - pinch zoom
            const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
            const delta = (currentDistance - lastTouchDistance) * 0.01;
            setZoom(zoomLevel + delta);
            lastTouchDistance = currentDistance;
        }
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            isPinching = false;
        }
        if (e.touches.length === 0) {
            isDrawing = false;
        }
    });
    
    // File input listener
    document.getElementById('fileInput').addEventListener('change', handleFileLoad);
}

function updateStatus() {
    let count = 0;
    for (let i = 0; i < ledArray.length; i++) {
        if (ledArray[i]) count++;
    }
    const total = WIDTH * HEIGHT;
    const zoomPercent = Math.round(zoomLevel * 100);
    document.getElementById('status').textContent = 
        `LEDs on: ${count} / ${total} | Zoom: ${zoomPercent}%`;
}

// Control functions
function clearAll() {
    ledArray.fill(0);
    drawAllLEDs();
}

function fillAll() {
    ledArray.fill(1);
    drawAllLEDs();
}

function zoomIn() {
    setZoom(zoomLevel + 0.5);
}

function zoomOut() {
    setZoom(zoomLevel - 0.5);
}

function zoomReset() {
    setZoom(1.0);
}

function savePattern() {
    // Pack bits into bytes for efficient storage
    const bytes = new Uint8Array(Math.ceil(ledArray.length / 8));
    for (let i = 0; i < ledArray.length; i++) {
        if (ledArray[i]) {
            bytes[Math.floor(i / 8)] |= (1 << (i % 8));
        }
    }
    
    const data = {
        width: WIDTH,
        height: HEIGHT,
        data: btoa(String.fromCharCode(...bytes))
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `led_pattern_${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

function loadPattern() {
    document.getElementById('fileInput').click();
}

function handleFileLoad(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (data.width !== WIDTH || data.height !== HEIGHT) {
                alert(`Size mismatch! Expected ${WIDTH}x${HEIGHT}, got ${data.width}x${data.height}`);
                return;
            }
            
            // Decode base64 and unpack bits
            const binaryString = atob(data.data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Unpack bits
            ledArray.fill(0);
            for (let i = 0; i < ledArray.length; i++) {
                const byteIdx = Math.floor(i / 8);
                const bitIdx = i % 8;
                if (bytes[byteIdx] & (1 << bitIdx)) {
                    ledArray[i] = 1;
                }
            }
            
            drawAllLEDs();
            alert('Pattern loaded successfully!');
        } catch (err) {
            alert('Failed to load pattern: ' + err.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
}

// Initialize on load
init();