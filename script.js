const Player = (name, marker) => {
    function getMarker() {
        return marker;
    }

    function getName(){
        return name;
    }

    return { 
        getMarker,
        getName
    };
};

const gameBoard = (() => {
    const boardDisplay = document.querySelector('#board');
    const board = [
        "","","",
        "","","",
        "","",""
    ];

    const winConditions = [
        //Rows
        [0,1,2],
        [3,4,5],
        [6,7,8],
        //Columns
        [0,3,6],
        [1,4,7],
        [2,5,8],
        //Diagonals
        [0,4,8],
        [2,4,6]
    ];
    const winningSquares = [];
    
    //Initialize board
    function createBoard(){
        for(let i = 0; i < board.length; i++){
            const div = document.createElement('div');
            div.setAttribute('id', i);    
            div.classList.toggle('square');
            boardDisplay.appendChild(div);
            div.addEventListener("mouseenter", markerPreview);
            div.addEventListener("mouseleave", removeMarkerPreview);
        }
    }

    function markerPreview(){
        //Only show a preview of the marker if square is not occupied
        if(this.textContent == ""){
            this.textContent = gameController.getCurrentPlayer().getMarker();
            this.classList.add('preview');
        }  
    }

    function removeMarkerPreview(){
        //Remove the preview after leaving the square
        if(this.classList.contains('preview')){
            this.textContent = "";
            this.classList.remove('preview');
        }       
    }

    function enableBoardClick(){
        boardDisplay.classList.remove('unclickable'); 
    }

    function disableBoardClick(){
        boardDisplay.classList.add('unclickable'); 
    }

    function resetBoard(){
        const squares = document.querySelectorAll(".square");
        for (let i = 0; i < squares.length; i++) {
            board[i] = "";
            squares[i].textContent = board[i];   
        }
    }

    function placeMarker(square){
        let position = square.getAttribute('id');
        
        //If square is not occupied
        if(!board[position]){
            let marker = gameController.getCurrentPlayer().getMarker();
            board[position] = marker;
            square.textContent = board[position]; 
            square.classList.remove('preview');
            return true;   
        } 
        //Not a valid move, square was already occupied
        else{
            return false;
        }
    }

    function winConditionFound(){
        for(let i = 0; i < winConditions.length; i++){
            //If all 3 squares have the same marker, and not empty
            if( board[ winConditions[i][0] ] == board[ winConditions[i][1] ] && 
                board[ winConditions[i][0] ] == board[ winConditions[i][2] ] && 
                board[ winConditions[i][0] ] != "" ){
                    //Retain the position of the winning squares
                    winningSquares.push(winConditions[i]);
                    return true;
            }
        }
        //No win found
        return false;
    }

    function getWinningSquares(){
        return winningSquares;
    }

    function resetWinningSquares(){
        winningSquares.length = 0;
    }

    return {
        placeMarker,
        createBoard,
        winConditionFound,
        resetBoard,
        enableBoardClick,
        disableBoardClick,
        getWinningSquares,
        resetWinningSquares
    };
})();

//Controls flow of the game
const gameController = (() => {
    const form = document.querySelector("form");
    const mainContainer = document.querySelector("#main");
    const restart = document.querySelector("#restart");
    const userStart = document.querySelector('#user-first');
    const computerStart = document.querySelector('#computer-first');
    const choiceMessage = document.querySelector('#choice-msg');
    const playAgain = document.querySelector('#play-again'); 
    const userDisplay = document.querySelector("#user");
    const computerDisplay = document.querySelector("#computer");
    
    let user, computer, currentPlayer;
    let turnNumber = 0;
    

    function updateTurnNumber(){
        turnNumber++;
    }

    function getCurrentPlayer(){
        return currentPlayer;
    }

    function changeCurrentPlayer(){
        if(currentPlayer.getName() == "Computer"){
            currentPlayer = user;
            userDisplay.classList.add('current-player'); 
            computerDisplay.classList.remove('current-player'); 
        }
        else{
            currentPlayer = computer;
            computerDisplay.classList.add('current-player'); 
            userDisplay.classList.remove('current-player'); 
        }
    }

    function gameOverCheck(){
        //Final turn and no win found means it's a draw
        if(turnNumber == 9 && !gameBoard.winConditionFound()){
            toggleDrawAnimation();
        }
        //Wins can only happen after turn 5
        else if(turnNumber >= 5 && gameBoard.winConditionFound()){
            toggleWinningSquaresHighlight();
            toggleWinnerAnimation();
        }
        //No win
        else{
            return false;
        }
        //Disable board once game is over
        gameBoard.disableBoardClick();
        return true;
    }

    function toggleWinningSquaresHighlight(){
        const win = gameBoard.getWinningSquares();
        
        //Add winning square animation
        boardSquares[win[0][0]].classList.toggle('winning-square');
        boardSquares[win[0][1]].classList.toggle('winning-square');
        boardSquares[win[0][2]].classList.toggle('winning-square');
    }

    //User's turn
    function doTurn(){
        let validTurn = gameBoard.placeMarker(this);
        
        if(validTurn){
            updateTurnNumber();
            if(gameOverCheck()){
                //Show Play Again button
                playAgain.classList.remove('hidden');
                //Hide restart button
                restart.classList.add('hidden');
                return;
            }
            //Disable board to prevent from user making a move during computers turn
            gameBoard.disableBoardClick();
            changeCurrentPlayer();
            //Prevents computer from attempting a move if there are no spaces left on board
            if(turnNumber < 9){
                //Do computer turn after 1 sec
                setTimeout(doComputerTurn, 1000) 
            }   
        }
    }

    //Computer turn
    function doComputerTurn(){
        let randomSquare = boardSquares[Math.floor(Math.random()*boardSquares.length)];

        //Keep generating a random square until an empty square is found
        while(!gameBoard.placeMarker(randomSquare)){
            randomSquare = boardSquares[Math.floor(Math.random()*boardSquares.length)];
        }
        updateTurnNumber();
        if(gameOverCheck()){
            playAgain.classList.remove('hidden');
            restart.classList.add('hidden');
            return;
        }
        changeCurrentPlayer();
        //Reenable board for user to complete their turn
        gameBoard.enableBoardClick();
    }

    //Restarts the game taking into consideration the game is restarted before a game is over, after a win, or after a draw
    function restartGame(){
        //Toggle off the stylings if a draw happened
        if(turnNumber == 9 && !gameBoard.winConditionFound()){
            toggleDrawAnimation();
        }

        gameBoard.resetBoard();
        gameBoard.disableBoardClick();

        turnNumber = 0;
        
        //Remove stylings of whichever player was indicated as winner
        userDisplay.classList.remove('current-player'); 
        computerDisplay.classList.remove('current-player');

        //Toggle off the stylings if a win happened
        if(gameBoard.getWinningSquares().length != 0){
            toggleWinningSquaresHighlight();
            toggleWinnerAnimation();
            gameBoard.resetWinningSquares();
        }
     
        showButtons();
    }

    //If user decides to go first
    function userFirstMove(){
        restartGame();
        currentPlayer = user;
        userDisplay.classList.add('current-player'); 
        gameBoard.enableBoardClick();
        hideButtons();
    }

    //If computer is chosen to go first
    function computerFirstMove(){
        restartGame();
        currentPlayer = computer;
        computerDisplay.classList.add('current-player');
        setTimeout(doComputerTurn, 1000);
        hideButtons();
    }

    function hideButtons(){
        //Hide all intro buttons
        userStart.classList.add('hidden');
        computerStart.classList.add('hidden');
        choiceMessage.classList.add('hidden');
        choiceMessage.classList.remove('fade');
        //Allows the restart button to be seen during the game
        restart.classList.remove('hidden');
    }

    function showButtons(){
        //Show all intro buttons, hides play again and restart to simulate beginning of game
        userStart.classList.remove('hidden');
        computerStart.classList.remove('hidden');
        choiceMessage.classList.remove('hidden');
        choiceMessage.classList.add('fade');

        playAgain.classList.add('hidden');
        restart.classList.add('hidden');
    }

    //Executes when form is submitted
    function setPlayerInfo(e){
        e.preventDefault();

        let marker;
        //Get name entered by user
        let name = document.getElementById("name").value;

        //Determine which marker the user chose and assigns remaining marker to computer
        if(document.getElementById("x").checked){
            marker = "X";
            computer = Player("Computer", "O");
        }
        else{
            marker = "O";
            computer = Player("Computer", "X");
        }
        //Create user and player card
        user = Player(name, marker);
        document.getElementById("user-name").textContent = name;
        userStart.textContent = name + " starts";        
        
        form.remove();
        
        introAnimation();        
    }

    function introAnimation(){
        //Remove title with an animation
        document.querySelector("h1").style.animation = "float 1s 1"; 
        document.querySelector("h1").style.animationFillMode = "forwards";       
        
        //Unhide main container
        mainContainer.classList.toggle("hidden");
        mainContainer.classList.toggle("fade"); 
        showButtons();      
    }

    //Executes when a winner is found
    function toggleWinnerAnimation(){
        //Remove current player indicators
        userDisplay.classList.remove('current-player'); 
        computerDisplay.classList.remove('current-player');

        //Computer wins
        if(currentPlayer.getName() == "Computer"){
            document.querySelector("#computer-win").textContent = "👑";
            document.querySelector("#computer-win").classList.toggle('hidden'); 
            document.querySelector("#computer-win").classList.toggle('crown');
            document.querySelector("#computer-msg").textContent = "Winner!";
            document.querySelector("#computer-msg").classList.toggle('hidden'); 
        }
        //User wins
        else{
            //Crown animation
            document.querySelector("#user-win").textContent = "👑";
            document.querySelector("#user-win").classList.toggle('hidden'); 
            document.querySelector("#user-win").classList.toggle('crown'); 
            //Result display at bottom of player card
            document.querySelector("#user-msg").textContent = "Winner!";
            document.querySelector("#user-msg").classList.toggle('hidden'); 
        }
    }

    //Executes when a draw occurs
    function toggleDrawAnimation(){
        //Remove current player indicators
        userDisplay.classList.remove('current-player'); 
        computerDisplay.classList.remove('current-player');

        //Add the draw animation and message to both player cards
        document.querySelector("#computer-win").textContent = "🤝";
        document.querySelector("#computer-win").classList.toggle('hidden'); 
        document.querySelector("#computer-win").classList.toggle('draw');
        document.querySelector("#computer-msg").textContent = "It's a draw!";
        document.querySelector("#computer-msg").classList.toggle('hidden'); 
     
        document.querySelector("#user-win").textContent = "🤝";
        document.querySelector("#user-win").classList.toggle('hidden'); 
        document.querySelector("#user-win").classList.toggle('draw'); 
        document.querySelector("#user-msg").textContent = "It's a draw!";
        document.querySelector("#user-msg").classList.toggle('hidden'); 
    }

    gameBoard.createBoard();
    //Disable until they choose who starts
    gameBoard.disableBoardClick();

    //Occurs after squares are made in "createBoard"
    const boardSquares = document.querySelectorAll(".square");
    for (let i = 0; i < boardSquares.length; i++) {
        boardSquares[i].addEventListener('click', doTurn);     
    }

    restart.addEventListener("click", restartGame);
    userStart.addEventListener("click", userFirstMove);
    computerStart.addEventListener("click", computerFirstMove); 
    playAgain.addEventListener("click", restartGame);
    form.addEventListener("submit", setPlayerInfo);
    
    mainContainer.classList.toggle("hidden");
    
    return {
        getCurrentPlayer
    };

})();

