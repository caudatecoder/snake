var fieldSize = 20;
var fruitColor = '#ff7800';
var fruitCell = null;
var currentCoords = [];
var scoreMultiplier = 20 / fieldSize; // multiply score for smaller fields
var intervals = new Set;
var debouncedHandler = debounce(handleKeypress, 30);

function createMatrix() {
    var n = fieldSize * fieldSize;

    for (var i = 0; i < n; i++) {
        var div = document.createElement('div');
        div.className = 'cell';
        matrix.appendChild(div);
    }
}

function getCell(x, y) {
    var index = (x - 1) * fieldSize + y - 1;
    return matrix.childNodes[index];
}

function setCell(x, y, clr) {
    var cell = getCell(x, y);
    cell.style.backgroundColor = clr;
}

function changeSpeed(step) {
    time -= step;
}

function draw() {
    document.querySelectorAll('.cell').forEach(e => e.style.backgroundColor = '') // clear

    currentCoords.forEach(e => setCell(e[0], e[1], color))
    fruitCell.style.backgroundColor = fruitColor
}

function addSnakePart() {
    currentCoords.push([currentCoords[currentCoords.length - 1][0], currentCoords[currentCoords.length - 1][0]]);

    if (currentCoords.length == fieldSize ** 2 - 1) {
        alert('YOU WON! WOW!');
        clearInterval(intervalID);
        return;
    }
}

function addScore() {
    if (time > 200) {
        score += 10 * scoreMultiplier;
    } else if (time < 101) {
        score += 30 * scoreMultiplier;
    } else {
        score += 20 * scoreMultiplier;
    }

    var sc = document.getElementById('score');
    sc.innerHTML = score;
}

function checkCell(x, y) {
    if (x < 1 || x > fieldSize || y < 1 || y > fieldSize || checkCollision(x, y)) {
        StopGame();
        return;
    }

    if (getCell(x, y) == fruitCell) {
        addSnakePart();
        addScore();
        setFruitPoint();

        if (time > 2000 / fieldSize) {
            changeSpeed(20);
        }
    }
}

function checkCollision(x, y) {
    var coordStrings = currentCoords.map(e => e.toString())
    return coordStrings.includes(x.toString() + ',' + y.toString())
}

function setFruitPoint() {
    var fruitX = getRandomInt(1, fieldSize);
    var fruitY = getRandomInt(1, fieldSize);

    while (checkCollision(fruitX, fruitY) || getCell(fruitX, fruitY) == fruitCell) {
        fruitX = getRandomInt(1, fieldSize);
        fruitY = getRandomInt(1, fieldSize);
    }

    fruitCell = getCell(fruitX, fruitY);
}

function startGame() {
    // console.clear()
    score = 0;
    document.getElementById('score').innerHTML = "0";
    colors = ['#2255ff'];
    color = colors[getRandomInt(0, colors.length - 1)];

    if (document.getElementById('wall')) {
        throughTheWall = document.getElementById('wall').value;
    } else {
        throughTheWall = 'Y';
    }

    currentCoords = [];
    currentCoords[0] = [5, 5];
    currentCoords[1] = [5, 4];
    currentCoords[2] = [5, 3];
    currentCoords[3] = [5, 2];

    setFruitPoint();

    draw();

    direction = 'right';
    time = 300;
    intervalID = setInterval(function () { movePosition(direction); }, time);
    intervals.add(intervalID)
    window.addEventListener('keydown', debouncedHandler);
}

function StopGame() {
    intervals.delete(intervalID)
    window.removeEventListener('keydown', debouncedHandler);
    clearInterval(intervalID);
    alert('GAME OVER!');
    delete currentCoords;
    delete intervalID;
    delete score;
    start.style.display = 'block';
    start.disabled = false;
}

function moveSnake(nextCoords) {
    for (var i = currentCoords.length - 1; i > 0; i--) {
        currentCoords[i][0] = currentCoords[i - 1][0];
        currentCoords[i][1] = currentCoords[i - 1][1];
    }
    currentCoords[0] = nextCoords
    draw();
}

function moveAndResetInterval() {
    intervals.delete(intervalID)
    clearInterval(intervalID);
    intervalID = setInterval(function () { movePosition(); }, time);
    intervals.add(intervalID)
    movePosition()
}

function handleKeypress(e) {
    if (direction == 'left' || direction == 'right') {
        switch (e.keyCode) {
            case 38:
                direction = 'up';
                moveAndResetInterval();
                break;
            case 40:
                direction = 'down';
                moveAndResetInterval()
                break;
        }
    } else if (direction == 'up' || direction == 'down') {
        switch (e.keyCode) {
            case 37:
                direction = 'left';
                moveAndResetInterval();
                break;
            case 39:
                direction = 'right';
                moveAndResetInterval();
                break;
        }
    }
}

function movePosition() {
    var nextCoords = [0, 0]
    switch (direction) {
        case 'left':
            nextCoords = [currentCoords[0][0], currentCoords[0][1] - 1];
            break;
        case 'right':
            nextCoords = [currentCoords[0][0], currentCoords[0][1] + 1];
            break;
        case 'up':
            nextCoords = [currentCoords[0][0] - 1, currentCoords[0][1]];
            break;
        case 'down':
            nextCoords = [currentCoords[0][0] + 1, currentCoords[0][1]];
            break;
    }

    if (throughTheWall == "Y") {
        if (nextCoords[0] < 1) {
            nextCoords[0] = fieldSize;
        }
        else if (nextCoords[0] > fieldSize) {
            nextCoords[0] = 1;
        }
        else if (nextCoords[1] < 1) {
            nextCoords[1] = fieldSize;
        }
        else if (nextCoords[1] > fieldSize) {
            nextCoords[1] = 1;
        }
    }

    checkCell(nextCoords[0], nextCoords[1]);

    moveSnake(nextCoords);
}

window.onload = function () {
    start = document.getElementById('start');
    start.onclick = function (event) {
        event.preventDefault();

        fieldSize = Number(Array.from(document.getElementsByName('mode')).find(e => e.checked).value)
        scoreMultiplier = 20 / fieldSize

        matrix = document.getElementById('matrix');
        matrix.innerHTML = '';
        matrix.style.width = fieldSize * 20 + 'px';
        matrix.style.height = fieldSize * 20 + 'px';
        matrix.focus();
        createMatrix();

        start.style.display = 'none';
        start.disabled = true;
        startGame();
    }
}

/////////////////////////////////////
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function debounce(func, wait, immediate) {
    // 'private' variable for instance
    // The returned function will be able to reference this due to closure.
    // Each call to the returned function will share this common timer.
    var timeout;

    // Calling debounce returns a new anonymous function
    return function () {
        // reference the context and args for the setTimeout function
        var context = this,
            args = arguments;

        // Should the function be called now? If immediate is true
        //   and not already in a timeout then the answer is: Yes
        var callNow = immediate && !timeout;

        // This is the basic debounce behaviour where you can call this 
        //   function several times, but it will only execute once 
        //   [before or after imposing a delay]. 
        //   Each time the returned function is called, the timer starts over.
        clearTimeout(timeout);

        // Set the new timeout
        timeout = setTimeout(function () {

            // Inside the timeout function, clear the timeout variable
            // which will let the next execution run when in 'immediate' mode
            timeout = null;

            // Check if the function already ran with the immediate flag
            if (!immediate) {
                // Call the original function with apply
                // apply lets you define the 'this' object as well as the arguments 
                //    (both captured before setTimeout)
                func.apply(context, args);
            }
        }, wait);

        // Immediate mode and no wait timer? Execute the function..
        if (callNow) func.apply(context, args);
    }
}