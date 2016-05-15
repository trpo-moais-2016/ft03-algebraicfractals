COS60 = Math.cos(Math.PI / 3);
SIN60 = Math.sin(Math.PI / 3);

function getAttractor(x,y,iter,n) {
	if (n == 0) return {at : 0,it : iter};
	if (neighboringPoint(x, y, 1, 0))return {at : 1, it : iter};
	if (neighboringPoint(x, y, -COS60, SIN60))return {at : 2, it : iter};
	if (neighboringPoint(x, y, -COS60, -SIN60))return {at : 3, it : iter};
	var a = x * x;
	var b = y * y;
	var newX = 2 * x / 3 + (a - b) / (3 * Math.pow((a + b), 2));
	var newY = 2 * y * (1 - x / Math.pow((a + b), 2)) / 3;
	return getAttractor(newX, newY, iter + 1, n - 1);
}

function neighboringPoint(x1,y1,x2,y2) {
	var epsilon = 0.0001;
	return Math.abs(x1 - x2) <= epsilon && Math.abs(y1 - y2) <= epsilon;
}

function countJuliaIteration(x0, y0, a, b, n) {
	var x = x0;
	var y = y0;
	var newX = 0;
	var newY = 0;
	var count = 0;
	while (count < n) {
		if (x * x + y * y > 4)
			return count;
		newX = x * x - y * y + a;
		newY = 2 * x * y + b;
		x = newX;
		y = newY;
		count++;
	}
	return 0;
}

	
function getMandelbrotIteration(a,b,n) {
	var x = 0;
	var y = 0;
	var newX = 0;
	var newY = 0;
	var count = 0;
	while (count < n) {
		newX = x * x - y * y + a;
		newY = 2 * x * y + b;
		if (newX * newX + newY * newY > 4)
			return count;
		x = newX;
		y = newY;
		count++;
	}
	return 0;
}