Terrain = {};

(function () {
Crafty.c('Exit', {
    SIZE: 2,
    init: function(id, x, y) {
        this.requires('2D, Collision')
            //.requires('Canvas, WiredHitBox')
            ;
        this.onHit('Player', function() {
            console.log('Transition to dungeon #' + this.id);
        });
    },
    exit: function(id, x, y) {
        this.id = id;
        this.attr({
                x: (x * Game.TILE_WIDTH) + (Game.TILE_WIDTH/2) - this.SIZE/2,
                y: (y * Game.TILE_HEIGHT) + (Game.TILE_HEIGHT/2) - this.SIZE/2,
                w: this.SIZE,
                h: this.SIZE,
            });
        return this;
    },
});

/*******************************************************************************
 * Map Object
 ******************************************************************************/
Terrain.Map = function(map, w, h) {
    var _Map = {
        map: map,
        entities: [],
        exits: [],
        loaded: null,
        tileset: null,

        init: function(w, h) {
            this.loaded = Utils.array2d(w, h, false);

            return this;
        },

        load: function() {
            this.load_visible();
            var that = this;
            this._bind = Crafty.bind('InvalidateViewport', function() {
                that.load_visible();
            });

            // Exits
            var id = 0;
            for(var x=0; x<w; x++) {
                for(var y=0; y<h; y++) {
                    if(this.map[x][y] == 'stairs') {
                        this.exits.push(
                            Crafty.e('Exit').exit(id, x, y)
                            );
                        id++;
                    }
                }
            }
        },

        unload: function() {
            Crafty.unbind('InvalidateViewport', this._bind);
        },

        load_visible: function() {
            var xmin = Math.floor((-Crafty.viewport._x) / Game.TILE_WIDTH);
            var xmax = Math.ceil((-Crafty.viewport._x + Crafty.viewport._width)
                / Game.TILE_WIDTH);
            var ymin = Math.floor((-Crafty.viewport._y) / Game.TILE_HEIGHT);
            var ymax = Math.ceil((-Crafty.viewport._y + Crafty.viewport._height)
                / Game.TILE_HEIGHT);
            for(var x = Math.max(xmin,0); x<Math.min(xmax, this.map.length);
                    x++) {
                for(var y = Math.max(ymin,0);
                        y<Math.min(ymax, this.map[x].length); y++) {
                    if(!this.loaded[x][y]) {
                        Crafty.e('Tile')
                            .owner(this)
                            .tile(this.map[x][y], x, y)
                            ;
                    }
                }
            }
        },
    };
    return Object.create(_Map).init(w, h);
};


/*******************************************************************************
 * Crafty Components
 ******************************************************************************/
Crafty.c('Tile', {
    _owner: null,
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
                this._owner.loaded[i][j] = false;
            }
        });
    },
    tile: function(index, x, y) {
        this.tile = Terrain.tiles[index];
        this.color(this.tile.color);
        this.requires('tile_' + index);
        this.attr({ x: x * Game.TILE_WIDTH, y:  y * Game.TILE_HEIGHT });
        if(this.tile.solid) {
            this.requires('Collision, Solid');
        }
        this._owner.loaded[x][y] = true;
        return this;
    },
    owner: function(o) {
        this._owner = o;
        return this;
    }
});


/*******************************************************************************
 * Terrain Module
 ******************************************************************************/
Terrain.tiles = {
    'grass': {
        name: 'grass',
        color: '#008800',
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
        color: '#888888',
        //solid: true,
        rawcolor: [136, 136, 136],
    },
    'tree': {
        name: 'tree',
        color: '#005500',
        solid: true,
        rawcolor: [0, 160, 0],
    },
    'town': {
        name: 'town',
        color: '#BF7900',
        solid: true,
        rawcolor: [191, 121, 0],
    },
    'stairs': {
        name: 'stairs',
        color: '#000000',
        rawcolor: [0,0,0],
    },
}


/******************************************************************************
 * Overworld Generation
 *****************************************************************************/
Terrain.gen_area = function(w, h) {
    var map = Utils.array2d(w, h, 'grass');
    map = gen_terrain(map);
    map = gen_villages(map);
    map = gen_dungeon_entrances(map);
    return map;
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
      , building = Utils.array2d(w, h, 'town');
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

})();
