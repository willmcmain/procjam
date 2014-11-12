var Player = {};
(function () {

Crafty.c('Player', {
    init: function() {
        this.requires('2D, Canvas, Fourway, Collision, SpriteAnimation')
            .requires('spr_player')
            .fourway(4)
            .attr({
                x: 500,
                y: 350,
                z: 1,
                w: Game.PLAYER_WIDTH,
                h: Game.PLAYER_HEIGHT})
            .onHit('Solid', this.stop)
            .reel('PlayerUp',    600, 0, 0, 1)
            .reel('PlayerRight', 600, 0, 1, 1)
            .reel('PlayerDown',  600, 0, 2, 1)
            .reel('PlayerLeft',  600, 0, 3, 1)
            ;

        this.bind('NewDirection', function(data) {
            if (data.x > 0) {
                this.animate('PlayerRight', -1);
            }
            else if (data.x < 0) {
                this.animate('PlayerLeft', -1);
            }
            else if (data.y > 0) {
                this.animate('PlayerDown', -1);
            }
            else if (data.y < 0) {
                this.animate('PlayerUp', -1);
            }
            else {
                this.pauseAnimation();
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
});

Player.init = function () {
    var player = Crafty.e('Player');
    Crafty.viewport.follow(player);
}

})();
