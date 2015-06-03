Crafty.scene('Overworld', function (id) {
    Game.set_map(Game.overworld);
    if(id !== undefined) {
        var start = {
            x: Game.overworld.entrances[id].x * Game.TILE_WIDTH,
            y: (Game.overworld.entrances[id].y+1) * Game.TILE_HEIGHT,
        }
        Player.player.attr(start);
    }
    Crafty.viewport.follow(Player.player);
    //MiniMap.draw();
    //Crafty.e('Skelly').spawn(300, 300);
    //Crafty.e('Gobbo').spawn(950, 750);
});


Crafty.scene('Dungeon', function(id) {
    if(Game.dungeons[id] === undefined) {
        Game.dungeons[id] = Dungeon.generate(100, 100);
        Game.dungeons[id].dungeon_id = id;
    }
    Game.set_map(Game.dungeons[id]);

    var start = {
        x: Game.dungeons[id].exit.x * Game.TILE_WIDTH,
        y: (Game.dungeons[id].exit.y+1) * Game.TILE_HEIGHT,
    }
    Player.player.attr(start);
    Crafty.viewport.follow(Player.player);
});


Crafty.scene('Loading', function () {
    Crafty.background('black');
    Crafty.viewport.clampToEntities = false;

    Crafty.load(Game.assets,
        function () { // onLoad
            Player.init();
            Crafty.enterScene('Overworld');
        },
        function (e) { // onProgress
            console.log(e);
        },
        function (e) { // onError
            console.log(e);
        }
    );
});
