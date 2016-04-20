'use strict';

var app = angular.module('app', []);

var Colors = {
    Red: [255, 0, 0],
    Green: [0, 255, 0],
    Blue: [0, 0, 255],
    White: [255, 255, 255],
    Black: [0, 0, 0]
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
    var fractals = {
        newtonPool: newtonPool,
        mandelbrotSet: mandelbrotSet,
        juliaSet: juliaSet
    };
    
    $scope.fractals = {
        'newtonPool': 'Бассейны Ньютона',
        'mandelbrotSet':'Множество Мандельброта',
        'juliaSet': 'Множество Жюлиа'
    };

    $scope.coloring = {
        'classic': 'Классическая',
        'levels': 'Уровни',
        'zebra': 'Зебра'
    };
    $scope.juliaConstant = {x: -0.12, y: 0.74};

    setUp();

    $scope.draw = function(context){
        ctx = ctx || context;
        var transform = createTransform(ctx.width, ctx.height,
                                        $scope.left, $scope.right,
                                        $scope.bottom, $scope.top);

        var colorize = fractals[$scope.fractal || 'newtonPool'](100, 
                                                                $scope.coloringType || 'classic',
                                                                $scope);
        draw(ctx, transform, colorize);
    }

    $scope.setUp = function(){
        setUp();
        $scope.draw();
    };

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
            y: - (y*(top - bottom)/ height + bottom)
        };
    }
}

function newtonPool(n, coloringType){

    var cos = Math.cos(Math.PI / 3),
        sin = Math.sin(Math.PI / 3),
        attractors = [
                        new Surrounding(1, 0, Colors.Red),
                        new Surrounding(-cos,  sin, Colors.Blue),
                        new Surrounding(-cos, -sin, Colors.Green)
                     ];

        
    
    var colorings = {
            'classic': function(attractor){ return attractor.color; },
            'zebra'  : function(attractor, i){ return i % 2 === 0 ? Colors.White : Colors.Black; },
            'levels' : function(attractor, i, n){
                           var brightness = n > 1 ? 255*Math.log(1+i)/Math.log(n) : 0;
                           return [brightness, brightness, brightness];
                       },
            'hybrid' : function(attractor, i, n){
                            var color = [0, 0, 0],
                                brightness = n > 1 ? Math.log(1+i)/Math.log(n) : 0;
                            for(var i = 0; i < 3; i++) 
                                color[i] =  brightness * attractor.color[i];
                            return color;
                       }
                     },
        coloring = colorings[coloringType];

    return function(point){
 
        for (var i = 0; i < n; i++) {
 
            for(var j = 0; j < attractors.length; j++){
                var attractor = attractors[j];
                if(attractor.contain(point.x, point.y))
                    return coloring(attractor, i, n);
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

function Surrounding(x, y, color){
    this.x = x;
    this.y = y;
    this.eps = 0.0001;
    this.color = color;
}

Surrounding.prototype.contain = function(x, y) {
    return Math.abs(x - this.x) <= this.eps && Math.abs(y - this.y) <= this.eps;
};

function mandelbrotSet(n, coloringType){
      var colorings = {
            'classic': function(i){ return Colors.Black; },
            'zebra'  : function(i){ return i % 2 === 0 ? Colors.White : Colors.Black; },
            'levels' : function(i, n){
                           var brightness = n > 1 ? 255*Math.log(1+i)/Math.log(n) : 0;
                           return [brightness, brightness, brightness];
                       }
                     },
        coloring = colorings[coloringType];

    return function(point){
        var c = point,
            z = {x: 0, y: 0};
 
        for (var i = 0; i < n; i++) {
            if(Math.abs(z.x) > 3 || Math.abs(z.y) > 3)
                return coloring(i, n);

            z = nextPoint(z, c);
        }

        return Colors.White; 
    } 

    function nextPoint(z, c){
        return {
            x: z.x*z.x - z.y*z.y + c.x,
            y: 2*z.x*z.y + c.y
        };
    }
}

function juliaSet(n, coloringType, data){
      var colorings = {
            'classic': function(i){ return Colors.Black; },
            'zebra'  : function(i){ return i % 2 === 0 ? Colors.White : Colors.Black; },
            'levels' : function(i, n){
                           var brightness = n > 1 ? 255*Math.log(1+i)/Math.log(n) : 0;
                           return [brightness, brightness, brightness];
                       }
                     },
        coloring = colorings[coloringType];

    return function(z){
        var c = data.juliaConstant;
 
        for (var i = 0; i < n; i++) {
            if(Math.abs(z.x) > 3 || Math.abs(z.y) > 3)
                return coloring(i, n);

            z = nextPoint(z, c);
        }

        return Colors.White;    
    } 

    function nextPoint(z, c){ 
        return {
            x: z.x*z.x - z.y*z.y + c.x,
            y: 2*z.x*z.y + c.y
        };
    }
}