Crafty.scene('Game', function () {
    Crafty.background('black');
    Crafty.viewport.clampToEntities = false;
    Player.init();

    var map = Terrain.gen_area(Game.MAP_WIDTH, Game.MAP_HEIGHT);
    Game.overworld = Terrain.Map(map, Game.MAP_WIDTH, Game.MAP_HEIGHT);
    Game.set_map(Game.overworld);
    //MiniMap.draw();
    //Crafty.e('Skelly').spawn(300, 300);
    //Crafty.e('Gobbo').spawn(950, 750);
});


Crafty.scene('Loading', function () {
    Crafty.background('black');

    Crafty.load(Game.assets,
        function () { // onLoad
            Crafty.enterScene('Game');
        },
        function (e) { // onProgress
            console.log(e);
        },
        function (e) { // onError
            console.log(e);
        }
    );
});
