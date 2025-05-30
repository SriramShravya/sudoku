let solutionBoard;  //store solution
let newquestion=[];//store the puzzle
const difficulty=localStorage.getItem("selected");//the difficulty level selected
//console.log(difficulty);
// Timer variables
let timerInterval;
let elapsedSeconds = 0;

//modes
const toggle = document.getElementById('toggle-sun');
const body = document.querySelector('body');
toggle.addEventListener('click', function () {
    this.classList.toggle('bxs-moon');
    this.classList.toggle('bxs-sun');
    if (this.classList.contains('bxs-sun')) {
        body.style.background = '#f1ded8';
        body.style.color = 'black';
    } else {
        body.style.background = 'black';//#283747//#1b2a3d//#283747
        body.style.color = 'white';
    }
});

function highlightlisteners(){
    const inputs=document.querySelectorAll('.cell-input');

    inputs.forEach(input => {
        input.addEventListener( 'focus' , function(){
            const idParts = input.parentElement.id.split('-'); // Split the ID into parts
            const row = parseInt(idParts[1], 10); // Get the row as an integer
            const col = parseInt(idParts[2], 10); // Get the col as an integer
            //const [row,col] = input.parentElemnent.id.split('-').slice(1).map(Number) //slice(1) removes cell from cell-1-2

            highlightrow(row);
            highlightcol(col);
            highlightgrid(row,col);
        })
        input.addEventListener( 'blur' , function(){
            removehighlights();
        })
    })
}


function highlightrow(row){
    const inputs = document.querySelectorAll('.cell-input');

    inputs.forEach(input => {
        const [cellrow] = input.parentElement.id.split('-').slice(1).map(Number);
        if(cellrow == row){
            input.classList.add('highlight');
        } 
    })
}

function highlightcol(col){
    const inputs = document.querySelectorAll('.cell-input');

    inputs.forEach(input => {
        const [,cellcol] = input.parentElement.id.split('-').slice(1).map(Number);
        if(cellcol == col){
            input.classList.add('highlight');
        } 
    })
}

function highlightgrid(row, col) {
    const inputs = document.querySelectorAll('.cell-input');
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);

    inputs.forEach(input => {
        const [cellRow, cellCol] = input.parentElement.id.split('-').slice(1).map(Number);
        if (cellRow >= startRow && cellRow < startRow + 3 && cellCol >= startCol && cellCol < startCol + 3) {
            input.classList.add('highlight');
        }
    });
}

function removehighlights() {
    const inputs = document.querySelectorAll('.cell-input');
    inputs.forEach(input => {
        input.classList.remove('highlight');
    });
}


//allowing only valid input from user
const i=document.querySelectorAll('.cell-input');
i.forEach(i => {
    i.addEventListener('input',function(event){
        let value=event.target.value;
        if(value<'1' || value>'9')//condition can be if(!/^[1-9]$/.test(value))
        {
            event.target.value='';//clear the cell if not a single digit number from 1 to 9
        }
                
    })
})




function generateSudoku() {
    let board = Array(9).fill().map(() => Array(9).fill(0));//creating a board with zeores initially
    board[0][0]=Math.floor((Math.random()*9)+1);//can get 9different puzzels
    solve(board);  // Generate a fully solved board first

    //copy of the solved board to compare
    solutionBoard = board.map(row => row.slice());
    console.log(solutionBoard);

    // Remove numbers to create a puzzle
    let attempts;
    if(difficulty === "0")
    {
        attempts=43;  //fileld are 38 
    }
    else if(difficulty === "1")
    {
        attempts=51;  //filled are 32
    }
    else{
        attempts=60; //empty cells are 60 and filled are 21
    }
    
    while (attempts > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            attempts--;
        }
    }

    newquestion=board.map(row => row.slice()); 

    return board;
}

//validating the values for generating the puzzel
function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
    }
    let startRow = row - row % 3, startCol = col - col % 3;//or (row/3)*3 and (col/3)*3--checking row and column
    for (let i = startRow; i < startRow + 3; i++) {//checking the box
        for (let j = startCol; j < startCol + 3; j++) {
            if (board[i][j] === num) return false;
        }
    }
    return true;
}

//solving sudoku with all zeroes using backtracking
function solve(board) {
   
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solve(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

//validating the user values
function validateBoard() {
    let valid = true;
    const inputs = document.querySelectorAll('.cell-input');

    // Clear all previous highlights before validation
    inputs.forEach(input => {
        input.classList.remove('invalid', 'empty');
    });

    inputs.forEach(input => {
        const idParts = input.parentElement.id.split('-'); // Split the ID into parts
        const row = parseInt(idParts[1], 10); // Get the row as an integer
        const col = parseInt(idParts[2], 10); // Get the col as an integer
        let userValue = input.value.trim();

        if (!input.disabled) {
            if (userValue === '') {
                input.classList.add('empty');
                valid = false;
            } else if (!isValidInput(row, col, parseInt(userValue), solutionBoard)) {
                input.classList.add('invalid');
                valid = false;
            }
        }
    });

    return valid;
}

// Helper function to check if placing num at board[row][col] is valid
function isValidInput(row, col, num, board) {
    // Check row and column for duplicates
    for (let i = 0; i < 9; i++) {
        if ((board[row][i] === num && i !== col) || (board[i][col] === num && i !== row)) {
            return false;
        }
    }

    // Check the 3x3 subgrid for duplicates
    let startRow = row - row % 3;
    let startCol = col - col % 3;
    for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
            if (board[i][j] === num && (i !== row || j !== col)) {
                return false;
            }
        }
    }
    
    return true;
}


// new game button
function newgameBoard() {
    const inputs = document.querySelectorAll('.cell-input');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('invalid');
    });

    let puzzle = generateSudoku();
    inputs.forEach(input => {
        let [row, col] = input.parentElement.id.split('-').slice(1).map(Number);
        if (puzzle[row][col] !== 0) {
            input.value = puzzle[row][col];
            input.disabled = true;
        } else {
            input.disabled = false;
        }
    });
}



// Function to start the timer
function startTimer() {
    const timerElement = document.getElementById("timer");
    timerInterval = setInterval(() => {
        elapsedSeconds++;
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;

        // Update the timer display
        timerElement.textContent = `Time: ${formatTime(minutes)}:${formatTime(seconds)}`;
    }, 1000); // Update every second
}

// Function to format time with leading zeros
function formatTime(value) {
    return value < 10 ? `0${value}` : value;
}

// Function to stop the timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Function to reset the timer
function resetTimer() {
    clearInterval(timerInterval);
    elapsedSeconds = 0;
    document.getElementById("timer").textContent = "Time: 00:00";
}

// Function to get the current elapsed time
function getElapsedTime() {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${formatTime(minutes)}:${formatTime(seconds)}`; // Returns a string like "02:15"
}


function celebrateWithFireworks() {
    const fireworksContainer = document.getElementById("fireworks");
    fireworksContainer.innerHTML="";//clear any exsisting forework
    const numberOfFireworks = 20;

    // Array of possible firework colors
    const fireworkColors = [
        "#FF5733", // Red
        "#33FF57", // Green
        "#3357FF", // Blue
        "#FF33A6", // Pink
        "#FFFF33", // Yellow
        "#FF8C00", // Orange
        "#8A2BE2", // Purple
        "#00FFEF"  // Cyan
    ];

    // Create random fireworks
    for (let i = 0; i < numberOfFireworks; i++) {
        const firework = document.createElement("div");
        firework.classList.add("firework");

        // Randomly set the position
        firework.style.left = `${Math.random() * 90 + 5}%`; // Keeps fireworks within the screen
        firework.style.top = `${Math.random() * 70 + 10}%`;

        // Randomly set the color from the array
        const randomColor = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
        firework.style.backgroundColor = randomColor;

        // Randomize animation duration for a diverse effect
        firework.style.animationDuration = `${Math.random() * 1.5 + 1}s`; // Duration between 3s and 6s
        firework.style.animationDelay = `${Math.random() * 0.5}s`; // Random delay before start
        //firework.style.animationDuration = `${animationDuration}s`;
        //firework.style.animationDelay = `${animationDelay}s`;

        fireworksContainer.appendChild(firework);


        // Remove the firework after animation ends
        setTimeout(() => {
            firework.remove();
        }, 3 * 1000); // Match the animation duration
    }
}



// Event listeners for buttons
document.getElementById('solve').addEventListener('click', () => {
    if (validateBoard()) {
        stopTimer();
        const totaltime = getElapsedTime();
        alert(`Congratulations!! you have completed the puzzle in ${totaltime}`);

        celebrateWithFireworks();
       
       
        
        const inputs=document.querySelectorAll('.cell-input');
        inputs.forEach(input => {
            input.classList.add('correct');
        });
    } else {
        celebrateWithFireworks();
        alert('Make changes to hightlighted cells');
    }
});

document.getElementById('reset').addEventListener('click',() =>{
    const inputs=document.querySelectorAll('.cell-input');

    inputs.forEach(input =>{
        if(!input.disabled)
        {
            input.value='';
            input.classList.remove('invalid' , 'empty');
        }
    })
    resetTimer();
    startTimer();
})
document.getElementById('btn').addEventListener('click', () => {
    newgameBoard();
    inputs.forEach(input =>{
        if(!input.disabled)
        {
            input.value='';
            input.classList.remove('invalid' , 'empty');
        }
    })
    resetTimer();
    startTimer();
});


//starting the timer when the game loads
window.addEventListener("DOMContentLoaded", () => {
    startTimer();
});
// Initialize the Sudoku game
//window.onload = newgameBoard;
window.onload= function()
{
    newgameBoard();
    highlightlisteners();
}