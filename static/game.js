const rawQuestions = [
    { q: "A coat costing £80 is reduced by 15%. New price?", a: "68" },
    { q: "Solve for x: 3x + 7 = 22", a: "5" },
    { q: "What is 3/4 of 120 minus 25?", a: "65" },
    { q: "A square has perimeter 36cm. Area?", a: "81" },
    { q: "Next in sequence: 2, 5, 10, 17, ...", a: "26" },
    { q: "Simplify: (24 ÷ 3) + (5 × 4)", a: "28" },
    { q: "Square root of 144?", a: "12" },
    { q: "2(x + 5) = 30. x = ?", a: "10" },
    { q: "Vertices of a cube?", a: "8" },
    { q: "15km in 10 mins. Speed in km/h?", a: "90" }
];

let availableQuestions = [...rawQuestions];
let score = 100;
let caughtMonsters = [];
let currentIndex = 0;
let isSkippingTurn = false;

// 对应 map_static 图片的格子坐标
const board = [
    { r: 5, c: 1, type: "START" },
    { r: 5, c: 2, type: "GRASS" },
    { r: 5, c: 3, type: "WILD", name: "Tauros", img: "monster_1.png" },
    { r: 5, c: 4, type: "GRASS" },
    { r: 5, c: 5, type: "WILD", name: "Aerodactyl", img: "monster_2.png" },
    { r: 5, c: 6, type: "GRASS" },
    { r: 5, c: 7, type: "WILD", name: "Beedrill", img: "monster_3.png" },
    { r: 5, c: 8, type: "WILD", name: "Dragonite", img: "monster_4.png" },
    { r: 4, c: 8, type: "WATER" },
    { r: 3, c: 8, type: "JAIL" },
    { r: 2, c: 8, type: "WATER" },
    { r: 1, c: 8, type: "WILD", name: "Venusaur", img: "monster_5.png" },
    { r: 1, c: 7, type: "WILD", name: "Charizard", img: "monster_6.png" },
    { r: 1, c: 6, type: "JAIL" },
    { r: 1, c: 5, type: "GRASS" },
    { r: 1, c: 4, type: "WILD", name: "Blaziken", img: "monster_7.png" },
    { r: 1, c: 3, type: "JAIL" },
    { r: 1, c: 2, type: "GRASS" },
    { r: 1, c: 1, type: "WILD", name: "Blastoise", img: "monster_8.png" },
    { r: 2, c: 1, type: "WILD", name: "Gyarados", img: "monster_9.png" },
    { r: 3, c: 1, type: "JAIL" },
    { r: 4, c: 1, type: "WILD", name: "Butterfree", img: "monster_10.png" }
];

function showModal(text, showInput, callback) {
    const overlay = document.getElementById('modal-overlay');
    const input = document.getElementById('modal-input');
    document.getElementById('modal-text').innerText = text;
    input.style.display = showInput ? 'inline-block' : 'none';
    input.value = "";
    overlay.style.display = 'flex';
    document.getElementById('modal-submit').onclick = () => {
        overlay.style.display = 'none';
        callback(input.value);
    };
}

function updateUI() {
    const tile = board[currentIndex];
    document.getElementById('player-box').style.gridColumn = tile.c;
    document.getElementById('player-box').style.gridRow = tile.r;
    document.getElementById('score').innerText = score;
    
    const list = document.getElementById('monster-list');
    list.innerHTML = "";
    caughtMonsters.forEach(m => {
        list.innerHTML += `<div class="monster-card"><img src="/static/images/${m.img}"><p>${m.name}</p></div>`;
    });
}

document.getElementById('roll-btn').onclick = async () => {
    if (isSkippingTurn) {
        showModal("IN JAIL! Skipping Turn...", false, () => {});
        isSkippingTurn = false;
        return;
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    document.getElementById('dice-ui').innerText = ['⚀','⚁','⚂','⚃','⚄','⚅'][roll-1];

    for (let i = 0; i < roll; i++) {
        currentIndex = (currentIndex + 1) % board.length;
        updateUI();
        await new Promise(r => setTimeout(r, 200));
    }

    const tile = board[currentIndex];
    if (tile.type === "WILD") {
        if (availableQuestions.length === 0) availableQuestions = [...rawQuestions];
        const qIdx = Math.floor(Math.random() * availableQuestions.length);
        const q = availableQuestions.splice(qIdx, 1)[0];

        showModal(`WILD ${tile.name}!\n${q.q}`, true, (ans) => {
            if (ans.trim() === q.a) {
                score += 20;
                caughtMonsters.push({name: tile.name, img: tile.img});
                showModal("CORRECT! Captured!", false, () => updateUI());
            } else {
                showModal(`WRONG! It was ${q.a}`, false, () => updateUI());
            }
        });
    } else if (tile.type === "JAIL") {
        score -= 50;
        isSkippingTurn = true;
        showModal("JAIL! -50 Credits & Skip Turn", false, () => updateUI());
    }
};

updateUI();