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

var comb = function(sval, sal, dval, dal) {
    return sval * sal + dval * dal * (1 - sal);
};

Crafty.c('Fog', {
    img: null,
    _player: null,
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
        this.bind('Remove', function() { console.log('remove fog') });
        this.bind('InvalidateViewport', this._center);
    },

    player: function(p) {
        this._player = p;
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
                var alpha = Math.min(dist / 250, 0.9);

                var i = (y*w+x) * 4;
                imgdata.data[i+0] = 0;
                imgdata.data[i+1] = 0;
                imgdata.data[i+2] = 0;
                imgdata.data[i+3] = alpha * 255;
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


Crafty.c('Player', {
    _timers: {iframes: 0, attack: 0},
    dir: 'down',
    init: function() {
        this.requires('Entity, Fourway, Collision, SpriteAnimation, Health')
            .requires('Persist, spr_player')
            .fourway(4)
            .attr({
                x: 13900,
                y: 4820,
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
    //this.fog = Crafty.e('Fog').player(this.player);
}

})();
