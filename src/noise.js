// Implementation of simplex noise adapted from
// http://webstaff.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
var Noise = {};
var Poisson = {};
(function () {

var grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
];

var p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,
    103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,
    62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,
    136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,
    229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,
    63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,
    188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,
    38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,
    172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,
    246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,
    249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,
    50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,
    195,78,66,215,61,156,180];

var perm = p.concat(p);

var dot = function(g, x, y) {
    return g[0] * x + g[1] * y;
}

Noise.seed = function(x) {
    seed = x;
    var newperm = p.concat(p);
    for(var i=0; i < newperm.length; i++) {
        newperm[i] = (newperm[i] + seed) % 256;
    }
    perm = newperm;
}

var seed = 15485863;
Noise.randint = function() {
    var a = 1103515245,
        c = 12345,
        m = Math.pow(2, 32) - 1;
    return seed = (a * seed + c) % m;
}

Noise.random = function() {
    return Noise.randint() / Math.pow(2, 32);
}

Noise.randomchoice = function(arr) {
    var len = arr.length;
    var i = Noise.uniformint(0, len-1);
    return arr[i];
}

Noise.uniformint = function(a, b) {
    var val = this.randint() % (b-a+1);
    return val + a
}

Noise.test = function(n) {
    var zero = 0,
        one  = 0;
    for(var i=0; i < n; i++) {
        if(Noise.uniformint(0, 1)) {
            one++;
        }
        else {
            zero++;
        }
    }
    console.log('Zeroes: ' + zero + '; Ones: ' + one);
}

Noise.simplex = function (x, y) {
    var n0, n1, n2;

    var F2 = 0.5 * (Math.sqrt(3.0)-1.0);
    var s = (x+y) * F2;
    var i = Math.floor(x+s);
    var j = Math.floor(y+s);

    var G2 = (3.0-Math.sqrt(3.0))/6.0;
    var t = (i+j)*G2;
    var X0 = i-t;
    var Y0 = j-t;
    var x0 = x-X0;
    var y0 = y-Y0;

    var i1, j1;
    if(x0>y0) {
        i1=1; j1=0;
    }
    else {
        i1=0; j1=1;
    }

    var x1 = x0 - i1 + G2;
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1.0 + 2.0 * G2;
    var y2 = y0 - 1.0 + 2.0 * G2;

    var ii = i & 255;
    var jj = j & 255;
    var gi0 = perm[ii+perm[jj]] % 12;
    var gi1 = perm[ii+i1+perm[jj+j1]] % 12;
    var gi2 = perm[ii+1+perm[jj+1]] % 12;

    var t0 = 0.5 - x0 * x0-y0 * y0;
    if(t0 < 0) {
        n0 = 0.0;
    }
    else {
        t0 *= t0;
        n0 = t0 * t0 * dot(grad3[gi0], x0, y0);
    }

    var t1 = 0.5 - x1 * x1-y1 * y1;
    if(t1 < 0) {
        n1 = 0.0;
    }
    else {
        t1 *= t1;
        n1 = t1 * t1 * dot(grad3[gi1], x1, y1);
    }

    var t2 = 0.5 - x2 * x2 - y2 * y2;
    if(t2 < 0) {
        n2 = 0.0;
    }
    else {
        t2 *= t2;
        n2 = t2 * t2 * dot(grad3[gi2], x2, y2);
    }

    return 70.0 * (n0 + n1 + n2);
}


Poisson.next = function(lmb) {
    return -Math.log(Noise.random()) / lmb;
};


Poisson.poisson = function(lmb) {
    var L = Math.exp(-lmb);
    var k = 1;
    var p = Noise.random();
    while(p > L) {
        p *= Noise.random();
        k++;
    }
    return k - 1;
};

})();
