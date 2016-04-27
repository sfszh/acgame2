var ProceduralGeneration = ProceduralGeneration || {};

ProceduralGeneration.RoomState = function () {
    "use strict";
    Phaser.State.call(this);
    
    this.MAP_KEY = "room_tilemap";
    this.MAP_TILESET = "dungeon_tileset";
    
    this.prefab_classes = {
        "hero": ProceduralGeneration.Hero.prototype.constructor,
        "door": ProceduralGeneration.Door.prototype.constructor,
        "enemy": ProceduralGeneration.Enemy.prototype.constructor,
        "exit": ProceduralGeneration.Exit.prototype.constructor
    };
};

ProceduralGeneration.RoomState.prototype = Object.create(Phaser.State.prototype);
ProceduralGeneration.RoomState.prototype.constructor = ProceduralGeneration.RoomState;

ProceduralGeneration.RoomState.prototype.init = function (level_data, extra_parameters) {
    "use strict";
    var tileset_index, tile_dimensions;
    this.level_data = this.level_data || level_data;
    
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    
    // start physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 0;
    
    // get current room
    this.room = extra_parameters.room;
};

ProceduralGeneration.RoomState.prototype.preload = function () {
    "use strict";
    this.load.tilemap(this.MAP_KEY, "assets/maps/" + this.room.template_name(), null, Phaser.Tilemap.TILED_JSON);
};

ProceduralGeneration.RoomState.prototype.create = function () {
    "use strict";
    var group_name, object_layer, collision_tiles, new_prefab;
    // create map
    this.map = this.game.add.tilemap(this.MAP_KEY);
    this.map.addTilesetImage(this.map.tilesets[0].name, this.MAP_TILESET);
    
    // create map layers
    this.layers = {};
    this.map.layers.forEach(function (layer) {
        this.layers[layer.name] = this.map.createLayer(layer.name);
        if (layer.properties.collision) { // collision layer
            this.map.setCollisionByExclusion([-1], true, layer.name);
        }
    }, this);
    // resize the world to be the size of the current layer
    this.layers[this.map.layer.name].resizeWorld();
    
    // create groups
    this.groups = {};
    this.level_data.groups.forEach(function (group_name) {
        this.groups[group_name] = this.game.add.group();
    }, this);
    
    this.prefabs = {};
    
    // create objects (prefabs)
    for (object_layer in this.map.objects) {
        if (this.map.objects.hasOwnProperty(object_layer)) {
            // create layer objects
            this.map.objects[object_layer].forEach(this.create_object, this);
        }
    }
    
    // add tiles to the room
    this.room.tiles.forEach(function (tile) {
        this.map.putTile(tile.tile, tile.position.x, tile.position.y, tile.layer);
    }, this);
    
    this.room.prefabs.forEach(function (prefab) {
        new_prefab = new this.prefab_classes[prefab.prefab](this, prefab.name, prefab.position, prefab.properties);
    }, this);

    this.create_battle_ui();
    this.create_quest_header(game.quests[0]);
    //quest button to open a quest info page
    this.create_quest_ui("test");
    this.quest_button = this.add.button(game.world.centerX +200, game.world.centerY-300,  'quest_image', function () {
        this.open_quest_ui(game.quests[1]);
    },this);
    this.quest_button.scale.x =2.0;
    this.quest_button.scale.y =2.0;
    this.is_new_room = true;
};

ProceduralGeneration.RoomState.prototype.close_ui = function (ui) {
    ui.cameraOffset.x = 1200;
};

ProceduralGeneration.RoomState.prototype.open_battle_ui = function (enemy) {
    console.log("open")
    this.enemy = enemy;
    this.popup.cameraOffset.x = 300;
};

ProceduralGeneration.RoomState.prototype.create_battle_ui = function () {
    var popup = game.add.sprite(game.world.centerX, game.world.centerY, 'background_image');
    this.popup = popup;
    popup.alpha = 0.8;
    popup.fixedToCamera = true;
    popup.anchor.set(0.5);
    //console.log("aaaa" + this.popup.cameraOffset.x);
    this.buttonLose = this.add.button(-200, 0,  'lose_image', function () {
        console.log("lose");
        //this.popup.cameraOffset.x = 1200;
        this.close_ui(this.popup);
        this.hero.position.x = 300;
        this.hero.position.y = 300;
        
    },this);
    this.buttonWin = this.add.button(180, 0,  'win_image', function () {
        console.log("win");
        this.enemy.kill();
        //this.popup.cameraOffset.x = 1200;
        this.close_ui(this.popup);
    },this);
    popup.addChild(this.buttonLose);
    popup.addChild(this.buttonWin);
    this.buttonLose.bringToTop();
    this.buttonWin.bringToTop();
    this.close_ui(this.popup);
    //this.popup.cameraOffset.x +=1200;
};


ProceduralGeneration.RoomState.prototype.create_quest_header = function (text) {
    var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

    //  The Text is positioned at 0, 100
    this.quest_text = game.add.text(10, 0, text, style);
}


ProceduralGeneration.RoomState.prototype.open_quest_ui = function (text) {
    this.questUI.cameraOffset.x = 300;
    this.questsInfo.setText(text);
}

ProceduralGeneration.RoomState.prototype.create_quest_ui = function (text) {
    this.questUI = game.add.sprite(game.world.centerX, game.world.centerY, 'background_image');
    this.questUI.fixedToCamera = true;
    this.questUI.anchor.set(0.5);
    this.questUI.alpha = 0.5;
    var buttonLose = this.add.button(-200, 0,  'lose_image', function () {
        this.close_ui(this.questUI);
    },this);
    var buttonWin = this.add.button(180, 0,  'win_image', function () {
        this.close_ui(this.questUI);
        if (this.is_new_room) {
            game.connect.ws.send('finish');
            this.is_new_room = false;
        } else {
            window.alert("you are still in the same room");
        }
    },this);
    var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

    //  The Text is positioned at 0, 100
    this.questsInfo = game.add.text(0,-100, text, style);
    this.questUI.addChild(buttonWin);
    this.questUI.addChild(buttonLose);
    this.questUI.addChild(this.questsInfo);
    this.close_ui(this.questUI);
}

ProceduralGeneration.RoomState.prototype.create_object = function (object) {
    "use strict";
    var object_y, position, prefab;
    // tiled coordinates starts in the bottom left corner
    object_y = (object.gid) ? object.y - (this.map.tileHeight / 2) : object.y + (object.height / 2);
    position = {"x": object.x + (this.map.tileHeight / 2), "y": object_y};
    // create object according to its type
    if (this.prefab_classes.hasOwnProperty(object.type)) {
        prefab = new this.prefab_classes[object.type](this, object.name, position, object.properties);
    }
    this.prefabs[object.name] = prefab;
};
