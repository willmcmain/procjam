var Utils = {};
(function () {

Array.prototype.clone = function() {
    return this.slice(0);
};

Utils.array2d = function(w, h, def) {
    var array = [];
    for(var x = 0; x < w; x++) {
        array[x] = [];
        for(var y = 0; y < h; y++) {
            var val = def;
            if(typeof def === "function") {
                val = def();
            }
            array[x][y] = val;
        }
    }
    return array;
};

})();
