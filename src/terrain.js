var Terrain = {};
(function () {

// Crafty Components
Crafty.c('Grid', {
    init: function() {
    },
});


Crafty.c('Tile', {
    init: function() {
        this.requires('2D, Canvas, Color');
        this.attr({
            w: Game.TILE_WIDTH,
            h: Game.TILE_HEIGHT,
        });
    },
    tile: function(index, x, y) {
        this.tile = Terrain.tiles[index];
        this.color(this.tile.color);
        this.attr({ x: x * Game.TILE_WIDTH, y:  y * Game.TILE_HEIGHT });
    }
});

// Terrain Module
Terrain.tiles = {
    0: {
        name: 'grass',
        color: '#0F0',
    },
    1: {
        name: 'water',
        color: '#00F',
    },
    2: {
        name: 'rock',
        color: '#888',
    }
}

Terrain.map = [],

Terrain.init_map = function() {
    for(var x = 0; x < 30; x++) {
        this.map[x] = [];
        for(var y = 0; y < 30; y++) {
            this.map[x][y] = Random.randint(0,2);
        }
    }
}

Terrain.init = function() {
    this.init_map();
    for(var x = 0; x < this.map.length; x++) {
        for(var y = 0; y < this.map[x].length; y++) {
            Crafty.e('Tile').tile(this.map[x][y], x, y);
        }
    }
}

})();
