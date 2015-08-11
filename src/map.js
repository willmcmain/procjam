Map = {};

(function () {
/*******************************************************************************
 * Map Object
 ******************************************************************************/
Map.Map = function(map, w, h) {
    var _Map = {
        dungeon_id: null,
        map: map,
        entities: [],
        entrances: [],
        exit: null,
        loaded: null,
        tileset: null,

        init: function(w, h) {
            return this;
        },

        load: function() {
            this.loaded = Utils.array2d(w, h, false);
            this.load_visible();
            for(var i=0; i<this.entrances.length; i++) {
                var ent = this.entrances[i];
                Crafty.e('Entrance').entrance(ent.id, ent.x, ent.y);
            }
            if(this.exit !== null && this.dungeon_id !== null) {
                Crafty.e('Exit').exit(this.dungeon_id,
                    this.exit.x, this.exit.y);
            }

            var that = this;
            this._bind = Crafty.bind('InvalidateViewport', function() {
                that.load_visible();
            });
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

Map.tiles = {
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
    'wall': {
        name: 'wall',
        color: '#000000',
        solid: true,
        rawcolor: [0,0,0],
    },
    'floor': {
        name: 'floor',
        color: '#FFFFFF',
        rawcolor: [255,255,255],
    },
}


/*******************************************************************************
 * Crafty Components
 ******************************************************************************/
Crafty.c('Entrance', {
    SIZE: 2,
    init: function(id, x, y) {
        this.requires('2D, Collision')
            //.requires('Canvas, WiredHitBox')
            ;
        this.onHit('Player', function() {
            //console.log('Transition to dungeon #' + this.id);
            Crafty.enterScene('Dungeon', this.id);
        });
    },
    entrance: function(id, x, y) {
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


Crafty.c('Exit', {
    SIZE: 2,
    init: function(id, x, y) {
        this.requires('2D, Collision')
            //.requires('Canvas, WiredHitBox')
            ;
        this.onHit('Player', function() {
            //console.log('Return to overworld #' + this.id);
            Crafty.enterScene('Overworld', this.id);
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
        this.tile = Map.tiles[index];
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

})();
