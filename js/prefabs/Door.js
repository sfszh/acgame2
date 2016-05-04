var ProceduralGeneration = ProceduralGeneration || {};

ProceduralGeneration.Door = function (game_state, name, position, properties) {
    "use strict";
    ProceduralGeneration.Prefab.call(this, game_state, name, position, properties);
    
    this.anchor.setTo(0.5);
    
    this.direction = properties.direction;

    this.game_state.game.physics.arcade.enable(this);
    this.body.immovable = true;
};

ProceduralGeneration.Door.prototype = Object.create(ProceduralGeneration.Prefab.prototype);
ProceduralGeneration.Door.prototype.constructor = ProceduralGeneration.Door;

ProceduralGeneration.Door.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.heroes, this.enter_door, null, this);
};

ProceduralGeneration.Door.prototype.enter_door = function () {
    "use strict";
    var next_room;
    //if (this.game_state.groups.enemies.countLiving() === 0) {
        // find the next room using the door direction
        next_room = this.game_state.room.neighbors[this.direction];
        // start room state for the next room
      game.state.start("DungeonState", true, false, 10);
      if(game.quests[1] != null && game.quests[1] == "Just wander around and look") {
        console.log("quests name " + game.quests[1]);
        game.connect.ws.send('win');
      }
      //  this.game_state.game.state.start("BootState", true, false, "assets/levels/room_level.json", "RoomState", {room: next_room});
    //}
};