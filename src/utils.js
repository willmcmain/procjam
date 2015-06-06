var Utils = {};
(function () {

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
