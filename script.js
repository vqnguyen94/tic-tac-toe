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
        
        if(this.textContent == ""){
            this.textContent = gameController.getCurrentPlayer().getMarker();
            this.classList.add('preview');
        }
        
    }

    function removeMarkerPreview(){
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
        console.log(square);
        let position = square.getAttribute('id');
        
        if(!board[position]){//only if empty
            let marker = gameController.getCurrentPlayer().getMarker();
            board[position] = marker;
            square.textContent = board[position]; 
            square.classList.remove('preview');
            return true;   
        } 
        else{
            return false;
        }
    }

    function winConditionFound(){
        for(let i = 0; i < winConditions.length; i++){
            if( board[ winConditions[i][0] ] == board[ winConditions[i][1] ] && 
                board[ winConditions[i][0] ] == board[ winConditions[i][2] ] && 
                board[ winConditions[i][0] ] != "" ){
                    winningSquares.push(winConditions[i]);
                    return true;
            }
        }
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
        if(turnNumber == 9 && !gameBoard.winConditionFound()){
            //resultsssssssssssss-----------------------------
            // resultDisplay.textContent = "It's a draw!";
            toggleDrawAnimation();
        }
        else if(turnNumber >= 5 && gameBoard.winConditionFound()){
            //resultsssssssssssss-----------------------------
            // resultDisplay.textContent = "Game! The winner is: " + currentPlayer.getName();
            toggleWinningSquaresHighlight();
            toggleWinnerAnimation();
            //gameBoard.resetWinningSquares();
        }
        else{
            return false;
        }
        gameBoard.disableBoardClick();
        return true;
    }

    function toggleWinningSquaresHighlight(){
        const win = gameBoard.getWinningSquares();
        boardSquares[win[0][0]].classList.toggle('winning-square');
        boardSquares[win[0][1]].classList.toggle('winning-square');
        boardSquares[win[0][2]].classList.toggle('winning-square');
        

        boardSquares[win[0][0]].classList.toggle('highlight');
        boardSquares[win[0][1]].classList.toggle('highlight');
        boardSquares[win[0][2]].classList.toggle('highlight');
    }



    function doTurn(){
        let validTurn = gameBoard.placeMarker(this);
        
        if(validTurn){
            updateTurnNumber();
            if(gameOverCheck()){
                //show play again button
                playAgain.classList.remove('hidden');
                //hide the restart
                restart.classList.add('hidden');
                //toggleWinnerAnimation();
                return;
            }
            gameBoard.disableBoardClick();
            changeCurrentPlayer();
            if(turnNumber < 9){
                setTimeout(doComputerTurn, 1000) //do comp move after 1 sec
            }   
        }
    }

    function doComputerTurn(){
        let randomSquare = boardSquares[Math.floor(Math.random()*boardSquares.length)];

        while(!gameBoard.placeMarker(randomSquare)){
            randomSquare = boardSquares[Math.floor(Math.random()*boardSquares.length)];
        }
        updateTurnNumber();
        if(gameOverCheck()){
            //show play again button
            playAgain.classList.remove('hidden');
            //hide the restart
            restart.classList.add('hidden');
            //toggleWinnerAnimation();
            return;
        }
        changeCurrentPlayer();
        gameBoard.enableBoardClick();
    }

    function restartGame(){
        if(turnNumber == 9 && !gameBoard.winConditionFound()){
            toggleDrawAnimation();
        }
        gameBoard.resetBoard();
        gameBoard.disableBoardClick();

        turnNumber = 0;
        
        
        userDisplay.classList.remove('current-player'); 
        computerDisplay.classList.remove('current-player');


        if(gameBoard.getWinningSquares().length != 0){
            toggleWinningSquaresHighlight();
            toggleWinnerAnimation();
            gameBoard.resetWinningSquares();
        }
        
        
        showButtons();
    }

    function userFirstMove(){
        restartGame();
        currentPlayer = user;
        userDisplay.classList.add('current-player'); 
        gameBoard.enableBoardClick();
        hideButtons();
    }

    function computerFirstMove(){
        restartGame();
        currentPlayer = computer;
        computerDisplay.classList.add('current-player');
        setTimeout(doComputerTurn, 1000);
        hideButtons();
    }

    function hideButtons(){
        //hide all intro buttons, show restart during gameplay
        userStart.classList.add('hidden');
        computerStart.classList.add('hidden');
        choiceMessage.classList.add('hidden');
        choiceMessage.classList.remove('fade');
        restart.classList.remove('hidden');
    }

    function showButtons(){
        //show all intro buttons, hides play again and restart to simulate beginning of game
        userStart.classList.remove('hidden');
        computerStart.classList.remove('hidden');
        choiceMessage.classList.remove('hidden');
        choiceMessage.classList.add('fade');
        playAgain.classList.add('hidden');
        restart.classList.add('hidden');
    }

    function setPlayerInfo(e){
        e.preventDefault();

        let marker;
        let name = document.getElementById("name").value;
        if(document.getElementById("x").checked){
            marker = "X";
            computer = Player("Computer", "O");
        }
        else{
            marker = "O";
            computer = Player("Computer", "X");
        }
        user = Player(name, marker);
        document.getElementById("user-name").textContent = name;
        userStart.textContent = name + " starts";        
        
        form.remove();
        
        introAnimation();        
    }

    function introAnimation(){
        //unhide main container with main stuff inside
        //attach fade animation to main container
        document.querySelector("h1").style.animation = "float 1s 1"; 
        document.querySelector("h1").style.animationFillMode = "forwards";
        
        
        mainContainer.classList.toggle("hidden");
        mainContainer.classList.toggle("fade"); 
        showButtons();      
    }

    function toggleWinnerAnimation(){
        
        userDisplay.classList.remove('current-player'); 
        computerDisplay.classList.remove('current-player');

        //computer wins
        if(currentPlayer.getName() == "Computer"){
            document.querySelector("#computer-win").textContent = "👑";
            document.querySelector("#computer-win").classList.toggle('hidden'); //remove -> toggle
            document.querySelector("#computer-win").classList.toggle('crown');
            document.querySelector("#computer-msg").textContent = "Winner!";
            document.querySelector("#computer-msg").classList.toggle('hidden'); 
        }
        //user wins
        else{
            //crown animation
            document.querySelector("#user-win").textContent = "👑";
            document.querySelector("#user-win").classList.toggle('hidden'); 
            document.querySelector("#user-win").classList.toggle('crown'); 

            //result display at bottom of player info
            document.querySelector("#user-msg").textContent = "Winner!";
            document.querySelector("#user-msg").classList.toggle('hidden'); 
        }
    }

    function toggleDrawAnimation(){
        
        userDisplay.classList.remove('current-player'); 
        computerDisplay.classList.remove('current-player');

        document.querySelector("#computer-win").textContent = "🤝";
        document.querySelector("#computer-win").classList.toggle('hidden'); 
        document.querySelector("#computer-win").classList.toggle('draw');
        document.querySelector("#computer-msg").textContent = "It's a draw!";
        document.querySelector("#computer-msg").classList.toggle('hidden'); 
     
        document.querySelector("#user-win").textContent = "🤝";
        document.querySelector("#user-win").classList.toggle('hidden'); 
        document.querySelector("#user-win").classList.toggle('draw'); 

        //result display at bottom of player info
        document.querySelector("#user-msg").textContent = "It's a draw!";
        document.querySelector("#user-msg").classList.toggle('hidden'); 
   
    }

    gameBoard.createBoard();
    //disable until they choose who starts
    gameBoard.disableBoardClick();

    const boardSquares = document.querySelectorAll(".square");
    for (let i = 0; i < boardSquares.length; i++) {
        boardSquares[i].addEventListener('click', doTurn);     
    }

    restart.addEventListener("click", restartGame);
    userStart.addEventListener("click", userFirstMove);
    computerStart.addEventListener("click", computerFirstMove);
    
    playAgain.addEventListener("click", restartGame);
    
    mainContainer.classList.toggle("hidden");
    

    form.addEventListener("submit", setPlayerInfo);



    return {
        getCurrentPlayer
    };

})();

//dont add hvoer to squares alreayd occupied
//make specific squarehover class dinstinct from squares, then remove after marker is palced
