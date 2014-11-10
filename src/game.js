Game = {
    TILE_WIDTH:  48,
    TILE_HEIGHT: 48,
    PLAYER_WIDTH: 45,
    PLAYER_HEIGHT: 45,
    MAP_WIDTH: 600,
    MAP_HEIGHT: 400,
    SEED: 928,

    start: function() {
        Crafty.init(48 * 20, 48 * 15);
        Crafty.background('black');
        Crafty.viewport.clampToEntities = false;
        Terrain.init();
        Player.init();
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
