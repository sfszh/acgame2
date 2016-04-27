var ProceduralGeneration = ProceduralGeneration || {};

ProceduralGeneration.DungeonState = function () {
    "use strict";
    Phaser.State.call(this);

    this.LEVEL_FILE = "assets/levels/room_level.json";
};

ProceduralGeneration.DungeonState.prototype = Object.create(Phaser.State.prototype);
ProceduralGeneration.DungeonState.prototype.constructor = ProceduralGeneration.DungeonState;

ProceduralGeneration.DungeonState.prototype.init = function (number_of_rooms) {
    "use strict";
    this.number_of_rooms = number_of_rooms;
    this.dungeon = this.dungeon || new ProceduralGeneration.Dungeon(this);
    game.connect = {};
    game.connect.ws = new WebSocket('ws://192.168.10.233:8001/ws');
    game.connect.ws.onopen = function(){
        console.log("open");
        game.connect.ws.send('map');
    }

    game.connect.ws.onmessage = function(ev) {
        // console.log("reciveved: " + ev.data);
        //RPG.map = JSON.parse(ev.data);
        game.quests = ev.data.split('\n');
          
        //game.quest = ev.data;
        console.log("recieved data " + ev.data);
    }
    game.connect.ws.onclose = function(ev) {
        console.log("close");
    }
    game.connect.ws.onerror = function(ev) {
        console.log("error");
    }
};

ProceduralGeneration.DungeonState.prototype.preload = function () {
    "use strict";
    // load the population JSON file
    this.load.text("population", "assets/levels/population.json");
};

ProceduralGeneration.DungeonState.prototype.create = function () {
    "use strict";
    var initial_room;
    // generate new dungeon
    initial_room = this.dungeon.generate_dungeon(this.number_of_rooms);
    // start RoomState for the initial room of the dungeon
    this.game.state.start("BootState", true, false, this.LEVEL_FILE, "RoomState", {room: initial_room});
};
