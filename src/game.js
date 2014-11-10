Game = {
    TILE_WIDTH:  64,
    TILE_HEIGHT: 64,

    start: function() {
        Crafty.init(800, 600);
        Crafty.background('black');
        Terrain.init();
    }
};
