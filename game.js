var mySymbol,myName;
var activeGameInfo;
var isMyTurn = false;
var gameOver=false;
function Request(path,data){
    var BASE_URL = "http://localhost:4000";
    return fetch(BASE_URL+path,{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    })
}
function createGame(){
    // mySymbol = prompt("Choose From X and O");
    // myName = prompt("Enter Your Name");
    myName = "PlayerX";
    mySymbol = "x";
    console.log("you are ", mySymbol);
    console.log("Waiting for player to join game");
    var data = {};
    data[mySymbol] = myName
    Request("/createGame",data).then(res=>res.json()).then(res=>{
        console.log(res);
        if(!res.id){
            console.log("game not created");
            return
        }
        activeGameInfo = res;
        infoPanel.innerHTML = "Game Created Waiting For Other Player";

        let waitingForOther = setInterval(()=>{
            Request("/infoGame/"+activeGameInfo.id,{}).then(res=>res.json()).then(res=>{
                console.log(res);
                if(res.o){
                    activeGameInfo = res;
                    startGame(activeGameInfo.id,mySymbol);
                    waitForOtherOpponentChance()
                    clearInterval(waitingForOther);
                }
            })
        },2000)
    })

}
function joinGame(gameId){
    isMyTurn = false;
    myName = "playerO";
    mySymbol = "o";
    if(!gameId){
        alert('Please Enter a value before start');
        return;
    }
    Request("/joinGame/"+gameId,{"o":myName}).then(res=>res.json()).then(res=>{
        console.log(res);
        if(res.o){
            activeGameInfo = res;
            startGame(activeGameInfo.id,mySymbol);
            waitForOtherOpponentChance();
        }
    })
}
function startGame(gameId,mySymbol){
    myInfo.innerHTML = "You Are " + mySymbol;
    startPage.style.display = "none";
    gameBoard.style.display = "grid";
    infoPanel.innerHTML = `Game Started between ${activeGameInfo.o} and ${activeGameInfo.x}<br />You Are ${mySymbol}`;
    Array.from(gameBoard.querySelectorAll(".box")).forEach((box,i)=>{
        box.innerHTML = activeGameInfo.activeGame[i];
        box.addEventListener("click",()=>{
            onBoxClick(box,i)
        })
    });
    setInterval(checkforWin,1000)
}

function onBoxClick(box,i){
    if(isMyTurn){
        if(box.innerHTML!=""){
            alert("This Box Is Already Filled");
            return;
        }
        Request("/playGame/"+activeGameInfo.id,{"turn":mySymbol,"pos":i}).then(res=>res.json()).then(res=>{
            console.log(res);
            if(res.id){
                Array.from(gameBoard.querySelectorAll(".box")).forEach((box,i)=>{
                    box.innerHTML = activeGameInfo.activeGame[i];
                });
                console.log(`you typed ${mySymbol} at ${i}`)
                waitForOtherOpponentChance()
            }
        })
    }else{
        console.log("Its Not Your Turn")
    }
}
function waitForOtherOpponentChance(){
    isMyTurn=false;
    let waitingForOther = setInterval(()=>{
        Request("/infoGame/"+activeGameInfo.id,{}).then(res=>res.json()).then(res=>{
            console.log(res);
            if(res.id){
                activeGameInfo = res;
                Array.from(gameBoard.querySelectorAll(".box")).forEach((box,i)=>{
                    box.innerHTML = activeGameInfo.activeGame[i];
                });
            }
            if(res.turn != mySymbol){
                isMyTurn=true;
                infoPanel.innerHTML = "Its Your Turn"
                clearInterval(waitingForOther);
            }else{
                infoPanel.innerHTML = "Wait For Other Player To Start"
                isMyTurn=false;
            }
        })
    },2000)
}

function checkforWin() {
    if(gameOver){
        location.reload();
        return
    }
  Boxes = gameBoard.querySelectorAll(".box");
  let win = false;
  let winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  winConditions.forEach((condition) => {
    if(
        Boxes[condition[0]].innerHTML==Boxes[condition[1]].innerHTML && Boxes[condition[1]].innerHTML==Boxes[condition[2]].innerHTML && Boxes[condition[2]].innerHTML != ""
    ){
        // Someone Win
        win = Boxes[condition[0]].innerHTML
    }
  });
  if (win){
    if(mySymbol==win){
        alert("You Won")
    }else{
        alert("You Lost")
    }
    gameOver=true
  }
  return win;
}