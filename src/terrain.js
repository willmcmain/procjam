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

        this.bind('InvalidateViewport', function() {
            xmax = -Crafty.viewport._x + Crafty.viewport._width;
            xmin = -Crafty.viewport._x - Game.TILE_WIDTH;
            ymax = -Crafty.viewport._y + Crafty.viewport._height;
            ymin = -Crafty.viewport._y - Game.TILE_HEIGHT;
            if(this.x > xmax || this.x < xmin
                || this.y > ymax || this.y < ymin) {
                this.destroy();
            }
        });
    },
    tile: function(index, x, y) {
        this.tile = Terrain.tiles[index];
        this.color(this.tile.color);
        this.attr({ x: x * Game.TILE_WIDTH, y:  y * Game.TILE_HEIGHT });
        if(this.tile.solid) {
            this.requires('Solid');
        }
    }
});

// Terrain Module
Terrain.tiles = {
    0: {
        name: 'grass',
        color: '#0F0',
        rawcolor: [0, 255, 0],
    },
    1: {
        name: 'water',
        color: '#00F',
        solid: true,
        rawcolor: [0, 0, 255],
    },
    2: {
        name: 'rock',
        color: '#888',
        solid: true,
        rawcolor: [136, 136, 136],
    }
}

Terrain.map = [];

Terrain.gen_map = function() {
    for(var x = 0; x < Game.MAP_WIDTH; x++) {
        this.map[x] = [];
        for(var y = 0; y < Game.MAP_HEIGHT; y++) {
            this.map[x][y] = 0;
            if(Noise.simplex(x/30, y/30) > 0.5) {
                this.map[x][y] = 2;
            }
            if(Noise.simplex((x+100)/50, (y+300)/50) > 0.4) {
                this.map[x][y] = 1;
            }
        }
    }
}

Terrain.init = function() {
    this.gen_map();
    for(var x = 0; x < this.map.length; x++) {
        for(var y = 0; y < this.map[x].length; y++) {
            //Crafty.e('Tile').tile(this.map[x][y], x, y);
        }
    }
}

})();
