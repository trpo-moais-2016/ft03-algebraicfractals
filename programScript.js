function Variables(){
	this.left = -2.5;
	this.top = 2.5;
	this.right = 2.5;
	this.bottom = -2.5;
	this.width = 500;
	this.height = 500;
	this.n;
    this.color;
    this.method;
    this.a;
    this.b;
	this.complexCoordinats = function (x, y) {
        var i = x * (this.right - this.left) / (this.width - 1) + this.left;
        var j = y * (this.bottom - this.top) / (this.height - 1) + this.top;
        return {x: i, y: j};
    };
}
var info = new Variables();

function drawFractal() {
	info.n = Number(document.getElementById("number").value);
    info.color = Number(document.getElementById("color").value);
    info.method = Number(document.getElementById("method").value);
    info.a = Number(document.getElementById("x").value);
    info.b = Number(document.getElementById("y").value);
	var canvas = document.getElementById("canvas");
	canvas.width = 500;
	canvas.height = 500;
    var context = canvas.getContext('2d');
    var imageData = context.createImageData(canvas.width, canvas.height);
    for (var i = 0; i < canvas.width; ++i)
        for (var j = 0; j < canvas.height; ++j) {
            var p = info.complexCoordinats(i, j);
            var attractor;
			var marker;
            switch (info.method) {
                case 0: attractor = getAttractor(p.x, p.y, 0, info.n);
                    break;
                case 1: attractor = getMandelbrotIteration(p.x, p.y, info.n);
                    break;
                case 2: attractor = countJuliaIteration(p.x, p.y, info.a, info.b, info.n); 
                    break;
            }
			
			if (info.method == 0){
				var attract = attractor.at;
				var attractor = attractor.it;
				
			}
			
            switch (info.color) {
                case 0: 
                    if (info.method == 0)
                        marker = classicalNewton(attract);
                    else
                        marker = classical(attractor);
                    break;
                case 1: marker = level(attractor);
					break;
                case 2: marker = zebra(attractor); 
					break;
                case 3: marker = hibrid(attract, attractor);
					break;
            }
			imageData.data[4 * (i + canvas.width * j) + 0] = marker.r;
            imageData.data[4 * (i + canvas.width * j) + 1] = marker.g;
            imageData.data[4 * (i + canvas.width * j) + 2] = marker.b;
            imageData.data[4 * (i + canvas.width * j) + 3] = marker.op;
        }
    context.putImageData(imageData, 0, 0);
    
}
  

var el = document.getElementById('canvas');
    el.addEventListener('click', getClickXY, false);

function getClickXY(event)
{
    var clickX = (event.layerX == undefined ? event.offsetX : event.layerX) + 1;
    var clickY = (event.layerY == undefined ? event.offsetY : event.layerY) + 1;      
    var ox,oy;
    if (event.which == 1){
        ox = info.width / 4;
        oy = info.height / 4;
        
    }
    else if(event.which == 2){
        ox = info.width * 2;
        oy = info.height * 2;
    }
    var left = clickX - ox;
    var top = clickY - oy;
    var right = clickX + ox;
    var bottom = clickY + oy;
    var point1 = info.complexCoordinats(left, top);
    var point2 = info.complexCoordinats(right, bottom);
    info.left = point1.x;
    info.top = point1.y;
    info.right = point2.x;
    info.bottom = point2.y;
    drawFractal();
}
 