const prompt = require('prompt-sync')({sigint: true});

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';
const validDirections = ['up', 'down', 'left', 'right'];
const validCharacters = [hole, fieldCharacter];
let gameEnd = false;
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

    static generateField(rows, cols) {
        let arr = [];
        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < cols; j++) {
                row.push(validCharacters[Math.floor(Math.random() * validCharacters.length)]);
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
    }
}

// returns a random value between 3 and 9 to be used for the field size
const fieldSize = () => {
    let size = Math.floor(Math.random() * 10);
    if(size < 3) {
        size += 3;
    };
    return size;
};

// ask for a direction until a valid direction is given
const askDirection = () => {
    let direction = prompt('Which way would you like to go, up, down, left or right? ')

    while(!validDirections.includes(direction.toLowerCase())) {
        direction = prompt('Make sure to choose a direction. Which way do you want to go? ');
    };

    return direction;
};

// check whether game has been won
const checkWin = (pos) => {
    if(pos === hat) {
        return true;
    } else {
        return false;
    }
};

// check whether game has been lost
const checkLoss = (pos) => {
    if(pos === hole) {
        return true;
    } else {
        return false;
    }
};

// amend the field based on the given direction
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
        console.log('Congratulations, you found your hat!');
        gameEnd = true;
    } else if(checkLoss(arr[currentRow][currentColumn])) {
        console.log('Looks like you fell down a hole!');
        gameEnd = true;
    };
    arr[currentRow][currentColumn] = pathCharacter;
    return;
};

// play the game by asking for a direction and amending the field accordingly
// until the game ends
const playGame = (obj) => {
    while(!gameEnd) {
        obj.print();
        let dir = askDirection();
        amendField(obj.field, dir);
    };
};

playGame(new Field(Field.generateField(fieldSize(), fieldSize())));