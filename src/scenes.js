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
    var assets = [];
    for(var k in Game.assets) {
        assets.push(Game.assets[k]);
    }
    Crafty.load(assets, function () {
        Crafty.sprite(64, 72, Game.assets['player'], {
            spr_player: [0, 2],
        });
        Crafty.sprite(32, 36, Game.assets['enemies'], {
            spr_skelly: [0, 0],
            spr_gobbo:  [3, 0],
        });
        Crafty.sprite(64, 32, Game.assets['spear'], {
            spr_spear: [0, 0],
        });
        Crafty.scene('Game');
    });
});
