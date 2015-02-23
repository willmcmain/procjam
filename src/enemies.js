Crafty.c('Health', {
    _health: 1,
    health: function(h) {
        this._health = h;
    },
    damage: function(d) {
        this._health -= d;
        if(this._health <= 0) {
            this.destroy();
        }
    },
});


Crafty.c('Enemy', {
    init: function() {
        this.requires('Entity, Collision, Health');
        this.attr({z: 10});
        this.health(20);
    },
});

Crafty.c('Skelly', {
    init: function() {
        this.requires('Enemy, spr_skelly')
            .collision([8, 0], [8, 55], [36, 55], [36, 00])
            ;
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
