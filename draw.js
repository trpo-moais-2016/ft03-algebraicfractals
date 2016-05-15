function zebra(n) {
    return n % 2 == 0 ? {r:0, g:0, b:0, op:255} : {r:255, g:255, b:255, op:255};
}
function level(n) {
    var k = n;
    n = info.n;
    var brightness = n > 1 ? 255 * k * 4 / (n - 1) : 255;
    return {r:brightness, g:0, b:brightness , op:255};
}
function classical(d) {
    return d == 0 ? {r:0, g:0, b:0, op:255} : {r:255, g:255, b:255, op:255};
}
function classicalNewton(attractor) {
    var opaqueness = 255;
    var red = 0;
    var green = 0;
    var blue = 0;
    switch (attractor) {
        case 1:
            red = 255;
            break;
        case 2:
            green = 255;
            break;
        case 3:
            blue = 255;
            break;
    }
    return {r:red, g:green, b:blue, op:opaqueness};
}
function hibrid(attractor ,n){
    var opaqueness = 255;
    var red = 0;
    var green = 0;
    var blue = 0;

    var k = n;
    n = info.n;
    switch (attractor) {
        case 1:
            red = n != 0 ? 255 * k / (n - 1) : 255;
            break;
        case 2:
            green = n != 0 ? 255 * k / (n - 1) : 255;
            break;
        case 3:
            blue = n != 0 ? 255 * k / (n - 1) : 255;
            break;
    }
    return {r:red, g:green, b:blue, op:opaqueness};

}