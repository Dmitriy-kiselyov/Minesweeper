var game;
createGame();

function getGameParams() {
    return {
        height: 12,
        width: 12,
        mines: 15,
    };
}

function updateGameParamsInfo() {
    var select = document.getElementById("difficulty");
    var param = select.options[select.selectedIndex].getAttribute("info");

    var info = document.getElementById("info");
    info.textContent = param;
}

function changeGameSize() {
    var select = document.getElementById("size");
    var size = select.options[select.selectedIndex].value + "px";

    var game = document.getElementById("game");
    game.style.fontSize = size;
}

function parseTime(time) {
    var ms = time % 1000;
    var sec = Math.floor(time / 1000);
    return sec + "." + ms;
}

function createGame() {
    var params = getGameParams();
    game = new Minesweeper(params.height, params.width, params.mines);

    //listeners
    game.setOnWin(function (time) {
        time = parseTime(time);
        var status = document.getElementById("status");
        status.className = "status status-win";
        status.textContent = "Поздравляю! Твой приз ждёт тебя в самом вонючем месте в гардеробной!";
    });
    game.setOnGameOver(function () {
        // var status = document.getElementById("status");
        // status.className = "status status-gameover";
        // status.textContent = "Програв. Ещё?"
    });
    game.setOnReset(function () {
        var status = document.getElementById("status");
        status.innerHTML = "&nbsp;"
    });

    //put into DOM
    var root = game.getElement();
    root.id = "game";

    var container = document.getElementById("game-wrapper");
    container.innerHTML = "";

    container.appendChild(root);
    changeGameSize();

    //clear status
    document.getElementById("status").innerHTML = "&nbsp;";
}