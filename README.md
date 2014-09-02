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
* shape (string) - the cropping guideline shape (circle/square)
* result (bound string) - the variable which will have the resulting data uri bound to it
* step (bound integer) - the variable which dictates which step the user will see (used for resetting purposes)

### Example markup
```html
<image-crop
 data-width="300"
 data-height="300"
 data-shape="circle"
 data-result="imageCropResult"
 data-step="imageCropStep"
></image-crop>
```
Note that the last 2 parameters shown must exist as variables in the scope of the controller.


# See a standalone working example
[Working example on JSBin](http://jsbin.com/fovovu/1/edit?javascript,output)

## Step 1. Choose image, drag to move and drag corner handle to zoom

![Choose image](https://s3-eu-west-1.amazonaws.com/andyshora/crop-step-1.png)

## Step 2. Produces a result as a base64-encoded data uri

![Choose image](https://s3-eu-west-1.amazonaws.com/andyshora/crop-step-2.png)

# Known Issues

1. Currently not working with images captured on some mobile devices, due to orientation exif data being used mobile browsers. Other images on mobiles, including downloaded images are working fine.

# Updates

- Now works with multiple instances