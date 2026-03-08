const socket = io();
let score = 100;
let currentIndex = 0;
let isRobotMode = false;
let timer;
let currentQuestion = null;

// 1. 怪兽数据库：确保名字、ID、图片严格对应
const monsterData = {
    3:  { name: "Tauros", img: "monster_1.png" },
    5:  { name: "Aerodactyl", img: "monster_2.png" },
    7:  { name: "Beedrill", img: "monster_3.png" },
    8:  { name: "Dragonite", img: "monster_4.png" },
    11: { name: "Venusaur", img: "monster_5.png" }
};

// 地图格子定义
const board = [
    { r: 5, c: 1, type: "START" }, { r: 5, c: 2, type: "GRASS" }, { r: 5, c: 3, type: "WILD", id: 3 },
    { r: 5, c: 4, type: "GRASS" }, { r: 5, c: 5, type: "WILD", id: 5 }, { r: 5, c: 6, type: "GRASS" },
    { r: 5, c: 7, type: "WILD", id: 7 }, { r: 5, c: 8, type: "WILD", id: 8 }, { r: 4, c: 8, type: "GRASS" },
    { r: 3, c: 8, type: "GRASS" }, { r: 2, c: 8, type: "GRASS" }, { r: 1, c: 8, type: "WILD", id: 11 }
];

// 2. 无限随机题库生成器
function generateQuestion() {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b;
    if (op === '*') {
        a = Math.floor(Math.random() * 10) + 2;
        b = Math.floor(Math.random() * 10) + 2;
    } else {
        a = Math.floor(Math.random() * 90) + 10;
        b = Math.floor(Math.random() * 90) + 10;
    }
    return { q: `${a} ${op} ${b} = ?`, a: eval(`${a}${op}${b}`).toString() };
}

// 3. 10秒计时器逻辑
function startTimer(callback) {
    let sec = 10;
    document.getElementById('countdown').innerText = sec;
    clearInterval(timer);
    timer = setInterval(() => {
        sec--;
        document.getElementById('countdown').innerText = sec;
        if (sec <= 0) {
            clearInterval(timer);
            callback(true); // 判定为超时
        }
    }, 1000);
}

function updateUI() {
    const tile = board[currentIndex];
    const pb = document.getElementById('player-box');
    pb.style.gridColumn = tile.c;
    pb.style.gridRow = tile.r;
    document.getElementById('score').innerText = score;

    // 破产判定
    if (score <= 0) {
        alert("GAME OVER! Your score reached 0. You lost the race.");
        location.reload();
    }
}

// 掷骰子逻辑
document.getElementById('roll-btn').onclick = async () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    document.getElementById('dice-result').innerText = ['⚀','⚁','⚂','⚃','⚄','⚅'][roll-1];
    
    for(let i=0; i<roll; i++) {
        currentIndex = (currentIndex + 1) % board.length;
        updateUI();
        socket.emit('move', { index: currentIndex }); // 同步位置到多人
        await new Promise(r => setTimeout(r, 200));
    }

    const tile = board[currentIndex];
    if (tile.type === "WILD") {
        currentQuestion = generateQuestion();
        openModal(tile);
    }
};

function openModal(tile) {
    const monster = monsterData[tile.id];
    document.getElementById('modal-text').innerText = `TIME LIMIT 10s!\nCatch ${monster.name}?\n${currentQuestion.q}`;
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-input').value = "";
    document.getElementById('modal-input').focus();

    startTimer((isTimeout) => {
        if (isTimeout) {
            score -= 20;
            document.getElementById('modal-overlay').style.display = 'none';
            alert("TIME OUT! Monster escaped and you lost 20 pts.");
            updateUI();
        }
    });
}

document.getElementById('modal-submit').onclick = () => {
    clearInterval(timer);
    const userAns = document.getElementById('modal-input').value;
    document.getElementById('modal-overlay').style.display = 'none';

    if (userAns === currentQuestion.a) {
        score += 20;
        alert("CORRECT! You captured it!");
    } else {
        score -= 20;
        alert(`WRONG! Answer was ${currentQuestion.a}. You lost 20 pts.`);
    }
    updateUI();
};

// 机器人逻辑
document.getElementById('robot-toggle').onclick = () => {
    isRobotMode = !isRobotMode;
    document.getElementById('robot-toggle').innerText = isRobotMode ? "VS ROBOT: ON" : "VS ROBOT: OFF";
    const opp = document.getElementById('opponent');
    opp.style.display = isRobotMode ? 'block' : 'none';
};

// 处理多人对战位置更新
socket.on('update_opponent', (data) => {
    const tile = board[data.index];
    const ob = document.getElementById('opponent-box');
    ob.style.gridColumn = tile.c;
    ob.style.gridRow = tile.r;
});
