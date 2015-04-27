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
    _movement: {x:0, y:0},
    _timers: {attack: 0},
    init: function() {
        this.requires('Enemy, AI, spr_skelly')
            .collision([8, 0], [8, 55], [36, 55], [36, 00])
            .onHit('Solid', this.stop)
            ;
        this.bind('EnterFrame', function(data) {
            this.x += this._movement.x;
            this.y += this._movement.y;
        });

        this.bind('EnterFrame', function(data) {
            if(this._timers.attack > 0) {
                this._timers.attack -= 1;
            }
        });
    },

    stop: function() {
        if( this._movement ) {
            this.x -= this._movement.x;
            this.y -= this._movement.y;
        }
        this._movement = {x: 0, y: 0};
    },

    spawn: function(x, y) {
        this.attr({x: x, y: y, w: 48, h: 55});
    },

    movementxy: function(dir, spd) {
        var n = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        var nx = dir.x / n;
        var ny = dir.y / n;

        this._movement.x = nx * spd;
        this._movement.y = ny * spd;
    },

    attack: function(dir) {
        if(this._timers.attack == 0) {
            Crafty.e('Arrow')
                .arrow(this.x, this.y, dir)
                .owner(this);
            this._timers.attack = 15;
        }
    },

    ai: function(frame) {
        var player = Crafty("Player");
        if(player.length == 0) {
            return;
        }
        var dist = Math.sqrt(
            Math.pow(player.x-this.x, 2) + Math.pow(player.y-this.y, 2));
        var state = dist < 400 ? "attack" : "wander";
        var pvector = {x: player.x - this.x, y: player.y - this.y};

        var pdir = null;
        if(Math.abs(pvector.x) < 15) {
            pdir = pvector.y > 0 ? "down" : "up"
        }
        else if(Math.abs(pvector.y) < 15) {
            pdir = pvector.x > 0 ? "right" : "left"
        }

        switch(state) {
            case "attack":
                var neg = {x: -pvector.x, y: -pvector.y};
                this.movementxy(neg, 1.5);
                if(pdir !== null) {
                    this.attack(pdir);
                }
                break;
            case "wander":
                this.movementxy(pvector, 0);
                break;
            default:
                break;
        }
    },
});


Crafty.c('Gobbo', {
    _speed: 2.0,
    _movement: {x:0, y:0},
    _timers: {attack: 0},
    init: function() {
        this.requires('Enemy, AI, spr_gobbo')
            .onHit('Solid', this.stop)
            ;

        this.bind('EnterFrame', function(data) {
            this.x += this._movement.x;
            this.y += this._movement.y;
        });

        this.bind('EnterFrame', function(data) {
            if(this._timers.attack > 0) {
                this._timers.attack -= 1;
            }
        });
    },

    spawn: function(x, y) {
        this.attr({x: x, y: y, w: 48, h: 55});
    },

    stop: function() {
        if( this._movement ) {
            this.x -= this._movement.x;
            this.y -= this._movement.y;
        }
        this._movement = {x: 0, y: 0};
    },

    movementxy: function(dir, spd) {
        var n = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        var nx = dir.x / n;
        var ny = dir.y / n;

        this._movement.x = nx * spd;
        this._movement.y = ny * spd;
    },

    attack: function(dir) {
        var f = Crafty.e('Fireball').fireball({x: this.x, y: this.y}, dir);
        f._owner = this;
    },

    ai: function(frame) {
        var player = Crafty("Player");
        if(player.length == 0) {
            return;
        }
        var dist = Math.sqrt(
            Math.pow(player.x-this.x, 2) + Math.pow(player.y-this.y, 2));
        var state = dist < 400 ? "attack" : "wander";
        var pvector = {x: player.x - this.x, y: player.y - this.y};

        var pdir = null;
        if(Math.abs(pvector.x) < 15) {
            pdir = pvector.y > 0 ? "down" : "up"
        }
        else if(Math.abs(pvector.y) < 15) {
            pdir = pvector.x > 0 ? "right" : "left"
        }

        switch(state) {
            case "attack":
                var neg = {x: -pvector.x, y: -pvector.y};
                this.movementxy(neg, 1.5);
                if(this._timers.attack == 0) {
                    this.attack(pvector);
                    this._timers.attack = 30;
                }
                break;
            case "wander":
                this.movementxy(pvector, 0);
                break;
            default:
                break;
        }
    },
});
