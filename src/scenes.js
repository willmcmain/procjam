Crafty.scene('Game', function () {
    Crafty.background('black');
    Crafty.viewport.clampToEntities = false;
    Player.init();
    Terrain.init();
    Map.draw();
    Crafty.e('Skelly').spawn(100, 100);
    Crafty.e('Gobbo').spawn(150, 150);
});


Crafty.scene('Loading', function () {
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
