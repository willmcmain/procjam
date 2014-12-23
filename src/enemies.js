Crafty.c('Enemy', {
    init: function() {
        this.requires('2D, Canvas, Solid');
    },
});

Crafty.c('Skelly', {
    init: function() {
        this.requires('Enemy, spr_skelly');
    },
    spawn: function(x, y) {
        this.attr({x: x, y: y, w: 48, h: 55});
    },
});

Crafty.c('Gobbo', {
    init: function() {
        this.requires('Enemy, spr_gobbo');
    },
    spawn: function(x, y) {
        this.attr({x: x, y: y, w: 48, h: 55});
    },
});
