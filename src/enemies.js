Crafty.c('Health', {
    _health: 1,
    _ondmg: function() {},

    health: function(h) {
        this._health = h;
    },

    damage: function(d) {
        this._health -= d;
        this._ondmg();
        if(this._health <= 0) {
            this.destroy();
        }
    },

    on_dmg: function(f) {
        this._ondmg = f;
    }
});


Crafty.c('Enemy', {
    init: function() {
        this.requires('Entity, Collision, Health');
        this.attr({z: 10});
        this.health(20);
    },
});


Crafty.c('AI', {
    init: function() {
        var frame = 0;
        this.bind('EnterFrame', function() {
            this.ai(frame);
            frame += 1;
        });
    },
});


Crafty.c('Skelly', {
    _speed: 2.0,
    _dir: 'down',
    init: function() {
        this.requires('Enemy, AI, spr_skelly')
            .collision([8, 0], [8, 55], [36, 55], [36, 00])
            ;
    },

    spawn: function(x, y) {
        this.attr({x: x, y: y, w: 48, h: 55});
    },

    aix: function(frame) {
        var dirs = ['up', 'down', 'left', 'right'];
        if(frame % 60 == 0) {
            this._dir = dirs[Random.randint(0,3)];
        }

        switch(this._dir) {
            case 'up':
                this.y -= this._speed;
                break;
            case 'down':
                this.y += this._speed;
                break;
            case 'left':
                this.x -= this._speed;
                break;
            case 'right':
                this.x += this._speed;
                break;
        }
    },

    ai: function(frame) {
        var player = Crafty("Player");
        var dist = Math.sqrt(
            Math.pow(player.x-this.x, 2) + Math.pow(player.y-this.y, 2));
        var state = dist < 600 ? "attack" : "wander";

        switch(state) {
            case "attack":
                break;
            case "wander":
                break;
            default:
                break;
        }
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
