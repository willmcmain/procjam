// BSP Dungeon Generation
BSP = function(val) {
    return {
        value: val,
        children: null,
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
        get_rooms: function() {
            if(this.children === null) {
                return [this.value.space];
            }
            else {
                return this.children[0].get_rooms()
                    .concat(this.children[1].get_rooms());
            }
        },
    };
};

Dungeon = {};

(function() {
Dungeon.make_root = function(w, h) {
    var val = {
        space: {x: 0, y: 0, w: w, h: h},
    }
    var tree = BSP(val);
    return tree;
};

var SPREAD = 0.25;
Dungeon.split_tree = function(tree) {
    var space = tree.value.space;
    if(space.w < 10 || space.h < 10) {
        return null;
    }
    //var dir = Random.randint(0,1) ? 'v' : 'h';
    if(space.w > space.h) {
        var dir = 'v';
    }
    else {
        var dir = 'h';
    }

    var ret = [];
    if(dir == 'v') {
        var center = Math.floor(space.w / 2);
        var spread = Math.floor(space.w * SPREAD);
        var split = Random.randint(center-spread, center+spread);
        var first  = {x: space.x, y: space.y, w: split, h: space.h}
        var second = {x: space.x+split, y: space.y,
                      w: space.w-split, h: space.h}
    }
    else if(dir == 'h') {
        var center = Math.floor(space.h / 2);
        var spread = Math.floor(space.h * SPREAD);
        var split = Random.randint(center-spread, center-spread);
        var first  = {x: space.x, y: space.y, w: space.w, h: split }
        var second = {x: space.x, y: space.y+split,
                      w: space.w, h: space.h-split}
    }
    tree.value.dir = dir;
    tree.value.split = split;
    first  = BSP({space: first});
    second = BSP({space: second});
    tree.set_children(first, second);

    return tree.children;
};

Dungeon.gen_tree = function(w, h) {
    var tree = Dungeon.make_root(w, h);
    var nodes = [tree];

    for(var i = 0; i < 4; i++) {
        var next_nodes = [];
        for(var j = 0; j < nodes.length; j++) {
            var leaves = Dungeon.split_tree(nodes[j]);
            if(leaves !== null) {
                next_nodes = next_nodes.concat(leaves);
            }
        }
        nodes = next_nodes;
    }

    return tree;
};

Dungeon.print_tree = function(tree) {
    var i, y;
    var width = tree.value.space.w;
    var height = tree.value.space.h;
    var canvas = $('#test1')[0];
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');
    var imgdata = context.createImageData(width, height);
    var rooms = tree.get_rooms();
    var room;


    for(var r=0; r<rooms.length; r++) {
        room = rooms[r];
        for(var x=room.x; x<(room.x+room.w); x++) {
            y = room.y;
            // Top
            i = (y*width+x) * 4;
            imgdata.data[i+0] = 0;
            imgdata.data[i+1] = 0;
            imgdata.data[i+2] = 0;
            imgdata.data[i+3] = 255;

            // Bottom
            y = (room.y+room.h-1);
            i = (y*width+x) * 4;
            imgdata.data[i+0] = 0;
            imgdata.data[i+1] = 0;
            imgdata.data[i+2] = 0;
            imgdata.data[i+3] = 255;

            // Left/Right
            if(x == room.x || x == (room.x+room.w-1)) {
                for(y = room.y; y<(room.y+room.h); y++) {
                    i = (y*width+x) * 4;
                    imgdata.data[i+0] = 0;
                    imgdata.data[i+1] = 0;
                    imgdata.data[i+2] = 0;
                    imgdata.data[i+3] = 255;
                }
            }
        }
    }

    context.putImageData(imgdata, 0, 0);
};

})()
