Game = {
    TILE_WIDTH:  48,
    TILE_HEIGHT: 48,
    PLAYER_WIDTH: 48,
    PLAYER_HEIGHT: 55,
    MAP_WIDTH: 300,
    MAP_HEIGHT: 300,
    SEED: 1927,
    SCREEN: {w: 1024, h: 768},
    dungeons: {},

    current: null,

    start: function() {
        Noise.seed(this.SEED);
        Crafty.init(this.SCREEN.w, this.SCREEN.h);
        this.overworld = Overworld.generate(Game.MAP_WIDTH, Game.MAP_HEIGHT);
        this.overworld.entities.push(
            {type: 'Skelly', x: 13300, y: 4300, health: null});
        Crafty.enterScene('Loading');
    },

    set_map: function(map) {
        this.current = map;
        this.current.load();
    },

    assets: {
        "sprites": {
            "assets/player.png": {
                "tile": 64,
                "tileh": 72,
                "map": {
                    "spr_player": [0, 2],
                },
            },
            "assets/enemies.png": {
                "tile": 32,
                "tileh": 36,
                "map": {
                    "spr_skelly": [0, 0],
                    "spr_gobbo": [3, 0],
                },
            },
            "assets/arrow.png": {
                "tile": 32,
                "tileh": 32,
                "map": {
                    "spr_arrow": [0, 0],
                },
            },
            "assets/fireball.png": {
                "tile": 32,
                "tileh": 32,
                "map": {
                    "spr_fireball": [0, 0],
                },
            },
            "assets/tiles.png": {
                "tile": 48,
                "tileh": 48,
                "map": {
                    "tile_grass": [0, 0],
                    "tile_water": [1, 0],
                    "tile_town":  [2, 0],
                    "tile_wall":  [3, 0],
                    "tile_tree":  [0, 1],
                    "tile_rock":  [1, 1],
                    "tile_floor": [2, 1],
                    "tile_stairs":[3, 1],
                },
            },
        },
    }
};


// Draw stuff on test canvas
MiniMap = {
    draw: function() {
        var w = Terrain.map.length;
        var h = Terrain.map[0].length;

        var canvas = $('canvas#map')[0];
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        var imgdata = ctx.createImageData(w,h);
        for(var x=0; x<w; x++) {
            for(var y=0; y<h; y++) {
                var i = (y*w+x) * 4;
                var t = Map.tiles[Terrain.map[x][y]];
                imgdata.data[i+0] = t.rawcolor[0];
                imgdata.data[i+1] = t.rawcolor[1];
                imgdata.data[i+2] = t.rawcolor[2];
                imgdata.data[i+3] = 255;
            }
        }
        ctx.putImageData(imgdata,0,0);
    }
}


load_debug = function() {
    //Player.player.bind(
}


draw_test = function() {
    var lines = function(x, y) {
        return Math.sin(y) > 0.9 || Math.sin(x) > 0.9 ?1:-1;
    }
    var w = Game.MAP_WIDTH, h = Game.MAP_HEIGHT;
    var canvas = $('canvas#test1')[0];
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    var imgdata = ctx.createImageData(w,h);
    for(var x=0; x<w; x++) {
        for(var y=0; y<h; y++) {
            var noise = Noise.simplex(x/70, y/70);
            var ln = lines(x/5, (y+noise*7)/5);
            var val = ln > 0.5?-1:1;
            var scaled = (val+1) * (255/2);
            var i = (y*w+x) * 4;
            /*
            imgdata.data[i+0] = scaled;
            imgdata.data[i+1] = scaled;
            imgdata.data[i+2] = scaled;
            imgdata.data[i+3] = 255;
            */
        }
    }
    ctx.putImageData(imgdata,0,0);
}
