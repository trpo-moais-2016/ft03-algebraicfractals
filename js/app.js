'use strict';

var app = angular.module('app', []);

var Colors = {
    Red: [255, 0, 0],
    Green: [0, 255, 0],
    Blue: [0, 0, 255],
    White: [255, 255, 255],
    Black: [0, 0, 0]
};

app.directive("drawing", function(){
  return {
    restrict: "A",
    link: function(scope, element, attr){
        var ctx = element[0].getContext('2d');

        ctx.width = Number(attr.width);
        ctx.height = Number(attr.height);

        element.bind('mousedown', function(event){
            scope.mouseDowm = true;
            scope.onDown(event);
            scope.$apply();
        });

        element.bind('mouseup', function(){
            scope.mouseDowm = false;
            scope.cursor = false;
            scope.$apply();
        });

        element.bind('mousemove', function(event){
            scope.onMove(event);
            scope.$apply();
        });

        element.bind('wheel', function(event){
            scope.onScale(event);
            scope.$apply();
            return false;
        });   

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
    $scope.scaling = 'plus';

    setUp();

    $scope.draw = function(context){
        ctx = ctx || context;

        $scope.transform = createTransform(ctx.width, ctx.height,
                                        $scope.left, $scope.right,
                                        $scope.bottom, $scope.top);

        var colorize = fractals[$scope.fractal || 'newtonPool'](50, 
                                                                $scope.coloringType || 'classic',
                                                                $scope);
        draw(ctx, $scope.transform, colorize);
    };

    $scope.setUp = function(){
        setUp();
        $scope.draw();
    };

    $scope.center = {x: 0, y: 0};
    $scope.mouse = {x: 0, y: 0};
    $scope.mouseDowm = false;

    $scope.onDown = function(event){
        var x = event.offsetX / event.target.clientWidth  * event.target.width,
            y = event.offsetY / event.target.clientHeight * event.target.height;
        $scope.start = $scope.transform(x, y);
        $scope.moveTransform = $scope.transform;
    };

    $scope.onMove = function(event){
        var x = event.offsetX / event.target.clientWidth  * event.target.width,
            y = event.offsetY / event.target.clientHeight * event.target.height;

        $scope.mouse = $scope.transform(x, y);

        if(!$scope.mouseDowm) 
            return;  

        var start = $scope.start,
        end = $scope.moveTransform(x, y),
        shift = {
            x: (end.x - start.x)*0.1,
            y: (start.y - end.y)*0.1
        };

        $scope.cursor = true;

        $scope.center = {
                x: $scope.center.x + shift.x,
                y: $scope.center.y + shift.y
            };         

        $scope.onScale();
    };


    $scope.onScale = function(event){
        var delta = event ? -0.05 * Math.sign(event.originalEvent.deltaY) : 0,
            width =  ($scope.right - $scope.left) / 2 * (1 - delta),
            height = ($scope.top - $scope.bottom) / 2 * (1 - delta);

        var p = $scope.center;
        
        $scope.left = p.x - width;
        $scope.right = p.x + width;
        $scope.bottom = p.y - height;
        $scope.top = p.y + height;  
        $scope.draw();     
    };

    function setUp(){
        $scope.left = -2.8;
        $scope.right = 2.8;
        $scope.bottom = -2.1;
        $scope.top = 2.1;
        $scope.center = {x: 0, y: 0};   
        $scope.transform = createTransform(800, 600,
                                        $scope.left, $scope.right,
                                        $scope.bottom, $scope.top);    
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
    };
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
                            for(var j = 0; j < 3; j++) 
                                color[j] =  brightness * attractor.color[j];
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
    };

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
            'classic': function(){ return Colors.Black; },
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
    };

    function nextPoint(z, c){
        return {
            x: z.x*z.x - z.y*z.y + c.x,
            y: 2*z.x*z.y + c.y
        };
    }
}

function juliaSet(n, coloringType, data){
      var colorings = {
            'classic': function(){ return Colors.Black; },
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
    }; 

    function nextPoint(z, c){ 
        return {
            x: z.x*z.x - z.y*z.y + c.x,
            y: 2*z.x*z.y + c.y
        };
    }
}