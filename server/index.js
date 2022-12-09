const express = require("express");
const cors = require("cors");
const Games = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
function random(min,max){
    return Math.floor(min + Math.random()*(max-min));
}

app.get("/", async (req, res) => {
    const snapshot = await User.get();
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.send(list);
});

app.post("/createGame", async (req, res) => {
    const data = req.body;
    if(data.x){
        const snapshot = await Games.get();
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const ref = String(1000 + list.length  + 1);
        await Games.doc(ref).set({
            "id":ref,
            "x": data.x,
            "o": "",
            "turn":"x",
            "activeGame":["","","","","","","","",""]
        })
        const gameObj = await Games.doc(ref).get()
        res.status(200).json(gameObj.data())
        return
    }
    // const gameObj = await Games.doc(req.body.id).get()
    // res.status(200).json(gameObj.data())
    // return
    res.status(400).json({"msg": "Something Went Wrong"});
});

app.post("/joinGame/:gameId", async (req, res) => {
    if(req.body.o){
        await Games.doc(req.params.gameId).update({o:req.body.o})
        const gameObj = await Games.doc(req.params.gameId).get()
        res.status(200).json(gameObj.data())
        return
    }
    res.status(400).json({"msg": "Something Went Wrong"});
})

app.post("/infoGame/:gameId", async (req, res) => {
    if(req.body){
        const gameObj = await Games.doc(req.params.gameId).get()
        res.status(200).json(gameObj.data())
        return
    }
    res.status(400).json({"msg": "Something Went Wrong"});
})

app.post("/playGame/:gameId", async (req,res)=>{
    console.log(req.body.pos , req.body.turn)
    if(req.body.pos != undefined && req.body.turn != undefined){
        let gameObj = await Games.doc(req.params.gameId).get()
        gameObj = gameObj.data();
        gameObj.turn = gameObj.turn == "x"?"o":"x";
        console.log(req.body.turn,gameObj.turn)
        if(req.body.turn==gameObj.turn){
            gameObj.activeGame[0+req.body.pos] = req.body.turn;
            await Games.doc(req.params.gameId).update(gameObj)
            res.status(200).json(gameObj)
        }else{
            res.status(400).json({"msg": "Please Wait For Your Turn"});
        }
    }else{
        res.status(400).json({"msg":"pass valid args"})
    }
})
app.listen(4000, (e) => console.log("Up & Running *4000",e));