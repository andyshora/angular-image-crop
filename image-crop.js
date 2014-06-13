(function() {

var myApp = angular.module('myApp', []);
 
myApp.controller('MainController', function($scope) {
});

myApp.directive('imageCrop', function() {
  return {
    template: '<div class="image-crop"><section ng-show="step==1"><input type="file" /></section><section ng-show="step==2" ng-mousemove="onHandleMouseMove($event)" ng-mouseup="onHandleMouseUp($event)"><canvas width="{{ width }}" height="{{ height }}" ng-mousemove="onCanvasMouseMove($event)" ng-mousedown="onCanvasMouseDown($event)" ng-mouseup="onCanvasMouseUp($event)" ng-style="canvasStyles"></canvas>{{ zoom }}<div class="cropping-area"></div><div ng-mousedown="onHandleMouseDown($event)" class="zoom-handle"></div></section><button ng-click="zoomIn()">+</button><button ng-click="zoomOut()">-</button></div>',
    restrict: 'AE',
    transclude: true,
    replace: true,
    scope: {
      width: '@',
      height: '@',
      shape: '@'
    },
    link: function (scope, element, attributes) {
      scope.dataUri = '';
      scope.wrapperStyles = {};
      scope.imgStyles = {};
      scope.step = 1;
      
      scope.canvasStyles = {
        background: 'rgba(255, 255, 255, .3)',
        margin: '0 auto',
        cursor: 'move',
        width: scope.width,
        height: scope.height
      };
      
      
      
      var $input = element.find('input[type=file]');
      var $canvas = element.find('canvas')[0];
      var $img = new Image();
      var fileReader = new FileReader();


      var maxLeft = 0, minLeft = 0, maxTop = 0, minTop = 0, imgLoaded = false, imgWidth = 0, imgHeight = 0;         
      var currentX = 0, currentY = 0, dragging = false, startX = 0, startY = 0, zooming = false;
      var newWidth = imgWidth, newHeight = imgHeight;
      var targetX = 0, targetY;
      var zoom = 1;
      scope.zoom = 1;
      var ctx = $canvas.getContext('2d');

      // ---------- EVENT HANDLERS ---------- //
      fileReader.onload = function(e) {
         $img.src = fileReader.result;
        imgWidth = $img.width;
        imgHeight = $img.height;
          scope.step = 2;
          scope.$apply();
         console.log(scope.dataUri);
      };
      
      element.on('change', function(e){
        var files = e.target.files;
        fileReader.readAsDataURL(files[0]);
        console.log('files', files[0]);
       });
      
      
      $img.onload = function(){
        ctx.drawImage($img, 0, 0);
        
        minLeft = scope.width - this.width;
        minTop = scope.height - this.height;
        newWidth = imgWidth;
        newHeight = imgHeight;
      };
      
      // ---------- PRIVATE FUNCTIONS ---------- //
      function moveImage(x, y) {
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        ctx.drawImage($img, x, y, newWidth, newHeight);
      }
      
      function zoomImage(val) {
        
        // check if new zoom level is still fills canvas
        if (($img.width * (zoom + val) < $canvas.width) || ($img.height * (zoom + val) < $canvas.height)) {
          return;

        } else {
          scope.zoom = zoom = zoom + val;
          newWidth = $img.width * zoom;
          newHeight = $img.height * zoom;
        }

        console.log('newWidth', newWidth, newHeight);
        
        // console.log('drawImage', currentX, currentY, newWidth, newHeight);

        // calc transformation origin
        // var offsetX = 
        // console.log('check if ' + ((currentX * zoom) + newWidth) + 'is less than ' + newWidth);

        // check if image is still going to fit the bounds of the box
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        ctx.drawImage($img, currentX * zoom, currentY * zoom, newWidth, newHeight);
        
        
      }
      
      function calcZoomLevel(diffX, diffY) {
        var hyp = Math.sqrt( Math.pow(diffX, 2) + Math.pow(diffY, 2) );
        var origZoom = zoom;
        
        if (diffX > 0) {
          // zooming in
          zoom += (hyp / 100);
        } else {
          // zooming out
          zoom -= (hyp / 100);
        }
                
        if ((imgWidth * zoom < scope.width) || (zoom > 3)) {
          zoom = origZoom;
        }
        
        scope.zoom = zoom;
        
        return zoom;
      }
      
      // ---------- SCOPE FUNCTIONS ---------- //
      scope.onCanvasMouseDown = function(e) {
        startX = e.x;
        startY = e.y;
        zooming = false;
        dragging = true;
      };
      
      scope.onCanvasMouseUp = function(e) {
        startX = 0;
        startY = 0;
        dragging = false;
        currentX = targetX;
        currentY = targetY;
      };
      
      scope.onHandleMouseDown = function(e) {
        startX = e.x;
        startY = e.y;
        dragging = false;
        zooming = true;
      };
      
      scope.onHandleMouseUp = function(e) {
        // this is applied on the whole section so check we're zooming
        if (zooming) {
          startX = 0;
          startY = 0;
          zooming = false;
          currentX = targetX;
          currentY = targetY;
        }
      };

      
      scope.onCanvasMouseMove = function(e) {
        
        if (!dragging) {
          return false;
        }

        // console.log('minLeft', minLeft);
                
        var diffX = startX - e.x; // how far mouse has moved in current drag
        var diffY = startY - e.y; // how far mouse has moved in current drag
        targetX = currentX - diffX; // desired new X position
        targetY = currentY - diffY; // desired new X position
        
        if (targetX > maxLeft) {
          targetX = maxLeft;
        } else if (targetX < minLeft) {
          targetX = minLeft;
        }
        
        if (targetY > maxTop) {
          targetY = maxTop;
        } else if (targetY < minTop) {
          targetY = minTop;
        }
        
        // imgWidth - canvasWidth to get overflow
        // then check if targetX > overflow, if so, dont move
        // var overflow = imgWidth - $canvas.width;

        // console.log(($canvas.width - (imgWidth * zoom)), (imgWidth * zoom), targetX, minLeft);

        console.log((imgWidth * zoom), Math.abs(($canvas.width - (imgWidth * zoom)) + targetX + minLeft));
        
        if (Math.abs(($canvas.width - (imgWidth * zoom)) + targetX + minLeft) > (imgWidth * zoom)) {
          return;
        }
        
        // console.log('targetX', targetX, $canvas.width, imgWidth, $canvas.width - imgWidth, minLeft);
        moveImage(targetX, targetY);
        
      };
      
      scope.onHandleMouseMove = function(e) {
        
        // this is applied on the whole section so check we're zooming
        if (!zooming) {
          return false;
        }
                
        var diffX = startX - e.x; // how far mouse has moved in current drag
        var diffY = startY - e.y; // how far mouse has moved in current drag
        targetX = currentX - diffX; // desired new X position
        targetY = currentY - diffY; // desired new X position
        
        var zoomVal = calcZoomLevel(targetX, targetY);
        zoomImage(zoomVal);
        
//         moveImage(targetX, targetY);
        
      };

      scope.zoomIn = function() {
        zoomImage(0.1);
      };
      
      scope.zoomOut = function() {
        zoomImage(-0.1);
      };

      
    }
  };
});

})();