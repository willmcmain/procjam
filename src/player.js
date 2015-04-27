var Player = {};
(function () {


Crafty.c('Entity', {
    init: function() {
        this.requires('2D, Canvas')
            //.requires('WiredHitBox')
            ;
    }
});


Crafty.c('Despawn', {
    init: function() {
        this.bind('InvalidateViewport', function() {
            xmax = -Crafty.viewport._x + Crafty.viewport._width;
            xmin = -Crafty.viewport._x - Game.TILE_WIDTH;
            ymax = -Crafty.viewport._y + Crafty.viewport._height;
            ymin = -Crafty.viewport._y - Game.TILE_HEIGHT;
            if(this.x > xmax || this.x < xmin
                || this.y > ymax || this.y < ymin) {
                this.destroy();
            }
        });
    },
});


Crafty.c('Player', {
    _timers: {iframes: 0, attack: 0},
    dir: 'down',
    init: function() {
        this.requires('Entity, Fourway, Collision, SpriteAnimation, Health')
            .requires('spr_player')
            .fourway(4)
            .attr({
                x: 700,
                y: 600,
                z: 10,
                w: Game.PLAYER_WIDTH,
                h: Game.PLAYER_HEIGHT})
            .collision([10,5], [10, 50], [38, 50], [38, 5])
            .onHit('Solid', this.stop)
            .reel('PlayerUp',    600, 0, 0, 1)
            .reel('PlayerRight', 600, 0, 1, 1)
            .reel('PlayerDown',  600, 0, 2, 1)
            .reel('PlayerLeft',  600, 0, 3, 1)
            .health(100)
            ;

        this.onHit('Enemy', function() {
            this.stop();
            this.damage(10);
        });

        this.damage = function(d) {
            if(this._timers.iframes == 0) {
                this._health -= d;
                console.log("HP: " + this._health);
                if(this._health <= 0) {
                    this.destroy();
                }
                this._timers.iframes = 50;
            }
        };

        this.bind('NewDirection', function(data) {
            if (data.x > 0) {
                this.animate('PlayerRight', -1);
                this.dir = 'right';
            }
            else if (data.x < 0) {
                this.animate('PlayerLeft', -1);
                this.dir = 'left';
            }
            else if (data.y > 0) {
                this.animate('PlayerDown', -1);
                this.dir = 'down';
            }
            else if (data.y < 0) {
                this.animate('PlayerUp', -1);
                this.dir = 'up';
            }
            else {
                this.pauseAnimation();
            }
        });

        this.bind('KeyDown', function(data) {
            if(data.key === Crafty.keys.ENTER) {
                this.attack();
            }
        });

        this.bind('EnterFrame', function(data) {
            if(this._timers['iframes'] > 0) {
                this._timers['iframes'] -= 1;
                if(this._timers.iframes % 5 == 0) {
                    this.visible = !this.visible;
                }
            }
            else {
                this.visible = true;
            }

            if(this._timers['attack'] > 0) {
                this._timers['attack'] -= 1;
            }
        });
    },

    stop: function() {
        this._speed = 0;
        if( this._movement ) {
            this.x -= this._movement.x;
            this.y -= this._movement.y;
        }
    },

    attack: function() {
        if(this._timers.attack == 0) {
            var x, y;
            switch(this.dir) {
                case 'up':
                    x = this.x + 8;
                    y = this.y - 16;
                    break;
                case 'down':
                    x = this.x + 8;
                    y = this.y + 32;
                    break;
                case 'right':
                    x = this.x + 32;
                    y = this.y + 14;
                    break;
                case 'left':
                    x = this.x - 16;
                    y = this.y + 14;
                    break;
            }
            Crafty.e('Arrow')
                .arrow(x, y, this.dir)
                .owner(this);
            this._timers.attack = 30;
        }
    },
});


Crafty.c('Arrow', {
    speed: 6.6,
    _damage: 10,
    _owner: null,
    init: function() {
        this.requires('Entity, Collision, Despawn, SpriteAnimation')
            .requires('spr_arrow')
            .reel('ArrowUp',    600, 0, 0, 1)
            .reel('ArrowRight', 600, 1, 0, 1)
            .reel('ArrowDown',  600, 0, 1, 1)
            .reel('ArrowLeft',  600, 1, 1, 1)
            .attr({z:9})
            ;
    },
    arrow: function(x, y, dir) {
        this.attr({x:x, y:y, dir:dir});
        switch(dir) {
            case 'up':
                this.animate('ArrowUp', -1)
                    .collision([10,0], [10, 32], [22, 32], [22, 0])
                    ;
                break;
            case 'down':
                this.animate('ArrowDown', -1)
                    .collision([10,0], [10, 32], [22, 32], [22, 0])
                    ;
                break;
            case 'left':
                this.animate('ArrowLeft', -1)
                    .collision([0,10], [0, 22], [32, 22], [32, 10])
                    ;
                break;
            case 'right':
                this.animate('ArrowRight', -1)
                    .collision([0,10], [0, 22], [32, 22], [32, 10])
                    ;
                break;
        }
        this.bind('EnterFrame', function() {
            switch(this.dir) {
                case 'up':
                    this.y -= this.speed;
                    break;
                case 'down':
                    this.y += this.speed;
                    break;
                case 'left':
                    this.x -= this.speed;
                    break;
                case 'right':
                    this.x += this.speed;
                    break;
            }
        });
        this.onHit('Enemy', function(objs) {
            that = this;
            $(objs).each(function() {
                if(this.obj != that._owner) {
                    this.obj.damage(that._damage);
                    that.destroy();
                }
            });
        });
        this.onHit('Player', function(objs) {
            that = this;
            $(objs).each(function() {
                if(this.obj == that._owner) {
                    return;
                }
                if(this.obj._timers.iframes == 0) {
                    this.obj.damage(that._damage);
                    that.destroy();
                }
            });
        });
        this.onHit('Solid', function() {
            this.destroy();
        });

        return this;
    },
    owner: function(o) {
        this._owner = o;
        return this;
    },
});


Crafty.c('Fireball', {
    _spd: 5.0,
    _damage: 10,
    _movement: {x: 0.0, y: 0.0},
    _owner: null,
    init: function() {
        this.requires('Entity, Collision, Despawn, SpriteAnimation')
            .requires('spr_fireball')
            .attr({z:9})
            ;
        this.bind('EnterFrame', function() {
            this.x += this._movement.x;
            this.y += this._movement.y;
        });
        this.onHit('Player', function(objs) {
            that = this;
            $(objs).each(function() {
                if(this.obj == that._owner) {
                    return;
                }
                if(this.obj._timers.iframes == 0) {
                    this.obj.damage(that._damage);
                    that.destroy();
                }
            });
        });
        this.onHit('Solid', function() {
            this.destroy();
        });
    },
    fireball: function(loc, dir) {
        this.attr({x: loc.x, y: loc.y});
        var mag = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        this._movement.x = dir.x * this._spd / mag;
        this._movement.y = dir.y * this._spd / mag;
        return this;
    },
});


Player.init = function () {
    this.player = Crafty.e('Player');
    Crafty.viewport.follow(this.player);
}

})();
