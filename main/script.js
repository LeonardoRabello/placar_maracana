function updatePlacar() {
    document.getElementById("time-1").innerText = document.getElementById("time-1-label").value;

    document.getElementById("time-2").innerText = document.getElementById("time-2-label").value;
    
    document.getElementById("score-1").innerText = document.getElementById("score-1-label").value;

    document.getElementById("score-2").innerText = document.getElementById("score-2-label").value;
}


class LEDArray {
    constructor(options = {}) {
        this.width = options.width || 256;
        this.height = options.height || 32;
        this.ledSize = options.ledSize || 4;
        this.padding = options.padding || 1;
        
        this.bgColor = options.bgColor || '#000000';
        this.ledOffColor = options.ledOffColor || '#555555';
        this.ledOnColor = options.ledOnColor || '#ffff00';
        
        this.ledArray = new Uint8Array(this.width * this.height);
        this.isDrawing = false;
        this.drawMode = 1;
        
        this.createElements(options.containerId);
        this.updateCanvasSize();
        this.drawAllLEDs();
        this.setupEventListeners();
    }

    createElements(containerId) {
        const container = containerId ? document.getElementById(containerId) : document.body;
        
        this.wrapper = document.createElement('div');
        this.wrapper.style.cssText = 'display: inline-block; position: relative;';
        
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.cssText = 'display: block; cursor: crosshair; border: 1px solid #666;';
        
        this.wrapper.appendChild(this.canvas);
        container.appendChild(this.wrapper);
    }
    
    getCellSize() {
        return this.ledSize + this.padding;
    }
    
    updateCanvasSize() {
        const cellSize = this.getCellSize();
        this.canvas.width = this.width * cellSize;
        this.canvas.height = this.height * cellSize;
    }
    
    drawAllLEDs() {
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const cellSize = this.getCellSize();
        
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const idx = row * this.width + col;
                const x = col * cellSize;
                const y = row * cellSize;
                
                this.ctx.fillStyle = this.ledArray[idx] ? this.ledOnColor : this.ledOffColor;
                this.ctx.beginPath();
                this.ctx.arc(x + this.ledSize/2, y + this.ledSize/2, this.ledSize/2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    drawLED(row, col) {
        const idx = row * this.width + col;
        const cellSize = this.getCellSize();
        const x = col * cellSize;
        const y = row * cellSize;
        
        this.ctx.fillStyle = this.ledArray[idx] ? this.ledOnColor : this.ledOffColor;
        this.ctx.beginPath();
        this.ctx.arc(x + this.ledSize/2, y + this.ledSize/2, this.ledSize/2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    getLEDFromCoords(x, y) {
        const cellSize = this.getCellSize();
        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);
        
        if (row >= 0 && row < this.height && col >= 0 && col < this.width) {
            return { row, col };
        }
        return null;
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const led = this.getLEDFromCoords(x, y);
            
            if (led) {
                this.isDrawing = true;
                const idx = led.row * this.width + led.col;
                this.drawMode = this.ledArray[idx] ? 0 : 1;
                this.ledArray[idx] = this.drawMode;
                this.drawLED(led.row, led.col);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const led = this.getLEDFromCoords(x, y);
                
                if (led) {
                    const idx = led.row * this.width + led.col;
                    this.ledArray[idx] = this.drawMode;
                    this.drawLED(led.row, led.col);
                }
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDrawing = false;
        });
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            const led = this.getLEDFromCoords(x, y);
            
            if (led) {
                this.isDrawing = true;
                const idx = led.row * this.width + led.col;
                this.drawMode = this.ledArray[idx] ? 0 : 1;
                this.ledArray[idx] = this.drawMode;
                this.drawLED(led.row, led.col);
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (this.isDrawing) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                const led = this.getLEDFromCoords(x, y);
                
                if (led) {
                    const idx = led.row * this.width + led.col;
                    this.ledArray[idx] = this.drawMode;
                    this.drawLED(led.row, led.col);
                }
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', () => {
            this.isDrawing = false;
        });
    }
    
    // Métodos públicos
    exportArray() {
        return Array.from(this.ledArray);
    }
    
    exportJSON(pretty = true) {
        const data = {
            width: this.width,
            height: this.height,
            data: Array.from(this.ledArray)
        };
        return JSON.stringify(data, null, pretty ? 2 : 0);
    }
    
    importArray(array) {
        if (!Array.isArray(array)) {
            console.error('Input deve ser um array');
            return false;
        }
        
        if (array.length !== this.width * this.height) {
            console.error(`Tamanho incorreto. Esperado ${this.width * this.height}, recebido ${array.length}`);
            return false;
        }
        
        for (let i = 0; i < array.length; i++) {
            this.ledArray[i] = array[i] ? 1 : 0;
        }
        
        this.drawAllLEDs();
        return true;
    }
    
    clear() {
        this.ledArray.fill(0);
        this.drawAllLEDs();
    }
    
    fill() {
        this.ledArray.fill(1);
        this.drawAllLEDs();
    }
    
    getInfo() {
        let count = 0;
        for (let i = 0; i < this.ledArray.length; i++) {
            if (this.ledArray[i]) count++;
        }
        
        return {
            width: this.width,
            height: this.height,
            total: this.width * this.height,
            ledsOn: count,
            ledsOff: this.width * this.height - count
        };
    }
}