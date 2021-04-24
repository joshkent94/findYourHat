const prompt = require('prompt-sync')({sigint: true});
const term = require('terminal-kit').terminal;

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';
const validDirections = ['up', 'down', 'left', 'right'];
const difficulties = ['Easy', 'Intermediate', 'Hard'];
const endGameOptions = ['Retry', 'New Level', 'Quit'];
const validCharacters = [hole, fieldCharacter];
let gameEnd = false;
let startTime;
let endTime;
let currentRow;
let currentColumn;
let startRow;
let startColumn;
let gameField;
let difficulty;

class Field {
    constructor(arr) {
        this.field = arr;
    }

    print() {
        for (let i = 0; i < this.field.length; i++) {
            console.log(this.field[i].join(''));
        }
    }

    static generateField(rows, cols, choice) {

        let generatedField = [];

        // generates a random field with the given number of rows and cols
        // holes are chosen with probability dictated by the bound
        const fieldCreation = (rows, cols, choice) => { 
            let arr = [];
            let bound = 0;

            if(choice === 'Easy') {
                bound = 20;
            } else if( choice === 'Intermediate') {
                bound = 25;
            } else {
                bound = 30;
            };

            for (let i = 0; i < rows; i++) {
                let row = [];
                for (let j = 0; j < cols; j++) {
                    if((Math.floor(Math.random() * 100)) < bound) {
                        row.push(validCharacters[0]);
                    } else {
                        row.push(validCharacters[1]);
                    };
                };
                arr.push(row);
            };

            currentRow = Math.floor(Math.random() * rows);
            currentColumn = Math.floor(Math.random() * cols);
            startRow = currentRow;
            startColumn = currentColumn;
            arr[currentRow][currentColumn] = pathCharacter;

            let winningRow = Math.floor(Math.random() * rows);
            let winningColumn = Math.floor(Math.random() * cols);

            while(arr[winningRow][winningColumn] === pathCharacter) {
                winningRow = Math.floor(Math.random() * rows);
                winningColumn = Math.floor(Math.random() * cols);
            };
            arr[winningRow][winningColumn] = hat;

            return arr;
        };

        // generates a field of certain difficulty
        const generateEasyField = (rows, cols) => {
            return fieldCreation(rows, cols, 'easy');
        }

        const generateIntermediateField = (rows, cols) => {
            return fieldCreation(rows, cols, 'intermediate');
        }

        const generateHardField = (rows, cols) => {
            return fieldCreation(rows, cols, 'hard');
        }

        // decides which difficulty to use based on user input
        if(choice === 'Easy') {
            generatedField = generateEasyField(rows, cols);
        } else if(choice === 'Intermediate') {
            generatedField = generateIntermediateField(rows, cols);
        } else if(choice === 'Hard') {
            generatedField = generateHardField(rows, cols);
        };

        return generatedField;
    }
}

// returns a random value between 10 and 20 to be used for the field size --- NO LONGER USED
const fieldSize = () => {
    let size = Math.floor(Math.random() * 21);
    while(size < 10) {
        size = Math.floor(Math.random() * 21);
    };
    return size;
};

// calculates the number of holes in a given field
let numberOfHoles = (arr, rows, cols) => {
    let holeSum = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if(arr[i][j] === hole) {
                holeSum++;
            };
        };
    };
    return holeSum;
};

// asks for a direction until a valid direction is given --- NO LONGER USED
const askDirection = () => {
    let direction = prompt(term.colorRgb(0x33, 0xff, 0x88, "Which way would you like to go, up, down, left or right? "));

    while(!validDirections.includes(direction.toLowerCase())) {
        direction = prompt(term.colorRgb(0x33, 0xff, 0x88, 'Make sure to choose a direction. Which way do you want to go? '));
    };

    return direction;
};

// asks the player for a difficulty until a valid difficulty is given --- NO LONGER USED
const askDifficulty = () => {
    let difficulty = prompt(term.colorRgb(0x33, 0xff, 0x88, "Which difficulty would you like to play on, easy, intermediate or hard? "));

    while(!difficulties.includes(difficulty.toLowerCase())) {
        difficulty = prompt(term.colorRgb(0x33, 0xff, 0x88, "Make sure to choose a valid difficulty. Which one would you like to play on? "));
    };

    return difficulty;
};

// checks whether game has been won
const checkWin = (pos) => {
    if(pos === hat) {
        return true;
    } else {
        return false;
    }
};

// checks whether game has been lost
const checkLoss = (pos) => {
    if(pos === hole) {
        return true;
    } else {
        return false;
    }
};

// amends the field based on the given direction
// but if the given direction leads to a win or loss then print a relevant message
// give retry, new level on same difficulty, and quit options
const amendField = (arr, dir) => {
    if(dir === 'UP') {
        if(currentRow > 0) {
            currentRow -= 1;
        };
    } else if(dir === 'DOWN') {
        if(currentRow < arr.length - 1) {
            currentRow += 1;
        };
    } else if(dir === 'LEFT') {
        if(currentColumn > 0) {
            currentColumn -= 1;
        };
    } else if(dir === 'RIGHT'){
        if(currentColumn < arr[currentRow].length - 1) {
            currentColumn += 1;
        };
    };
    if(checkWin(arr[currentRow][currentColumn])) {
        endTime = Date.now();
        const timeElapsed = endTime - startTime;
        term.moveTo(0, 31);
        term.colorRgb(0x33, 0xff, 0x88, `Congratulations, you found your hat in ${(timeElapsed/1000).toFixed(2)} seconds.`);
        gameEnd = true;
        process.exit();
    } else if(checkLoss(arr[currentRow][currentColumn])) {
        endTime = Date.now();
        const timeElapsed = endTime - startTime;
        term.moveTo(0, 31);
        term.colorRgb(0x33, 0xff, 0x88, `Looks like you took ${(timeElapsed/1000).toFixed(2)} seconds to fall down a hole!`);
        gameEnd = true;
        process.exit();
    };
};

// the game engine prints the field, starts the game timer and listens for direction inputs before feeding the inputs into amendField
const gameEngine = (obj) => {
    obj.print();
    startTime = Date.now();
    term.grabInput();
    term.moveTo(currentColumn + 1, currentRow + 1);
        term.on('key', (key) => {
            switch (key) {
                case 'UP':
                    amendField(obj.field, key);
                    term.moveTo(currentColumn + 1, currentRow + 1);
                    term.delete(1);
                    term.insert(1);
                    break;
                case 'DOWN':
                    amendField(obj.field, key);
                    term.moveTo(currentColumn + 1, currentRow + 1);
                    term.delete(1);
                    term.insert(1);
                    break;
                case 'LEFT':
                    amendField(obj.field, key);
                    term.moveTo(currentColumn + 1, currentRow + 1);
                    term.delete(1);
                    term.insert(1);
                    break;
                case 'RIGHT':
                    amendField(obj.field, key);
                    term.moveTo(currentColumn + 1, currentRow + 1);
                    term.delete(1);
                    term.insert(1);
                    break;
                case 'CTRL_C':
                    term.moveTo(0, 31);
                    process.exit();
                default:
                    break;
            };
        });
};

// uses a column menu to select the difficulty, clears the screen, then generates a field using that difficulty,
// creates a loading screen for 3 seconds, then counts down 3 seconds until the game starts, clears the display and runs the game engine
const playGame = () => {
    term.colorRgb(0x33, 0xff, 0x88, "Welcome to Find My Hat! The aim of the game is to find your hat without falling down the holes.");
    term.nextLine(1).colorRgb(0x33, 0xff, 0x88, "When you're ready, pick a difficulty to play on:");
    term.singleColumnMenu(difficulties, (error, response) => {
        difficulty = response.selectedText;
        gameField = new Field(Field.generateField(30, 100, difficulty));
        term.clear();
        term.colorRgb(0x33, 0xff, 0x88, "Loading...");
        setTimeout(() => {
            term.clear();
            gameField.print();
            term.colorRgb(0x33, 0xff, 0x88, "Get ready to play in... 3");
            setTimeout(() => {
                term.left(1);
                term.delete(1);
                term.colorRgb(0x33, 0xff, 0x88, "2");
                setTimeout(() => {
                    term.left(1);
                    term.delete(1);
                    term.colorRgb(0x33, 0xff, 0x88, "1");
                    setTimeout(() => {
                        term.clear();
                        gameEngine(gameField);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 3000);
    });
};

playGame();