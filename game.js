var game;
createGame();

function getGameParams() {
    var select = document.getElementById("difficulty");
    var params = select.options[select.selectedIndex].value;
    params = params.split(",");

    return {
        height: params[0],
        width: params[1],
        mines: params[2]
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

    //put into DOM
    var root = game.getElement();
    root.id = "game";

    var container = document.getElementById("game-wrapper");
    container.innerHTML = "";

    container.appendChild(root);
    changeGameSize();
}