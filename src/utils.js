var Random = {};
var Utils = {};
(function () {
var MAX = Math.pow(2, 31) - 1;
var prime = 104395301;
var seed = Math.ceil(Math.random() * prime);

var next = function() {
    seed = (seed * prime) % MAX;
    return seed;
}


Random.randint = function(a, b) {
    var val = next();
    val = val % (b - a + 1);
    return val + a;
}


Utils.array2d = function(w, h, def) {
    var array = [];
    for(var x = 0; x < w; x++) {
        array[x] = [];
        for(var y = 0; y < h; y++) {
            array[x][y] = def;
        }
    }
    return array;
}

})();
