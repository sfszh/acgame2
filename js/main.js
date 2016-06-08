var ProceduralGeneration = ProceduralGeneration || {};

var game = new Phaser.Game(600, 600, Phaser.CANVAS);
game.state.add("BootState", new ProceduralGeneration.BootState());
game.state.add("LoadingState", new ProceduralGeneration.LoadingState());
game.state.add("DungeonState", new ProceduralGeneration.DungeonState());
game.state.add("RoomState", new ProceduralGeneration.RoomState());

    game.connect = {};
    game.connect.ws = new WebSocket('ws://192.168.10.233:8001/ws');
    game.connect.ws.onopen = function(){
        console.log("open");
        game.connect.ws.send('map\nfoo');
    }
    console.log("!!!!!!!");
    game.connect.ws.onmessage = function(ev) {
        console.log("reciveved: " + ev.data);
        //RPG.map = JSON.parse(ev.data);
        game.quests = ev.data.split('\n');
        console.log(game.quests[0]);
        console.log(game.quests[1]);
        game.quests[2] = game.quests[1];
        /*
        if( game.quests[0] == game.quests[1]) {
            //game.connect.ws.send('win');
        }
        */
        //console.log(" test " + game.quests[1].indexOf("normal"));

        if(game.quests[1].indexOf("easy") > 0) {
            
            game.difficulty = 1;
        }
        else if (game.quests[1].indexOf("normal") > 0) {
            game.difficulty = 2;
        }
        else if (game.quests[1].indexOf("hard") > 0) {
            game.difficulty = 3;
        } else {
            game.diffculty = 0;
        }

        console.log("game diffculty is " + game.diffculty);
        
        //game.quest = ev.data;
        console.log("recieved data " + ev.data);
        game.is_receive = true;
        /*
        game.created_rooms.forEach(function (room) {
            room.populate_mosters();
        },this);*/
    }
    game.connect.ws.onclose = function(ev) {
        console.log("close");
    }
    game.connect.ws.onerror = function(ev) {
        console.log("error");
    }
game.state.start("DungeonState", true, false, 10);