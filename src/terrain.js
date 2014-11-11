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
                var i = Math.floor(this.x / Game.TILE_WIDTH);
                var j = Math.floor(this.y / Game.TILE_HEIGHT);
                Terrain.map_loaded[i][j] = false;
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
        Terrain.map_loaded[x][y] = true;
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
Terrain.map_loaded = [];

Terrain.gen_map = function() {
    for(var x = 0; x < Game.MAP_WIDTH; x++) {
        this.map[x] = [];
        this.map_loaded[x] = [];
        for(var y = 0; y < Game.MAP_HEIGHT; y++) {
            this.map[x][y] = 0;
            this.map_loaded[x][y] = false;
            var v = Noise.simplex(x/30, y/30);
            if(v > 0.5 && v < 0.6) {
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
    this.load_visible();
    Crafty.bind('InvalidateViewport', this.load_visible);
}

Terrain.load_visible = function() {
    var xmin = Math.floor((-Crafty.viewport._x) / Game.TILE_WIDTH);
    var xmax = Math.ceil((-Crafty.viewport._x + Crafty.viewport._width)
        / Game.TILE_WIDTH);
    var ymin = Math.floor((-Crafty.viewport._y) / Game.TILE_HEIGHT);
    var ymax = Math.ceil((-Crafty.viewport._y + Crafty.viewport._height)
        / Game.TILE_HEIGHT);
    for(var x = Math.max(xmin,0); x<Math.min(xmax, Terrain.map.length); x++) {
        for(var y = Math.max(ymin,0); y<Math.min(ymax, Terrain.map[x].length); y++) {
            if(!Terrain.map_loaded[x][y]) {
                Crafty.e('Tile').tile(Terrain.map[x][y], x, y);
            }
        }
    }
}

})();
