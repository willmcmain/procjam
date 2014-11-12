Crafty.scene('Game', function () {
    Crafty.background('black');
    Crafty.viewport.clampToEntities = false;
    Player.init();
    Terrain.init();
    Map.draw();
});

Crafty.scene('Loading', function () {
    Crafty.load([Game.assets.player], function () {
        Crafty.sprite(64, 72, Game.assets['player'], {
            spr_player: [0, 2],
        });
        Crafty.scene('Game');
    });
});
