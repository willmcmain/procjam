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
            w: Game.TILE_WIDTH, h: Game.TILE_HEIGHT,
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
    },
});

// Terrain Module
Terrain.tiles = {
    'grass': {
        name: 'grass',
        color: '#00FF00',
        rawcolor: [0, 255, 0],
    },
    'water': {
        name: 'water',
        color: '#0000FF',
        //solid: true,
        rawcolor: [0, 0, 255],
    },
    'rock': {
        name: 'rock',
        color: '#88888',
        //solid: true,
        rawcolor: [136, 136, 136],
    },
    'tree': {
        name: 'tree',
        color: '#00AA00',
        solid: true,
        rawcolor: [0, 160, 0],
    },
    'town': {
        name: 'town',
        color: '#BF7900',
        solid: true,
        //rawcolor: [237, 221, 152],
        rawcolor: [191, 121, 0],
    },
    'stairs': {
        name: 'stairs',
        color: '#000000',
        rawcolor: [0,0,0],
    },
}

Terrain.map = [];
Terrain.map_loaded = [];

var array2d = function(w, h, def) {
    var array = [];
    for(var x = 0; x < w; x++) {
        array[x] = [];
        for(var y = 0; y < h; y++) {
            array[x][y] = def;
        }
    }
    return array;
}

var gen_terrain = function(map) {
    for(var x = 0; x < map.length; x++) {
        for(var y = 0; y < map[x].length; y++) {
            // Large forests
            if(Noise.simplex(x/30, y/30) > 0.5) {
                map[x][y] = 'tree';
            }
            // Small trees
            if(Noise.simplex(x/3, y/3) > 0.8) {
                map[x][y] = 'tree';
            }
            // Water
            if(Noise.simplex((x+100)/77, (y+300)/75) > 0.4) {
                map[x][y] = 'water';
            }
        }
    }
    return map;
}

var gen_dungeon_entrances = function(map) {
    var n = 3;
    var entrances = [];
    while(entrances.length < n) {
        var w = map.length
          , h = map[0].length
          , dot = Noise.uniformint(0, w*h)
          , y = Math.floor(dot/w)
          , x = dot - (y * w);
        if(!(map[x][y] == 'water' || map[x][y] == 'tree') ) {
            entrances.push([x,y]);
            map[x][y] = 'stairs';
        }
    }
    return map;
}

var gen_villages = function(map) {
    var n = Noise.uniformint(15, 20);
    var towns = [];
    while(towns.length < n) {
        var w = map.length
          , h = map[0].length
          , dot = Noise.uniformint(0, w * h)
          , y = Math.floor(dot/w)
          , x = dot - (y * w);
        if(map[x][y] != 'water') {
            towns.push([x, y]);
            map = gen_village(map, x, y);
        }
    }
    return map;
}

var gen_village = function(map, vx, vy) {
    var n_buildings = Noise.uniformint(3, 5);
    var buildings = [];
    for(var i=0; i<n_buildings; i++) {
        var b = gen_building();
        var dist = Noise.uniformint(10,25);
        var theta = Noise.uniformint(0,360) * Math.PI / 180;
        var rx = Math.floor(dist * Math.cos(theta));
        var ry = Math.floor(dist * Math.sin(theta));
        map = place_building(map, b, vx+rx, vy+ry);
    }
    return map;
}

var gen_building = function() {
    var w = Noise.uniformint(4, 6)
      , h = Noise.uniformint(w-1, w)
      , building = array2d(w, h, 'town');
    return building;
}

var place_building = function(map, building, x, y) {
    // Check placement
    for(var i=0; i<building.length; i++) {
        for(var j=0; j<building[0].length; j++) {
            if(i+x<0 || j+y<0 || i+x>=map.length || j+y>=map[0].length) {
                return map;
            }
        }
    }

    for(var i=0; i<building.length; i++) {
        for(var j=0; j<building[0].length; j++) {
            map[i+x][j+y] = building[i][j];
        }
    }
    return map;
}

Terrain.gen_area = function(w, h) {
    var map = array2d(w, h, 'grass');
    map = gen_terrain(map);
    map = gen_villages(map);
    map = gen_dungeon_entrances(map);
    return map;
}

Terrain.init = function() {
    this.map = this.gen_area(Game.MAP_WIDTH, Game.MAP_HEIGHT);
    this.map_loaded = array2d(Game.MAP_WIDTH, Game.MAP_HEIGHT, false);
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
        for(var y = Math.max(ymin,0);
                y<Math.min(ymax, Terrain.map[x].length); y++) {
            if(!Terrain.map_loaded[x][y]) {
                Crafty.e('Tile').tile(Terrain.map[x][y], x, y);
            }
        }
    }
}

})();
