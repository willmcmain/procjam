Game = {
    TILE_WIDTH:  48,
    TILE_HEIGHT: 48,
    PLAYER_WIDTH: 48,
    PLAYER_HEIGHT: 55,
    MAP_WIDTH: 300,
    MAP_HEIGHT: 300,
    SEED: 1928,

    start: function() {
        Crafty.init(1024, 768);
        Crafty.enterScene('Loading');
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
        },
    }
};


// Draw stuff on test canvas
Map = {
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
                var t = Terrain.tiles[Terrain.map[x][y]];
                imgdata.data[i+0] = t.rawcolor[0];
                imgdata.data[i+1] = t.rawcolor[1];
                imgdata.data[i+2] = t.rawcolor[2];
                imgdata.data[i+3] = 255;
            }
        }
        ctx.putImageData(imgdata,0,0);
    }
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
