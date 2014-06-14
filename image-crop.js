(function() {

var myApp = angular.module('myApp', []);
 
myApp.controller('MainController', function($scope) {
});

myApp.directive('imageCrop', function() {
  return {
    template: '<div class="image-crop"><section ng-show="step==1"><input type="file" /></section><section ng-show="step==2"><canvas width="{{ width }}" height="{{ height }}" ng-mousemove="onCanvasMouseMove($event)" ng-mousedown="onCanvasMouseDown($event)" ng-mouseup="onCanvasMouseUp($event)" ng-style="canvasStyles"></canvas>{{ zoom }}<div class="cropping-area"></div><div ng-mousemove="onHandleMouseMove($event)" ng-mousedown="onHandleMouseDown($event)" ng-mouseup="onHandleMouseUp($event)" class="zoom-handle"></div></section><button ng-click="zoomIn()">+</button><button ng-click="zoomOut()">-</button></div>',
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
      var targetX = 0, targetY = 0;
      var zoom = 1;
      var maxZoomGestureLength = 0;
      var maxZoomedInLevel = 0, maxZoomedOutLevel = 2;
      var minXPos = 0, maxXPos = 0, minYPos = 0, maxYPos = 0; // for dragging bounds
      scope.zoom = 1;

      var zoomWeight = .2;
      var ctx = $canvas.getContext('2d');

      // ---------- EVENT HANDLERS ---------- //
      fileReader.onload = function(e) {
         $img.src = fileReader.result;
          scope.step = 2;
          scope.$apply();
      };
      
      element.on('change', function(e){
        var files = e.target.files;
        fileReader.readAsDataURL(files[0]);
        console.log('files', files[0]);
       });
      
      
      $img.onload = function(){
        ctx.drawImage($img, 0, 0);

        imgWidth = $img.width;
        imgHeight = $img.height;
        
        minLeft = scope.width - this.width;
        minTop = scope.height - this.height;
        newWidth = imgWidth;
        newHeight = imgHeight;

        console.log('canvas width', $canvas.width);
        console.log('image width', imgWidth);

        maxZoomedInLevel = $canvas.width / imgWidth;
        console.log('maxZoomedInLevel', maxZoomedInLevel);

        maxZoomGestureLength = to2Dp(Math.sqrt(Math.pow($canvas.width, 2) + Math.pow($canvas.height, 2)));
        console.log('maxZoomGestureLength', maxZoomGestureLength);
        
        
        updateDragBounds();

      };
      
      // ---------- PRIVATE FUNCTIONS ---------- //
      function moveImage(x, y) {

        if ((x < minXPos) || (x > maxXPos) || (y < minYPos) || (y > maxYPos)) {
          // new position is out of bounds, would show gutter
          return;
        }
        targetX = x;
        targetY = y;
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        ctx.drawImage($img, x, y, newWidth, newHeight);
      }

      function to2Dp(val) {
        return Math.round(val * 1000) / 1000;
      }

      function updateDragBounds() {
        // $img.width, $canvas.width, zoom
        
        minXPos = $canvas.width - ($img.width * zoom);
        minYPos = $canvas.height - ($img.height * zoom);
        
      }
      
      function zoomImage(val) {

        if (!val) {
          return;
        }
        

        var proposedZoomLevel = to2Dp(zoom + val);        

        if ((proposedZoomLevel < maxZoomedInLevel) || (proposedZoomLevel > maxZoomedOutLevel)) {
          // image wont fill whole canvas
          // or image is too far zoomed in, it's gonna get pretty pixelated!
          return;
        }

        scope.zoom = zoom = proposedZoomLevel;
        // console.log('zoom', zoom);
        
        updateDragBounds();

        //  do image position adjustments so we don't see any gutter
        if (proposedZoomLevel === maxZoomedInLevel) {
          // image fills canvas perfectly, let's center it
          ctx.clearRect(0, 0, $canvas.width, $canvas.height);
          ctx.drawImage($img, 0, 0, $canvas.width, $canvas.height);
          return;
        }

        newWidth = $img.width * zoom;
        newHeight = $img.height * zoom;

        var newXPos = currentX * zoom;
        var newYPos = currentY * zoom;        

        // check if we've exposed the gutter
        if (newXPos < minXPos) {
          newXPos = minXPos;
        } else if (newXPos > maxXPos) {
          newXPos = maxXPos;
        }

        if (newYPos < minYPos) {
          newYPos = minYPos;
        } else if (newYPos > maxYPos) {
          newYPos = maxYPos;
        }        

        // check if image is still going to fit the bounds of the box
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        ctx.drawImage($img, newXPos, newYPos, newWidth, newHeight);
      }
      
      function calcZoomLevel(diffX, diffY) {
        
        var hyp = Math.sqrt( Math.pow(diffX, 2) + Math.pow(diffY, 2) );

        console.log('diffX', diffX, diffY);
        
        var zoomGestureRatio = to2Dp(hyp / maxZoomGestureLength);

        console.log('zoomGestureRatio', zoomGestureRatio);
        

        var newZoomDiff = to2Dp((maxZoomedOutLevel - maxZoomedInLevel) * zoomGestureRatio * zoomWeight);
        return diffX > 0 ? -newZoomDiff : newZoomDiff;
      }
      
      // ---------- SCOPE FUNCTIONS ---------- //

      
      scope.onCanvasMouseUp = function(e) {

        if (!dragging) {
          return;
        }

        e.stopPropagation(); // if event was on canvas, stop it propagating up

        startX = 0;
        startY = 0;
        dragging = false;
        currentX = targetX;
        currentY = targetY;

        removeBodyEventListener('mouseup', scope.onCanvasMouseUp);
        removeBodyEventListener('mousemove', scope.onCanvasMouseMove);
      };

      scope.onCanvasMouseDown = function(e) {
        startX = e.x;
        startY = e.y;
        zooming = false;
        dragging = true;

        console.log('onCanvasMouseDown', e);
        

        addBodyEventListener('mouseup', scope.onCanvasMouseUp);
        addBodyEventListener('mousemove', scope.onCanvasMouseMove);
      };

      function addBodyEventListener(eventName, func) {
        document.documentElement.addEventListener(eventName, func, false);
      }

      function removeBodyEventListener(eventName, func) {
        document.documentElement.removeEventListener(eventName, func);
      }
      
      scope.onHandleMouseDown = function(e) {

        console.log('onHandleMouseDown', e);
        

        e.stopPropagation(); // if event was on handle, stop it propagating up

        startX = e.x;
        startY = e.y;
        dragging = false;
        zooming = true;

        lastHandleX = e.x;
        lastHandleY = e.y;

        addBodyEventListener('mouseup', scope.onHandleMouseUp);
        addBodyEventListener('mousemove', scope.onHandleMouseMove);
      };
      
      scope.onHandleMouseUp = function(e) {

        // this is applied on the whole section so check we're zooming
        if (!zooming) {
          return;
        }

        e.stopPropagation(); // if event was on canvas, stop it propagating up

        startX = 0;
        startY = 0;
        zooming = false;
        currentX = targetX;
        currentY = targetY;

        console.log('-----', targetX, targetY);
        

        removeBodyEventListener('mouseup', scope.onHandleMouseUp);
        removeBodyEventListener('mousemove', scope.onHandleMouseMove);
      };

      
      scope.onCanvasMouseMove = function(e) {
        
        if (!dragging) {
          return;
        }

        e.stopPropagation();
                
        var diffX = startX - e.x; // how far mouse has moved in current drag
        var diffY = startY - e.y; // how far mouse has moved in current drag
        /*targetX = currentX - diffX; // desired new X position
        targetY = currentY - diffY; // desired new X position*/
        
        moveImage(currentX - diffX, currentY - diffY);
        
      };

      var lastHandleX = null, lastHandleY = null;
      
      scope.onHandleMouseMove = function(e) {
        
        // this is applied on the whole section so check we're zooming
        if (!zooming) {
          return false;
        }

/*        if (!lastHandleX) {
          lastHandleX = e.x;
        }

        if (!lastHandleY) {
          lastHandleY = e.y;
        }*/
                
        var diffX = lastHandleX - e.x; // how far mouse has moved in current drag
        var diffY = lastHandleY - e.y; // how far mouse has moved in current drag
        
        lastHandleX = e.x;
        lastHandleY = e.y;        

        var zoomVal = calcZoomLevel(diffX, diffY);
        zoomImage(zoomVal);
                
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