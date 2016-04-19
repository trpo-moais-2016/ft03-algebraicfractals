'use strict';

var app = angular.module('app', []);

var Colors = {
    Red: [255, 0, 0],
    Green: [0, 255, 0],
    Blue: [0, 0, 255],
    White: [255, 255, 255]
}

app.directive("drawing", function($timeout){
  return {
    restrict: "A",
    link: function(scope, element, attr){
        var ctx = element[0].getContext('2d');

        ctx.width = Number(attr["width"]);
        ctx.height = Number(attr["height"]);
        
        scope.draw(ctx);
    }
  };
});


app.controller("mainController", ["$scope", function($scope){
    var ctx;

    setUp();

    $scope.draw = function(context){
        ctx = ctx || context;
        var transform = createTransform(ctx.width, ctx.height,
                                        $scope.left, $scope.right,
                                        $scope.bottom, $scope.top);
        var colorize = newtonPool(100, 0.001);
        draw(ctx, transform, colorize);
    }

    function setUp(){
        $scope.left = -2.8;
        $scope.right = 2.8;
        $scope.bottom = -2.1;
        $scope.top = 2.1; 
    }
}]);

function draw(ctx, transform, colorize){
    var width = ctx.width, 
        height = ctx.height,
        imgData = ctx.getImageData(0, 0, width, height);

    for(var x = 0; x < width; x++)
        for(var y = 0; y < height; y++){
           setPixel(x, y, colorize(transform(x, y)) );
        }

   ctx.putImageData(imgData, 0, 0);

    function setPixel(x, y, rgb){
        var data = imgData.data;
        var i = y * (width * 4) + x * 4;

        for(var c = 0; c < 3; c++)
            data[i + c] = rgb[c];
        data[i + 3] = 255;
    }
}

function createTransform(width, height, left, right, bottom, top){
    return function(x, y){
        return {
            x: x*(right - left)/ width + left ,
            y: -y*(top - bottom)/ height - bottom
        };
    }
}

function newtonPool(n, eps){

    var cos = Math.cos(Math.PI / 3),
        sin = Math.sin(Math.PI / 3),
        attractors = [
                        new Surrounding(1, 0, eps, Colors.Red),
                        new Surrounding(-cos,  sin, eps, Colors.Blue),
                        new Surrounding(-cos, -sin, eps, Colors.Green)
                     ];
    
    return function(point){
 
        for (var i = 0; i < n; i++) {
 
            for(var j = 0; j < attractors.length; j++){
                var attractor = attractors[j];
                if(attractor.contain(point.x, point.y))
                    return attractor.color;
            }

            point = nextPoint(point);
        }

        return Colors.White; 
    }

    function nextPoint(p){
        var x = p.x, y = p.y;   

        return {
            x: 2 / 3 * x + 1 / 3 * (x*x - y*y) / Math.pow(x*x + y*y, 2),
            y: 2 / 3 * y * ( 1 - x / Math.pow(x*x + y*y, 2) )
        };
    }
}



function Surrounding(x, y, eps, color){
    this.x = x;
    this.y = y;
    this.eps = eps;
    this.color = color;
}

Surrounding.prototype.contain = function(x, y) {
    return Math.abs(x - this.x) <= this.eps && Math.abs(y - this.y) <= this.eps;
};