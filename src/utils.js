var Random = {};
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

})();
