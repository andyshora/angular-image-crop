Angular Image Crop
==================

I'm attempting to make a self-contained AngularJS Directive which will allow you to crop an image before it's uploaded to the server.

# Features

* Touch support, swipe to move and drag handle to zoom  - see known issues
* Add any image file from your device/machine
* Output as a base64-encoded data uri
* Uses HTML5 Canvas to display image in a flexible context, to allow dragging and zooming.
* Note that regardless of the shape of the cropping guideline, resulting images will be square. For example, using the 'circle' shape parameter will show a circular guide, but the resulting images will have to be masked when rendering to the user.

# Browser Support
* IE10+, Android 3+, iOS 6+, basically all modern browsers!

# Usage

1. Add the dependency : `angular.module('myApp',['ImageCropper'])`
2. Include the stylesheet
3. Initiatlise the directive [see standalone JSBin](http://jsbin.com/fovovu/1/edit?javascript,output) for example code.

## Parameters

* width (string) - the width of the cropper
* height (string) - the height of the cropper
* padding (integer) - space, in pixels, rounding the shape
* max-size (integer) - max size of the image, in pixels
* shape (string) - the cropping guideline shape (circle/square)
* step (bound integer) - the variable which dictates which step the user will see (used for resetting purposes)
* src (bound Blob or base64 string) - scope variable that will be the source image for the crop
* result (bound string) - the variable which will have the resulting data uri bound to it
* result-blob (bound Blob) - the variable which will have the resulting data as a Blob object
* crop (bound boolean) - scope variable that must be set to true when the image is ready to be cropped

### Example markup
```html
<image-crop			 
 data-height="200"
 data-width="150"
 data-shape="square"
 data-step="imageCropStep"
 src="imgSrc"
 data-result="result"
 data-result-blob="resultBlob"
 crop="initCrop"
 padding="250"
 max-size="1024"
></image-crop>	
```

# See a standalone working example
[Working example on JSBin](http://jsbin.com/fovovu/1/edit?javascript,output)

## Step 1. Choose image, drag to move and drag corner handle to zoom

![Choose image](https://s3-eu-west-1.amazonaws.com/andyshora/crop-step-1.png)

## Step 2. Produces a result as a base64-encoded data uri

![Choose image](https://s3-eu-west-1.amazonaws.com/andyshora/crop-step-2.png)
