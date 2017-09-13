Element.prototype.is = function (className) {
    return this.classList.contains(className);
};

function Minesweeper(height, width, mines) {

    var root;
    var colors = ["blue", "green", "red", "purple", "black", "maroon", "gray", "turquoise"];
    var field = createMatrix(height, width);
    var cellCounter;
    var mineCounter; //createMineCounter()
    var timer; //createTimer()
    var face; //createFace()
    var sound = createSounds(); //game sounds
    var animationQueue = createAnimationQueue(); //animation

    resetGame();

    function createMatrix(height, width) {
        var matx = new Array(height);
        for (var i = 0; i < height; i++)
            matx[i] = new Array(width);
        return matx;
    }

    function inField(x, y) {
        return x >= 0 && x < height && y >= 0 && y < width;
    }

    function forNearby(x, y, callback) {
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (inField(x + i, y + j) && !(i == 0 && j == 0)) {
                    callback(x + i, y + j);
                }
            }
        }
    }

    function forAll(callback) {
        for (var i = 0; i < height; i++)
            for (var j = 0; j < width; j++)
                callback(i, j);
    }

    function resetGame() {
        forAll(function (x, y) {
            field[x][y] = 0;
        });
        cellCounter = 0;
        if (mineCounter)
            mineCounter.reset();
        if (timer)
            timer.reset();
        if (face)
            face.smile();
        animationQueue.clear();

        //fill with mines
        function randomInt(n) {
            var rand = Math.random() * n;
            return Math.floor(rand);
        }

        function putMine(x, y) {
            field[x][y] = -1;
            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    if (inField(x + i, y + j) && field[x + i][y + j] != -1)
                        field[x + i][y + j]++;
                }
            }
        }

        for (var t = 0; t < mines; t++) {
            var x = randomInt(height);
            var y = randomInt(width);
            if (field[x][y] != -1)
                putMine(x, y);
            else
                t--;
        }

        //reset view
        if (root) {
            root.classList.remove("inactive");
            Array.prototype.forEach.call(root.getElementsByClassName("cell"), function (cell) {
                cell.className = "cell unknown";
                cell.textContent = "";
            });
            //add event listeners
            root.addEventListener("click", cellListener);
            root.addEventListener("contextmenu", cellListener);
        }
    }

    function getElement() {
        if (root)
            return root;

        //else create new field
        function loadTemplate() {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "minesweeper_template.html", false);
            xhr.send();

            if (xhr.status != 200)
                return;

            var wrapper = document.createElement("div");
            wrapper.innerHTML = xhr.responseText;
            return wrapper.firstElementChild;
        }

        root = loadTemplate();
        if (!root)
            return;

        //fill with cells
        function newElement(tag, className) {
            var element = document.createElement(tag);
            element.className = className;
            return element;
        }

        var container = root.getElementsByClassName("field")[0];
        for (var i = 0; i < height; i++) {
            var line = newElement("div", "line");
            for (var j = 0; j < width; j++) {
                var cell = newElement("div", "cell unknown");
                cell.dataset.x = i;
                cell.dataset.y = j;

                line.appendChild(cell);
            }
            container.appendChild(line);
        }

        //add event listeners
        root.addEventListener("click", cellListener);
        root.addEventListener("contextmenu", cellListener);
        root.getElementsByClassName("picture-face")[0].onclick = function (event) {
            if (event.which == 1) { //left button
                resetGame();
                callbacks.onReset();
            }
        };

        //init components
        mineCounter = createMineCounter();
        timer = createTimer();
        face = createFace();

        return root;
    }

    function cellListener(event) {
        event.preventDefault();
        if (!event.target.is("cell"))
            return;

        var x = +event.target.dataset.x;
        var y = +event.target.dataset.y;
        var cell = getCell(x, y);

        if (event.which == 1) { //left
            timer.start();

            if (cell.is("open")) { //open adjacent if flags are ok
                var flags = 0;
                forNearby(x, y, function (x, y) {
                    if (getCell(x, y).is("flag"))
                        flags++;
                });

                if (flags == field[x][y]) { //try to open all adjacent
                    forNearby(x, y, function (x, y) {
                        var cell = getCell(x, y);
                        if (cell.is("unknown"))
                            open(x, y, cell);
                    });
                }

                return;
            }

            //open only not opened
            if (!cell.is("unknown"))
                return;
            open(x, y, cell);
        }

        if (event.which == 3) { //right
            if (cell.is("unknown") || cell.is("flag"))
                flag(x, y, cell);
        }
    }

    function getCell(x, y) {
        return root.querySelector('.cell[data-x="' + x + '"][data-y="' + y + '"]');
    }

    function open(x, y, cell) {
        //check for game over
        if (field[x][y] == -1) {
            gameOver(x, y, cell);
            return;
        }

        //cell opened
        cellCounter++;

        if (cell.is("flag")) {
            mineCounter.inc();
        }

        cell.className = "cell open";

        if (field[x][y] > 0) {
            cell.style.color = colors[field[x][y] - 1];
            cell.textContent = field[x][y];
        } else {
            //no mines nearby, try to open all adjacent cells
            forNearby(x, y, function (x, y) {
                var cell = getCell(x, y);
                if (!cell.is("open"))
                    open(x, y, cell);
            });
        }

        //check win
        if (cellCounter == (width * height - mines))
            win();
    }

    function flag(x, y, cell) {
        if (cell.is("flag")) { //off
            cell.classList.add("unknown");
            cell.classList.remove("flag");
            mineCounter.inc();
        } else { //on
            cell.classList.remove("unknown");
            cell.classList.add("flag");
            mineCounter.dec();
        }

    }

    function gameOver(x, y, cell) {
        timer.stop();
        face.gameover();

        root.removeEventListener("click", cellListener);
        root.removeEventListener("contextmenu", cellListener);
        root.classList.add("inactive");

        //show all mines
        forAll(function (x, y) {
            if (field[x][y] == -1 && !getCell(x, y).is("flag")) {
                getCell(x, y).className = "cell mine"
            }
        });
        cell.classList.add("wrong");

        //show all wrong flags
        forAll(function (x, y) {
            var cell = getCell(x, y);
            if (cell.is("flag") && field[x][y] != -1)
                cell.className = "cell flag-wrong";
        });

        //animate blast
        var delay = 500; //500ms
        animationQueue.add(function () {
            cell.classList.remove("mine");
            cell.classList.add("blast");
            sound.bomb();
        }, delay);

        //animate all bombs blasts
        delay += 1500; // + 1,5s
        forAll(function (x1, y1) {
            var cell = getCell(x1, y1);
            if (cell.is("mine") && field[x1][y1] == -1) {
                var dist = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));

                animationQueue.add(function () {
                    cell.classList.remove("mine");
                    cell.classList.add("blast");
                    sound.bomb();
                }, delay + dist * 100); //1 dist = +100ms to delay
            }
        });

        //callback
        if (callbacks.onGameOver)
            callbacks.onGameOver(timer.time());
    }

    function win() {
        timer.stop();
        face.win();
        sound.win();

        root.removeEventListener("click", cellListener);
        root.removeEventListener("contextmenu", cellListener);
        root.classList.add("inactive");

        //callback
        if (callbacks.onWin)
            callbacks.onWin(timer.time());
    }

    //public fields
    this.getElement = getElement;

    //callbacks
    var callbacks = {};
    this.setOnGameOver = function (onGameOver) {
        callbacks.onGameOver = onGameOver;
    };
    this.setOnWin = function (onWin) {
        callbacks.onWin = onWin;
    };
    this.setOnReset = function (onReset) {
        callbacks.onReset = onReset;
    };

    //mine counter
    function createMineCounter() {
        var value = mines;
        var label = root.getElementsByClassName("mine-counter")[0];
        set(value);

        function set(val) {
            value = val;
            label.textContent = value;
        }

        return {
            set: set,
            inc: function () {
                set(value + 1);
            },
            dec: function () {
                set(value - 1);
            },
            reset: function () {
                set(mines);
            }
        }
    }

    //timer
    function createTimer() {
        var time = 0;
        var label = root.getElementsByClassName("timer")[0];
        label.textContent = "00:00";

        function parseTime(time) {
            var sec = Math.floor(time / 1000) % 60;
            var min = Math.floor(time / 1000 / 60);

            if (sec < 10)
                sec = "0" + sec;
            if (min < 10)
                min = "0" + min;

            return min + ":" + sec;
        }

        var timerId;
        var lastTime;

        function rememberTime() {
            var cur = Date.now();
            time += cur - lastTime;
            lastTime = cur;
            label.textContent = parseTime(time);
        }

        return {
            start: function () {
                if (timerId)
                    return;
                lastTime = Date.now();
                timerId = setInterval(rememberTime, 100);
            },
            stop: function () {
                if (!timerId)
                    return;
                clearInterval(timerId);
                timerId = undefined;
                rememberTime();
            },
            time: function () {
                return time;
            },
            reset: function () {
                this.stop();
                time = 0;
                label.textContent = "00:00";
            }
        }
    }

    //face
    function createFace() {
        var face = root.getElementsByClassName("picture-face")[0];

        function set(className) {
            face.className = "picture picture-face " + className;
        }

        return {
            smile: function () {
                set("face-smile");
            },
            gameover: function () {
                set("face-gameover");
            },
            win: function () {
                set("face-win");
            }
        }
    }

    //sounds
    function createSounds() {
        var bomb = new SoundFilter("audio/bomb.mp3", 100);
        var win = new Audio("audio/win.mp3");

        return {
            bomb: function () {
                bomb.play();
            },
            win: function () {
                win.currentTime = 0;
                win.play();
            }
        }
    }

    //animation
    function createAnimationQueue() {
        var animations = [];

        return {
            add: function (func, time) {
                var id = setTimeout(func, time);
                animations.push(id);
            },
            clear: function () {
                animations.forEach(function (id) {
                    clearTimeout(id);
                });
            }
        }
    }

}

function SoundFilter(sound, time) {
    //preload
    new Audio(sound).load();

    var lastTime = 0;
    this.play = function () {
        var timePassed = performance.now() - lastTime;
        if (timePassed > time) {
            lastTime = performance.now();
            new Audio(sound).play();
        }
    }
}