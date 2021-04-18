const prompt = require('prompt-sync')({sigint: true});
const term = require('terminal-kit').terminal;

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';
const validDirections = ['up', 'down', 'left', 'right'];
const difficulties = ['easy', 'intermediate', 'hard'];
const validCharacters = [hole, fieldCharacter];
let gameEnd = false;
let startTime = 0;
let endTime = 0;
let currentRow = 0;
let currentColumn = 0;

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

            if(choice === 'easy') {
                bound = 25;
            } else if( choice === 'intermediate') {
                bound = 35;
            } else {
                bound = 45;
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
        if(choice === 'easy') {
            generatedField = generateEasyField(rows, cols);
        } else if(choice === 'intermediate') {
            generatedField = generateIntermediateField(rows, cols);
        } else if(choice === 'hard') {
            generatedField = generateHardField(rows, cols);
        };

        return generatedField;
    }
}

// returns a random value between 10 and 20 to be used for the field size
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

// asks for a direction until a valid direction is given
const askDirection = () => {
    let direction = prompt('Which way would you like to go, up, down, left or right? ');

    while(!validDirections.includes(direction.toLowerCase())) {
        direction = prompt('Make sure to choose a direction. Which way do you want to go? ');
    };

    return direction;
};

// asks the player for a difficulty until a valid difficulty is given
const askDifficulty = () => {
    let difficulty = prompt('Which difficulty would you like to play on, easy, intermediate or hard? ');

    while(!difficulties.includes(difficulty.toLowerCase())) {
        difficulty = prompt('Make sure to choose a valid difficulty. Which one would you like to play on? ');
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
const amendField = (arr, dir) => {
    if(dir === 'up') {
        if(currentRow > 0) {
            currentRow -= 1;
        } else {
            console.log("You can't go up!");
        };
    } else if(dir === 'down') {
        if(currentRow < arr.length - 1) {
            currentRow += 1;
        } else {
            console.log("You can't go down!");
        };
    } else if(dir === 'left') {
        if(currentColumn > 0) {
            currentColumn -= 1;
        } else {
            console.log("You can't go left!");
        };
    } else if(dir === 'right'){
        if(currentColumn < arr[currentRow].length - 1) {
            currentColumn += 1;
        } else {
            console.log("You can't go right!");
        };
    };
    if(checkWin(arr[currentRow][currentColumn])) {
        gameEnd = true;
        endTime = Date.now();
        const timeElapsed = endTime - startTime;
        console.log(`Congratulations, you found your hat in ${(timeElapsed/1000).toFixed(2)} seconds.`);
    } else if(checkLoss(arr[currentRow][currentColumn])) {
        gameEnd = true;
        endTime = Date.now();
        const timeElapsed = endTime - startTime;
        console.log(`Looks like you took ${(timeElapsed/1000).toFixed(2)} seconds to fall down a hole!`);
    };
    arr[currentRow][currentColumn] = pathCharacter;
    return;
};

// the game engine prints the field, asks for directions and moves the player round until the game ends
const gameEngine = (obj) => {
    while(!gameEnd) {
        obj.print();
        let dir = askDirection();
        amendField(obj.field, dir);
    };
};

// playing the game asks the user for a difficulty, then generates an appropriate field, starts the timer and runs the game engine
const playGame = () => {
    let choice = askDifficulty();
    let gameField = new Field(Field.generateField(fieldSize(), fieldSize(), choice));
    startTime = Date.now();
    gameEngine(gameField);
};

playGame();