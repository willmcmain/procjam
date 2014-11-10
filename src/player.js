var Player = {};
(function () {

Crafty.c('Player', {
    init: function() {
        this.requires('2D, Canvas, Color, Fourway, Collision')
            .fourway(4)
            .color('#F00')
            .attr({
                x: 500,
                y: 350,
                w: Game.PLAYER_WIDTH,
                h: Game.PLAYER_HEIGHT})
            .onHit('Solid', this.stop);
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
