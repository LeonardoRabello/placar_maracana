function updatePlacar() {
    time_1 = document.getElementById("time-1-label").value;

    time_2 = document.getElementById("time-2-label").value;
    
    score_1 = document.getElementById("score-1-label").value;

    score_2 = document.getElementById("score-2-label").value;
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.beginPath();
ctx.rect(0, 0, 1, 32);
ctx.fillStyle = "red";
ctx.fill();
ctx.closePath();

ctx.beginPath();
ctx.rect(119, 0, 119, 32);
ctx.fillStyle = "red";
ctx.fill();
ctx.closePath();
