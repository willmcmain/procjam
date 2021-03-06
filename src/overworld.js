Overworld = {};

(function () {
/******************************************************************************
 * Overworld Generation
 *****************************************************************************/
Overworld.generate = function(w, h) {
    var gmap = gen_area(w, h);
    var map = Map.Map(gmap, w, h);

    // Dungeon entrances
    var id = 0;
    for(var x=0; x<w; x++) {
        for(var y=0; y<h; y++) {
            if(gmap[x][y] == 'stairs') {
                map.entrances.push( {id:id, x:x, y:y} );
                id++;
            }
        }
    }

    // Monsters
    // Split world into 15x15 cells and generate monsters in each cell
    var CELLW = 15;
    var CELLH = 15;
    for(var x=0; x<(w/CELLW); x++) {
        for(var y=0; y<(h/CELLH); y++) {
            var num = Noise.random() < 0.7 ? Poisson.poisson(2) : 0;
            var type = Noise.randomchoice(['Skelly', 'Gobbo']);

            for(var i=0; i<num; i++) {
                var cx = Utils.clamp(x * CELLW + Noise.uniformint(0, 7),
                    0, Game.MAP_WIDTH-1);
                var cy = Utils.clamp(y * CELLH + Noise.uniformint(0, 7),
                    0, Game.MAP_HEIGHT-1);
                if(gmap[cx][cy] == 'grass') {
                    var dat = {
                        type: type,
                        x: cx * Game.TILE_WIDTH,
                        y: cy * Game.TILE_HEIGHT,
                        health: null
                    };
                    map.entities.push(dat);
                }
            }
        }
    }
    return map;
};


var gen_area = function(w, h) {
    var map = Utils.array2d(w, h, 'grass');
    map = gen_terrain(map);
    map = gen_villages(map);
    map = gen_dungeon_entrances(map);
    return map;
};


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

            // Put trees around the borders
            if(x == 0 || y == 0 || x == map.length-1 || y == map[x].length-1) {
                map[x][y] = 'tree';
            }
        }
    }
    return map;
}


var gen_dungeon_entrances = function(map) {
    var n = 5;
    var entrances = [];
    while(entrances.length < n) {
        var w = map.length
          , h = map[0].length
          , dot = Noise.uniformint(2, w*h-2)
          , y = Math.floor(dot/w)
          , x = dot - (y * w);
        if(!(map[x][y] == 'water' || map[x][y] == 'tree') ) {
            entrances.push([x,y]);
            map[x][y] = 'stairs';
            map[x][y+1] = 'grass';
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
