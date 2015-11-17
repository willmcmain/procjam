var Player = {};
(function () {
rgb = function(r, g, b, a) {
    var data = {r: r, g: g, b: b, a: a}
    if(typeof a === 'undefined') {
        data.a = 255;
    }
    return data;
};


Crafty.c('Entity', {
    init: function() {
        this.requires('2D, Canvas')
            //.requires('WiredHitBox')
            ;
    }
});


Crafty.c('BaseHeart', {
    _pos: {x: 0, y: 0},
    init: function() {
        this.requires('2D, Canvas, Persist')
            .attr({
                w: 32,
                h: 32,
                z: 30
            });
        this.scrnpos(0, 0);

        this.bind('InvalidateViewport', function() {
            this._setxy();
        });
    },

    scrnpos: function(x, y) {
        this._pos = {};
        this._pos.x = x;
        this._pos.y = y;
        this._setxy();
        return this;
    },

    _setxy: function() {
        this.x = this._pos.x - Crafty.viewport.x;
        this.y = this._pos.y - Crafty.viewport.y;
    },
});


Crafty.c('Heart', {
    init: function() {
        this.requires('BaseHeart, Persist, spr_heart');
    },
});


Crafty.c('EmptyHeart', {
    init: function() {
        this.requires('BaseHeart, spr_emptyheart');
    },
});


Crafty.c('Torch', {
    init: function() {
        this.requires('2D, Canvas, Collision, spr_torch')
            //.requires('WiredHitBox')
            .attr({
                z: 11,
                w: 24,
                h: 48,
            });
        this.onHit('Player', function(cols) {
            var player = cols[0].obj;
            player.inc_light_level();
            this.destroy();
            if(player.light_level() >= 5) {
                player.lock();
                Crafty.e('Win');
            };
        });
    },
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

var comb = function(sval, sal, dval, dal) {
    return sval * sal + dval * dal * (1 - sal);
};

Crafty.c('Fog', {
    img: null,
    _player: null,
    _color: rgb(0, 0, 0),
    _level: 0,
    ready: false,
    init: function() {
        this.requires('2D, Canvas');
        this.attr({
            x: 0,
            y: 0,
            z: 20,
            w: Game.SCREEN.w,
            h: Game.SCREEN.h,
        });
        this.bind('Draw', this._draw);
        //this.bind('Remove', function() { console.log('remove fog') });
        this.bind('InvalidateViewport', this._center);
    },

    color: function(r, g, b, a) {
        if(typeof a === 'undefined') {
            a = 255;
        }
        this._color = rgb(r, g, b, a);
        if(this._player !== null) {
            this._gen_img();
            this._center();
        }
        return this;
    },

    player: function(p) {
        this._player = p;
        this._gen_img();
        this._center();
        return this;
    },

    level: function(l) {
        this._level = l;
        this._gen_img();
        this._center();
        return this;
    },

    _center: function() {
        this.attr({
            x: -Crafty.viewport.x,
            y: -Crafty.viewport.y,
        });
    },

    _gen_img: function() {
        if(this._player === null) {
            return
        }
        var radius = 200 + (this._level * 75);
        var alpha_max = 1.0 - (this._level * 0.05);
        var alpha_min = 0.25 - (this._level * 0.05);
        if(this._level >= 5) {
            alpha_max = 0.55;
        }

        var w = Game.SCREEN.w;
        var h = Game.SCREEN.h;
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");

        imgdata = ctx.createImageData(w,h);
        px = Player.player.x + Crafty.viewport.x + (Player.player.w / 2);
        py = Player.player.y + Crafty.viewport.y + (Player.player.h / 2);

        for(var x=0; x<w; x++) {
            for(var y=0; y<h; y++) {
                var dist = Math.sqrt(
                    Math.pow(px - x, 2) + Math.pow((py - y)*1.3, 2));
                var alpha = Math.max(
                    Math.min(dist / radius, alpha_max), alpha_min);

                var i = (y*w+x) * 4;
                imgdata.data[i+0] = this._color.r;
                imgdata.data[i+1] = this._color.g;
                imgdata.data[i+2] = this._color.b;
                imgdata.data[i+3] = alpha * this._color.a;
            }
        }
        ctx.putImageData(imgdata,0,0);

        this.img = new Image();
        this.img.src = canvas.toDataURL("image/png");
        this.ready = true;
        //document.body.appendChild(this.img);
    },

    _draw: function() {
        if(this.img) {
            ctx = Crafty.canvas.context;
            ctx.drawImage(this.img, this.x, this.y);
        }
    },
});


Crafty.c('GameOver', {
    init: function() {
        this.requires('2D, Canvas, Image')
            .image('assets/gameover.png')
            .attr({x: -Crafty.viewport.x, y: -Crafty.viewport.y, z: 100});
        this.alpha = 0;
        this.bind("EnterFrame", function() {
            if(this.alpha < 1) {
                this.alpha += 0.01;
            }
        });
    },
});


Crafty.c('Win', {
    init: function() {
        this.requires('2D, Canvas, Image')
            .image('assets/winscreen.png')
            .attr({x: -Crafty.viewport.x, y: -Crafty.viewport.y, z: 100});
        this.alpha = 0;
        this.bind("EnterFrame", function() {
            if(this.alpha < 1) {
                this.alpha += 0.01;
            }
        });
    },
});


Crafty.c('Player', {
    _lights: 0,
    _timers: {iframes: 0, attack: 0},
    dir: 'down',
    init: function() {
        this.requires('Entity, Fourway, Collision, SpriteAnimation, Health')
            .requires('Persist, spr_player')
            .fourway(4)
            .attr({
                //x: 13900,
                //y: 4820,
                z: 10,
                w: Game.PLAYER_WIDTH,
                h: Game.PLAYER_HEIGHT})
            .collision([10,5], [10, 50], [38, 50], [38, 5])
            .onHit('Solid', this.stop)
            .reel('PlayerUp',    600, 0, 0, 1)
            .reel('PlayerRight', 600, 0, 1, 1)
            .reel('PlayerDown',  600, 0, 2, 1)
            .reel('PlayerLeft',  600, 0, 3, 1)
            .health(40)
            ;

        this.onHit('Enemy', function() {
            this.stop();
            this.damage(10);
        });

        this.damage = function(d) {
            if(this._timers.iframes == 0) {
                this._health -= d;
                //console.log("HP: " + this._health);
                Player.health.hit();
                if(this._health <= 0) {
                    Crafty.e('2D, Canvas, spr_player_corpse').attr({
                        x: this.x,
                        y: this.y,
                        w: 64,
                        h: 64,
                        z: 10,
                    });
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

        this.bind('Remove', function() {
            Crafty.e("GameOver");
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

    light_level: function() {
        return this._lights;
    },

    inc_light_level: function() {
        this._lights += 1;
        Player.fog.level(this._lights);
        Player.fog._draw();
    },

    lock: function() {
        this.unbind('KeyDown');
        this.fourway(0);
        this.stop();
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


Player.health = {
    total: 10,
    width: 35,
    hearts: [],
    init: function(player) {
        this.total = player._health / 10;
        for(var i=0; i<this.total; i++) {
            this.hearts.push(Crafty.e('Heart').scrnpos(this.width*i, 0));
        }
    },

    hit: function() {
        if(this.total) {
            this.total -= 1;
            var old = this.hearts[this.total];
            this.hearts[this.total] = Crafty.e('EmptyHeart')
                .scrnpos(this.width * (this.total), 0);
            old.destroy();
        }
    },
}

Player.init = function () {
    this.player = Crafty.e('Player');
    this.health.init(this.player);
}

})();
