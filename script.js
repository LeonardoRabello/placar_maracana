function updatePlacar() {
    time_1 = document.getElementById("time-1-label").value;

    time_2 = document.getElementById("time-2-label").value;
    
    score_1 = document.getElementById("score-1-label").value;

    score_2 = document.getElementById("score-2-label").value;

    const displayLeft = document.getElementById("display-left");
    const displayRight = document.getElementById("display-right");

    const dCtxLeft = displayLeft.getContext("2d");
    const dCtxRight = displayRight.getContext("2d");

    dCtxLeft.clearRect(0, 0, displayLeft.width, displayLeft.height);
    dCtxRight.clearRect(0, 0, displayRight.width, displayRight.height);

    dCtxLeft.drawImage(canvasLeft, 0, 0);
    dCtxRight.drawImage(canvasRight, 0, 0);
}

/* ========= EDITOR DE PIXEL ========= */

function enablePixelDraw(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const pixels = Array.from({ length: HEIGHT }, () =>
        Array(WIDTH).fill(0)
    );

    let desenhando = false;
    let modo = "draw";
    let lastPos = null;

    function getPos(event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: Math.floor((event.clientX - rect.left) * scaleX),
            y: Math.floor((event.clientY - rect.top) * scaleY)
        };
    }

    function setPixel(x, y, value) {
        if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
        pixels[y][x] = value;
    }

    function drawLine(x0, y0, x1, y1, value) {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = x0 < x1 ? 1 : -1;
        let sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            setPixel(x0, y0, value);
            if (x0 === x1 && y0 === y1) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
    }

    function render() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "yellow";

        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                if (pixels[y][x]) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }

    canvas.addEventListener("mousedown", (e) => {
        desenhando = true;
        const pos = getPos(e);
        modo = pixels[pos.y][pos.x] ? "erase" : "draw";
        setPixel(pos.x, pos.y, modo === "draw");
        lastPos = pos;
        render();
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!desenhando) return;
        const pos = getPos(e);
        drawLine(lastPos.x, lastPos.y, pos.x, pos.y, modo === "draw");
        lastPos = pos;
        render();
    });

    canvas.addEventListener("mouseup", () => {
        desenhando = false;
        lastPos = null;
    });

    canvas.addEventListener("mouseleave", () => {
        desenhando = false;
        lastPos = null;
    });

    render();

    // 🔴 IMPORTANTE:
    // retornamos o canvas para usar depois no botão
    return canvas;
}

/* ========= INICIALIZA ========= */

const canvasLeft = enablePixelDraw("canvas-left");
const canvasRight = enablePixelDraw("canvas-right");
