Dungeon = {};

(function() {
Dungeon.generate = function(w, h) {
    var d = Dungeon.Dungeon(w, h);
    d.generate();
    var map = Map.Map(d.map, w, h);
    map.exit = d.exit;
    map.entities = d.entities;
    console.log(map.entities);
    return map;
};


SPREAD = 0.25;

BSPTree = {
    value: null,
    children: null,

    init: function(val) {
        this.value = val;
        return this;
    },

    set_children: function(child1, child2) {
        this.children = [child1, child2];
    },

    print: function() {
        return (
            "[" + this.value + ": ("
            + (this.children ? this.children[0].print() : 'null')
            + ', '
            + (this.children ? this.children[1].print() : 'null')
            + ")]"
        );
    },

    get_spaces: function() {
        if(this.children === null) {
            return [this.value.space];
        }
        else {
            return this.children[0].get_spaces()
                .concat(this.children[1].get_spaces());
        }
    },

    split: function() {
        var space = this.value.space;
        if(space.w < 10 || space.h < 10) {
            return null;
        }
        if(space.w > space.h) {
            var dir = 'v';
        }
        else if(space.w < space.h) {
            var dir = 'h';
        }
        else {
            var dir = Noise.uniformint(0,1) ? 'v' : 'h';
        }

        var ret = [];
        if(dir == 'v') {
            var center = Math.floor(space.w / 2);
            var spread = Math.floor(space.w * SPREAD);
            var split = Noise.uniformint(center-spread, center+spread);
            var first  = {x: space.x, y: space.y, w: split, h: space.h}
            var second = {x: space.x+split, y: space.y,
                          w: space.w-split, h: space.h}
        }
        else if(dir == 'h') {
            var center = Math.floor(space.h / 2);
            var spread = Math.floor(space.h * SPREAD);
            var split = Noise.uniformint(center-spread, center+spread);
            var first  = {x: space.x, y: space.y, w: space.w, h: split }
            var second = {x: space.x, y: space.y+split,
                          w: space.w, h: space.h-split}
        }
        this.value.dir = dir;
        this.value.split = split;
        this.children = [
            Object.create(BSPTree).init({space: first}),
            Object.create(BSPTree).init({space: second})
        ];

        return this.children;
    },
};


Dungeon._Dungeon = {
    map: null,
    tree: null,
    rooms: null,
    tunnels: null,
    exit: null,
    entities: [],

    init: function(w, h) {
        this.w = w;
        this.h = h;
        return this;
    },

    generate: function() {
        this.gen_tree();
        this.gen_rooms();
        this.gen_tunnels();
        this.gen_map();
        this.gen_monsters();
    },

    gen_map: function() {
        // Create empty map
        var map = [];
        for(var x=0; x < this.w; x++) {
            var row = [];
            for(var y=0; y < this.h; y++) {
                row.push('wall');
            }
            map.push(row);
        }
        // Carve rooms
        for(var i=0; i < this.rooms.length; i++) {
            var room = this.rooms[i];
            for(var x=room.x; x<(room.x+room.w); x++) {
                for(var y=room.y; y<(room.y+room.h); y++) {
                    map[x][y] = 'floor';
                }
            }
        }
        // Carve tunnels
        for(var i=0; i < this.tunnels.length; i++) {
            var tun = [
                {x: this.tunnels[i][0][0], y: this.tunnels[i][0][1]},
                {x: this.tunnels[i][1][0], y: this.tunnels[i][1][1]},
            ];
            // Vertical
            if(tun[0].x == tun[1].x) {
                for(var y = tun[0].y; y < tun[1].y; y++) {
                    for(var x = tun[0].x - 1; x < tun[0].x + 1; x++) {
                        map[x][y] = 'floor';
                    }
                }
            }
            // Horizontal
            else if(tun[0].y == tun[1].y) {
                for(var x = tun[0].x; x < tun[1].x; x++) {
                    for(var y = tun[0].y - 1; y < tun[0].y + 1; y++) {
                        map[x][y] = 'floor';
                    }
                }
            }
        }
        // Create exit
        var room = this.rooms[0];
        this.exit = {
            x: Math.floor(room.x + room.w / 2),
            y: Math.floor(room.y + room.h / 2),
        }
        map[this.exit.x][this.exit.y] = 'stairs'
        this.map = map;
    },

    gen_tunnels: function() {
        this.tunnels = this._r_gen_tunnels(this.tree, 0);
    },

    _r_gen_tunnels: function(tree, level) {
        var tunnels = [];

        if(tree.children === null) {
            return [];
        }
        var s0 = tree.children[0].value.space;
        var s1 = tree.children[1].value.space;
        var tun = [[s0.x + Math.floor(s0.w / 2), s0.y + Math.floor(s0.h / 2)],
                   [s1.x + Math.floor(s1.w / 2), s1.y + Math.floor(s1.h / 2)]];

        return [tun].concat(
            this._r_gen_tunnels(tree.children[0], level+1),
            this._r_gen_tunnels(tree.children[1], level+1)
        );
    },

    gen_rooms: function() {
        var spaces = this.tree.get_spaces();
        this.rooms = [];
        for(var i = 0; i < spaces.length; i++) {
            var vspread = Noise.uniformint(5,20) / 100;
            var hspread = vspread;
            var vspace = Math.max(vspread * spaces[i].h, 1);
            var hspace = Math.max(hspread * spaces[i].w, 1);

            var room = {
                x: Math.floor(spaces[i].x + hspace),
                y: Math.floor(spaces[i].y + vspace),
                w: Math.floor(spaces[i].w - 2*hspace),
                h: Math.floor(spaces[i].h - 2*vspace),
            };
            this.rooms.push(room);
        }
    },

    gen_tree: function() {
        this.tree = Object.create(BSPTree).init(
            {space: {x: 0, y: 0, w: this.w, h: this.h}}
        );
        var nodes = [this.tree];

        for(var i = 0; i < 4; i++) {
            var next_nodes = [];
            for(var j = 0; j < nodes.length; j++) {
                var leaves = nodes[j].split();
                if(leaves !== null) {
                    next_nodes = next_nodes.concat(leaves);
                }
            }
            nodes = next_nodes;
        }
    },

    gen_monsters: function() {
        for(var i = 0; i < this.rooms.length; i++) {
            var room = this.rooms[i];
            var cx = room.x + room.w / 2;
            var cy = room.y + room.h / 2;
            var num = Poisson.poisson(3);
            console.log(num);
            for (var n = 0; n < num; n++) {
                var dat = {
                    type: 'Gobbo',
                    x: cx + Noise.uniformint(-30, 30),
                    y: cy + Noise.uniformint(-30, 30),
                    health: null
                };
                this.entities.push(dat);
            }
        }
    },
};

Dungeon.Dungeon = function(w, h) {
    var obj = Object.create(Dungeon._Dungeon);
    obj.init(w, h);
    return obj;
}


Canvas = function(id, w, h) {
    var canvas = $(id)[0];
    canvas.width = w;
    canvas.height = h;

    var _Canvas = {
        _canvas: canvas,
        width: w,
        height: h,
        context: canvas.getContext('2d'),
        init: function() {
            this.imgdata = this.context.createImageData(
                this.width, this.height);
            return this;
        },
        set_pixel: function(x, y, color) {
            var i = (y*this.width+x) * 4;
            this.imgdata.data[i+0] = color.r;
            this.imgdata.data[i+1] = color.g;
            this.imgdata.data[i+2] = color.b;
            this.imgdata.data[i+3] = 255;
        },
        draw: function() {
            this.context.putImageData(this.imgdata, 0, 0);
        },
    };

    return Object.create(_Canvas).init();
};


Dungeon._Dungeon.draw = function() {
    var canvas = Canvas('#test1', this.w, this.h);
    var tree = this.tree;
    var spaces = tree.get_spaces();
    var y;

    // Draw spaces in black
    for(var s=0; s<spaces.length; s++) {
        var space = spaces[s];
        for(var x=space.x; x<(space.x+space.w); x++) {
            // Top
            y = space.y;
            canvas.set_pixel(x, y, {r:0, g:0, b:0});
            // Bottom
            y = (space.y+space.h-1);
            canvas.set_pixel(x, y, {r:0, g:0, b:0});
            // Left/Right
            if(x == space.x || x == (space.x+space.w-1)) {
                for(y = space.y; y<(space.y+space.h); y++) {
                    canvas.set_pixel(x, y, {r:0, g:0, b:0});
                }
            }
        }
    }

    // Draw rooms in blue
    for(var r=0; r<this.rooms.length; r++) {
        var room = this.rooms[r];
        for(var x=room.x; x<(room.x+room.w); x++) {
            // Top
            y = room.y;
            canvas.set_pixel(x, y, {r:0, g:0, b:255});
            // Bottom
            y = (room.y+room.h-1);
            canvas.set_pixel(x, y, {r:0, g:0, b:255});
            // Left/Right
            if(x == room.x || x == (room.x+room.w-1)) {
                for(y = room.y; y<(room.y+room.h); y++) {
                    canvas.set_pixel(x, y, {r:0, g:0, b:255});
                }
            }
        }
    }
    canvas.draw();

    for(var t = 0; t < this.tunnels.length; t++) {
        var tun = this.tunnels[t];
        canvas.context.strokeStyle = '#FF0000';
        canvas.context.moveTo(tun[0][0], tun[0][1]);
        canvas.context.lineTo(tun[1][0], tun[1][1]);
        canvas.context.stroke();
    }
};


Dungeon._Dungeon.draw_map = function() {
    var map = this.map;
    canvas = Canvas('#test1', this.w, this.h);

    for(var x=0; x < this.w; x++) {
        for(var y=0; y < this.h; y++) {
            switch(map[x][y]) {
                case 'wall':
                    canvas.set_pixel(x, y, {r:0, g:0, b:0});
                    break;
                case 'floor':
                    canvas.set_pixel(x, y, {r:255, g:255, b:255});
                    break;
            }
        }
    }

    canvas.draw();
};

})()
