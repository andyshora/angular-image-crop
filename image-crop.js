/**
 * AngularJS Directive - Image Crop v1.1.0
 * Copyright (c) 2014 Andy Shora, andyshora@gmail.com, andyshora.com
 * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
 */
(function() {

  /*
   * DEPENDENCY
   * Javascript BinaryFile
   * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
   * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
   */

  var BinaryFile = function(strData, iDataOffset, iDataLength) {
      var data = strData;
      var dataOffset = iDataOffset || 0;
      var dataLength = 0;

      this.getRawData = function() {
          return data;
      }

      if (typeof strData == "string") {
          dataLength = iDataLength || data.length;

          this.getByteAt = function(iOffset) {
              return data.charCodeAt(iOffset + dataOffset) & 0xFF;
          }

          this.getBytesAt = function(iOffset, iLength) {
              var aBytes = [];

              for (var i = 0; i < iLength; i++) {
                  aBytes[i] = data.charCodeAt((iOffset + i) + dataOffset) & 0xFF
              }
              ;

              return aBytes;
          }
      } else if (typeof strData == "unknown") {
          dataLength = iDataLength || IEBinary_getLength(data);

          this.getByteAt = function(iOffset) {
              return IEBinary_getByteAt(data, iOffset + dataOffset);
          }

          this.getBytesAt = function(iOffset, iLength) {
              return new VBArray(IEBinary_getBytesAt(data, iOffset + dataOffset, iLength)).toArray();
          }
      }

      this.getLength = function() {
          return dataLength;
      }

      this.getSByteAt = function(iOffset) {
          var iByte = this.getByteAt(iOffset);
          if (iByte > 127)
              return iByte - 256;
          else
              return iByte;
      }

      this.getShortAt = function(iOffset, bBigEndian) {
          var iShort = bBigEndian ?
                  (this.getByteAt(iOffset) << 8) + this.getByteAt(iOffset + 1)
                  : (this.getByteAt(iOffset + 1) << 8) + this.getByteAt(iOffset)
          if (iShort < 0)
              iShort += 65536;
          return iShort;
      }
      this.getSShortAt = function(iOffset, bBigEndian) {
          var iUShort = this.getShortAt(iOffset, bBigEndian);
          if (iUShort > 32767)
              return iUShort - 65536;
          else
              return iUShort;
      }
      this.getLongAt = function(iOffset, bBigEndian) {
          var iByte1 = this.getByteAt(iOffset),
                  iByte2 = this.getByteAt(iOffset + 1),
                  iByte3 = this.getByteAt(iOffset + 2),
                  iByte4 = this.getByteAt(iOffset + 3);

          var iLong = bBigEndian ?
                  (((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4
                  : (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
          if (iLong < 0)
              iLong += 4294967296;
          return iLong;
      }
      this.getSLongAt = function(iOffset, bBigEndian) {
          var iULong = this.getLongAt(iOffset, bBigEndian);
          if (iULong > 2147483647)
              return iULong - 4294967296;
          else
              return iULong;
      }

      this.getStringAt = function(iOffset, iLength) {
          var aStr = [];

          var aBytes = this.getBytesAt(iOffset, iLength);
          for (var j = 0; j < iLength; j++) {
              aStr[j] = String.fromCharCode(aBytes[j]);
          }
          return aStr.join("");
      }

      this.getCharAt = function(iOffset) {
          return String.fromCharCode(this.getByteAt(iOffset));
      }
      this.toBase64 = function() {
          return window.btoa(data);
      }
      this.fromBase64 = function(strBase64) {
          data = window.atob(strBase64);
      }
  };
  /*
   * DEPENDENCY
   * Javascript EXIF Reader 0.1.6
   * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
   * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
   */
  var EXIF = (function() {

      var debug = false;

      var ExifTags = {

          // version tags
          0x9000: "ExifVersion", // EXIF version
          0xA000: "FlashpixVersion", // Flashpix format version

          // colorspace tags
          0xA001: "ColorSpace", // Color space information tag

          // image configuration
          0xA002: "PixelXDimension", // Valid width of meaningful image
          0xA003: "PixelYDimension", // Valid height of meaningful image
          0x9101: "ComponentsConfiguration", // Information about channels
          0x9102: "CompressedBitsPerPixel", // Compressed bits per pixel

          // user information
          0x927C: "MakerNote", // Any desired information written by the manufacturer
          0x9286: "UserComment", // Comments by user

          // related file
          0xA004: "RelatedSoundFile", // Name of related sound file

          // date and time
          0x9003: "DateTimeOriginal", // Date and time when the original image was generated
          0x9004: "DateTimeDigitized", // Date and time when the image was stored digitally
          0x9290: "SubsecTime", // Fractions of seconds for DateTime
          0x9291: "SubsecTimeOriginal", // Fractions of seconds for DateTimeOriginal
          0x9292: "SubsecTimeDigitized", // Fractions of seconds for DateTimeDigitized

          // picture-taking conditions
          0x829A: "ExposureTime", // Exposure time (in seconds)
          0x829D: "FNumber", // F number
          0x8822: "ExposureProgram", // Exposure program
          0x8824: "SpectralSensitivity", // Spectral sensitivity
          0x8827: "ISOSpeedRatings", // ISO speed rating
          0x8828: "OECF", // Optoelectric conversion factor
          0x9201: "ShutterSpeedValue", // Shutter speed
          0x9202: "ApertureValue", // Lens aperture
          0x9203: "BrightnessValue", // Value of brightness
          0x9204: "ExposureBias", // Exposure bias
          0x9205: "MaxApertureValue", // Smallest F number of lens
          0x9206: "SubjectDistance", // Distance to subject in meters
          0x9207: "MeteringMode", // Metering mode
          0x9208: "LightSource", // Kind of light source
          0x9209: "Flash", // Flash status
          0x9214: "SubjectArea", // Location and area of main subject
          0x920A: "FocalLength", // Focal length of the lens in mm
          0xA20B: "FlashEnergy", // Strobe energy in BCPS
          0xA20C: "SpatialFrequencyResponse", //
          0xA20E: "FocalPlaneXResolution", // Number of pixels in width direction per FocalPlaneResolutionUnit
          0xA20F: "FocalPlaneYResolution", // Number of pixels in height direction per FocalPlaneResolutionUnit
          0xA210: "FocalPlaneResolutionUnit", // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
          0xA214: "SubjectLocation", // Location of subject in image
          0xA215: "ExposureIndex", // Exposure index selected on camera
          0xA217: "SensingMethod", // Image sensor type
          0xA300: "FileSource", // Image source (3 == DSC)
          0xA301: "SceneType", // Scene type (1 == directly photographed)
          0xA302: "CFAPattern", // Color filter array geometric pattern
          0xA401: "CustomRendered", // Special processing
          0xA402: "ExposureMode", // Exposure mode
          0xA403: "WhiteBalance", // 1 = auto white balance, 2 = manual
          0xA404: "DigitalZoomRation", // Digital zoom ratio
          0xA405: "FocalLengthIn35mmFilm", // Equivalent foacl length assuming 35mm film camera (in mm)
          0xA406: "SceneCaptureType", // Type of scene
          0xA407: "GainControl", // Degree of overall image gain adjustment
          0xA408: "Contrast", // Direction of contrast processing applied by camera
          0xA409: "Saturation", // Direction of saturation processing applied by camera
          0xA40A: "Sharpness", // Direction of sharpness processing applied by camera
          0xA40B: "DeviceSettingDescription", //
          0xA40C: "SubjectDistanceRange", // Distance to subject

          // other tags
          0xA005: "InteroperabilityIFDPointer",
          0xA420: "ImageUniqueID"   // Identifier assigned uniquely to each image
      };

      var TiffTags = {
          0x0100: "ImageWidth",
          0x0101: "ImageHeight",
          0x8769: "ExifIFDPointer",
          0x8825: "GPSInfoIFDPointer",
          0xA005: "InteroperabilityIFDPointer",
          0x0102: "BitsPerSample",
          0x0103: "Compression",
          0x0106: "PhotometricInterpretation",
          0x0112: "Orientation",
          0x0115: "SamplesPerPixel",
          0x011C: "PlanarConfiguration",
          0x0212: "YCbCrSubSampling",
          0x0213: "YCbCrPositioning",
          0x011A: "XResolution",
          0x011B: "YResolution",
          0x0128: "ResolutionUnit",
          0x0111: "StripOffsets",
          0x0116: "RowsPerStrip",
          0x0117: "StripByteCounts",
          0x0201: "JPEGInterchangeFormat",
          0x0202: "JPEGInterchangeFormatLength",
          0x012D: "TransferFunction",
          0x013E: "WhitePoint",
          0x013F: "PrimaryChromaticities",
          0x0211: "YCbCrCoefficients",
          0x0214: "ReferenceBlackWhite",
          0x0132: "DateTime",
          0x010E: "ImageDescription",
          0x010F: "Make",
          0x0110: "Model",
          0x0131: "Software",
          0x013B: "Artist",
          0x8298: "Copyright"
      };

      var GPSTags = {
          0x0000: "GPSVersionID",
          0x0001: "GPSLatitudeRef",
          0x0002: "GPSLatitude",
          0x0003: "GPSLongitudeRef",
          0x0004: "GPSLongitude",
          0x0005: "GPSAltitudeRef",
          0x0006: "GPSAltitude",
          0x0007: "GPSTimeStamp",
          0x0008: "GPSSatellites",
          0x0009: "GPSStatus",
          0x000A: "GPSMeasureMode",
          0x000B: "GPSDOP",
          0x000C: "GPSSpeedRef",
          0x000D: "GPSSpeed",
          0x000E: "GPSTrackRef",
          0x000F: "GPSTrack",
          0x0010: "GPSImgDirectionRef",
          0x0011: "GPSImgDirection",
          0x0012: "GPSMapDatum",
          0x0013: "GPSDestLatitudeRef",
          0x0014: "GPSDestLatitude",
          0x0015: "GPSDestLongitudeRef",
          0x0016: "GPSDestLongitude",
          0x0017: "GPSDestBearingRef",
          0x0018: "GPSDestBearing",
          0x0019: "GPSDestDistanceRef",
          0x001A: "GPSDestDistance",
          0x001B: "GPSProcessingMethod",
          0x001C: "GPSAreaInformation",
          0x001D: "GPSDateStamp",
          0x001E: "GPSDifferential"
      };

      var StringValues = {
          ExposureProgram: {
              0: "Not defined",
              1: "Manual",
              2: "Normal program",
              3: "Aperture priority",
              4: "Shutter priority",
              5: "Creative program",
              6: "Action program",
              7: "Portrait mode",
              8: "Landscape mode"
          },
          MeteringMode: {
              0: "Unknown",
              1: "Average",
              2: "CenterWeightedAverage",
              3: "Spot",
              4: "MultiSpot",
              5: "Pattern",
              6: "Partial",
              255: "Other"
          },
          LightSource: {
              0: "Unknown",
              1: "Daylight",
              2: "Fluorescent",
              3: "Tungsten (incandescent light)",
              4: "Flash",
              9: "Fine weather",
              10: "Cloudy weather",
              11: "Shade",
              12: "Daylight fluorescent (D 5700 - 7100K)",
              13: "Day white fluorescent (N 4600 - 5400K)",
              14: "Cool white fluorescent (W 3900 - 4500K)",
              15: "White fluorescent (WW 3200 - 3700K)",
              17: "Standard light A",
              18: "Standard light B",
              19: "Standard light C",
              20: "D55",
              21: "D65",
              22: "D75",
              23: "D50",
              24: "ISO studio tungsten",
              255: "Other"
          },
          Flash: {
              0x0000: "Flash did not fire",
              0x0001: "Flash fired",
              0x0005: "Strobe return light not detected",
              0x0007: "Strobe return light detected",
              0x0009: "Flash fired, compulsory flash mode",
              0x000D: "Flash fired, compulsory flash mode, return light not detected",
              0x000F: "Flash fired, compulsory flash mode, return light detected",
              0x0010: "Flash did not fire, compulsory flash mode",
              0x0018: "Flash did not fire, auto mode",
              0x0019: "Flash fired, auto mode",
              0x001D: "Flash fired, auto mode, return light not detected",
              0x001F: "Flash fired, auto mode, return light detected",
              0x0020: "No flash function",
              0x0041: "Flash fired, red-eye reduction mode",
              0x0045: "Flash fired, red-eye reduction mode, return light not detected",
              0x0047: "Flash fired, red-eye reduction mode, return light detected",
              0x0049: "Flash fired, compulsory flash mode, red-eye reduction mode",
              0x004D: "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
              0x004F: "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
              0x0059: "Flash fired, auto mode, red-eye reduction mode",
              0x005D: "Flash fired, auto mode, return light not detected, red-eye reduction mode",
              0x005F: "Flash fired, auto mode, return light detected, red-eye reduction mode"
          },
          SensingMethod: {
              1: "Not defined",
              2: "One-chip color area sensor",
              3: "Two-chip color area sensor",
              4: "Three-chip color area sensor",
              5: "Color sequential area sensor",
              7: "Trilinear sensor",
              8: "Color sequential linear sensor"
          },
          SceneCaptureType: {
              0: "Standard",
              1: "Landscape",
              2: "Portrait",
              3: "Night scene"
          },
          SceneType: {
              1: "Directly photographed"
          },
          CustomRendered: {
              0: "Normal process",
              1: "Custom process"
          },
          WhiteBalance: {
              0: "Auto white balance",
              1: "Manual white balance"
          },
          GainControl: {
              0: "None",
              1: "Low gain up",
              2: "High gain up",
              3: "Low gain down",
              4: "High gain down"
          },
          Contrast: {
              0: "Normal",
              1: "Soft",
              2: "Hard"
          },
          Saturation: {
              0: "Normal",
              1: "Low saturation",
              2: "High saturation"
          },
          Sharpness: {
              0: "Normal",
              1: "Soft",
              2: "Hard"
          },
          SubjectDistanceRange: {
              0: "Unknown",
              1: "Macro",
              2: "Close view",
              3: "Distant view"
          },
          FileSource: {
              3: "DSC"
          },
          Components: {
              0: "",
              1: "Y",
              2: "Cb",
              3: "Cr",
              4: "R",
              5: "G",
              6: "B"
          }
      };

      function addEvent(element, event, handler) {
          if (element.addEventListener) {
              element.addEventListener(event, handler, false);
          } else if (element.attachEvent) {
              element.attachEvent("on" + event, handler);
          }
      }

      function imageHasData(img) {
          return !!(img.exifdata);
      }

      function getImageData(img, callback) {
          BinaryAjax(img.src, function(http) {
              var data = findEXIFinJPEG(http.binaryResponse);
              img.exifdata = data || {};
              if (callback) {
                  callback.call(img)
              }
          });
      }

      function findEXIFinJPEG(file) {
          if (file.getByteAt(0) != 0xFF || file.getByteAt(1) != 0xD8) {
              return false; // not a valid jpeg
          }

          var offset = 2,
                  length = file.getLength(),
                  marker;

          while (offset < length) {
              if (file.getByteAt(offset) != 0xFF) {
                  if (debug)
                      console.log("Not a valid marker at offset " + offset + ", found: " + file.getByteAt(offset));
                  return false; // not a valid marker, something is wrong
              }

              marker = file.getByteAt(offset + 1);

              // we could implement handling for other markers here,
              // but we're only looking for 0xFFE1 for EXIF data

              if (marker == 22400) {
                  if (debug)
                      console.log("Found 0xFFE1 marker");

                  return readEXIFData(file, offset + 4, file.getShortAt(offset + 2, true) - 2);

                  // offset += 2 + file.getShortAt(offset+2, true);

              } else if (marker == 225) {
                  // 0xE1 = Application-specific 1 (for EXIF)
                  if (debug)
                      console.log("Found 0xFFE1 marker");

                  return readEXIFData(file, offset + 4, file.getShortAt(offset + 2, true) - 2);

              } else {
                  offset += 2 + file.getShortAt(offset + 2, true);
              }

          }

      }


      function readTags(file, tiffStart, dirStart, strings, bigEnd) {
          var entries = file.getShortAt(dirStart, bigEnd),
                  tags = {},
                  entryOffset, tag,
                  i;

          for (i = 0; i < entries; i++) {
              entryOffset = dirStart + i * 12 + 2;
              tag = strings[file.getShortAt(entryOffset, bigEnd)];
              if (!tag && debug)
                  console.log("Unknown tag: " + file.getShortAt(entryOffset, bigEnd));
              tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
          }
          return tags;
      }


      function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
          var type = file.getShortAt(entryOffset + 2, bigEnd),
                  numValues = file.getLongAt(entryOffset + 4, bigEnd),
                  valueOffset = file.getLongAt(entryOffset + 8, bigEnd) + tiffStart,
                  offset,
                  vals, val, n,
                  numerator, denominator;

          switch (type) {
              case 1: // byte, 8-bit unsigned int
              case 7: // undefined, 8-bit byte, value depending on field
                  if (numValues == 1) {
                      return file.getByteAt(entryOffset + 8, bigEnd);
                  } else {
                      offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                      vals = [];
                      for (n = 0; n < numValues; n++) {
                          vals[n] = file.getByteAt(offset + n);
                      }
                      return vals;
                  }

              case 2: // ascii, 8-bit byte
                  offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                  return file.getStringAt(offset, numValues - 1);

              case 3: // short, 16 bit int
                  if (numValues == 1) {
                      return file.getShortAt(entryOffset + 8, bigEnd);
                  } else {
                      offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                      vals = [];
                      for (n = 0; n < numValues; n++) {
                          vals[n] = file.getShortAt(offset + 2 * n, bigEnd);
                      }
                      return vals;
                  }

              case 4: // long, 32 bit int
                  if (numValues == 1) {
                      return file.getLongAt(entryOffset + 8, bigEnd);
                  } else {
                      vals = [];
                      for (var n = 0; n < numValues; n++) {
                          vals[n] = file.getLongAt(valueOffset + 4 * n, bigEnd);
                      }
                      return vals;
                  }

              case 5: // rational = two long values, first is numerator, second is denominator
                  if (numValues == 1) {
                      numerator = file.getLongAt(valueOffset, bigEnd);
                      denominator = file.getLongAt(valueOffset + 4, bigEnd);
                      val = new Number(numerator / denominator);
                      val.numerator = numerator;
                      val.denominator = denominator;
                      return val;
                  } else {
                      vals = [];
                      for (n = 0; n < numValues; n++) {
                          numerator = file.getLongAt(valueOffset + 8 * n, bigEnd);
                          denominator = file.getLongAt(valueOffset + 4 + 8 * n, bigEnd);
                          vals[n] = new Number(numerator / denominator);
                          vals[n].numerator = numerator;
                          vals[n].denominator = denominator;
                      }
                      return vals;
                  }

              case 9: // slong, 32 bit signed int
                  if (numValues == 1) {
                      return file.getSLongAt(entryOffset + 8, bigEnd);
                  } else {
                      vals = [];
                      for (n = 0; n < numValues; n++) {
                          vals[n] = file.getSLongAt(valueOffset + 4 * n, bigEnd);
                      }
                      return vals;
                  }

              case 10: // signed rational, two slongs, first is numerator, second is denominator
                  if (numValues == 1) {
                      return file.getSLongAt(valueOffset, bigEnd) / file.getSLongAt(valueOffset + 4, bigEnd);
                  } else {
                      vals = [];
                      for (n = 0; n < numValues; n++) {
                          vals[n] = file.getSLongAt(valueOffset + 8 * n, bigEnd) / file.getSLongAt(valueOffset + 4 + 8 * n, bigEnd);
                      }
                      return vals;
                  }
          }
      }


      function readEXIFData(file, start) {
          if (file.getStringAt(start, 4) != "Exif") {
              if (debug)
                  console.log("Not valid EXIF data! " + file.getStringAt(start, 4));
              return false;
          }

          var bigEnd,
                  tags, tag,
                  exifData, gpsData,
                  tiffOffset = start + 6;

          // test for TIFF validity and endianness
          if (file.getShortAt(tiffOffset) == 0x4949) {
              bigEnd = false;
          } else if (file.getShortAt(tiffOffset) == 0x4D4D) {
              bigEnd = true;
          } else {
              if (debug)
                  console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
              return false;
          }

          if (file.getShortAt(tiffOffset + 2, bigEnd) != 0x002A) {
              if (debug)
                  console.log("Not valid TIFF data! (no 0x002A)");
              return false;
          }

          if (file.getLongAt(tiffOffset + 4, bigEnd) != 0x00000008) {
              if (debug)
                  console.log("Not valid TIFF data! (First offset not 8)", file.getShortAt(tiffOffset + 4, bigEnd));
              return false;
          }

          tags = readTags(file, tiffOffset, tiffOffset + 8, TiffTags, bigEnd);

          if (tags.ExifIFDPointer) {
              exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
              for (tag in exifData) {
                  switch (tag) {
                      case "LightSource" :
                      case "Flash" :
                      case "MeteringMode" :
                      case "ExposureProgram" :
                      case "SensingMethod" :
                      case "SceneCaptureType" :
                      case "SceneType" :
                      case "CustomRendered" :
                      case "WhiteBalance" :
                      case "GainControl" :
                      case "Contrast" :
                      case "Saturation" :
                      case "Sharpness" :
                      case "SubjectDistanceRange" :
                      case "FileSource" :
                          exifData[tag] = StringValues[tag][exifData[tag]];
                          break;

                      case "ExifVersion" :
                      case "FlashpixVersion" :
                          exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                          break;

                      case "ComponentsConfiguration" :
                          exifData[tag] =
                                  StringValues.Components[exifData[tag][0]]
                                  + StringValues.Components[exifData[tag][1]]
                                  + StringValues.Components[exifData[tag][2]]
                                  + StringValues.Components[exifData[tag][3]];
                          break;
                  }
                  tags[tag] = exifData[tag];
              }
          }

          if (tags.GPSInfoIFDPointer) {
              gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
              for (tag in gpsData) {
                  switch (tag) {
                      case "GPSVersionID" :
                          gpsData[tag] = gpsData[tag][0]
                                  + "." + gpsData[tag][1]
                                  + "." + gpsData[tag][2]
                                  + "." + gpsData[tag][3];
                          break;
                  }
                  tags[tag] = gpsData[tag];
              }
          }

          return tags;
      }


      function getData(img, callback) {
          if (!img.complete)
              return false;
          if (!imageHasData(img)) {
              getImageData(img, callback);
          } else {
              if (callback) {
                  callback.call(img);
              }
          }
          return true;
      }

      function getTag(img, tag) {
          if (!imageHasData(img))
              return;
          return img.exifdata[tag];
      }

      function getAllTags(img) {
          if (!imageHasData(img))
              return {};
          var a,
                  data = img.exifdata,
                  tags = {};
          for (a in data) {
              if (data.hasOwnProperty(a)) {
                  tags[a] = data[a];
              }
          }
          return tags;
      }

      function pretty(img) {
          if (!imageHasData(img))
              return "";
          var a,
                  data = img.exifdata,
                  strPretty = "";
          for (a in data) {
              if (data.hasOwnProperty(a)) {
                  if (typeof data[a] == "object") {
                      if (data[a] instanceof Number) {
                          strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                      } else {
                          strPretty += a + " : [" + data[a].length + " values]\r\n";
                      }
                  } else {
                      strPretty += a + " : " + data[a] + "\r\n";
                  }
              }
          }
          return strPretty;
      }

      function readFromBinaryFile(file) {
          return findEXIFinJPEG(file);
      }


      return {
          readFromBinaryFile: readFromBinaryFile,
          pretty: pretty,
          getTag: getTag,
          getAllTags: getAllTags,
          getData: getData,
          Tags: ExifTags,
          TiffTags: TiffTags,
          GPSTags: GPSTags,
          StringValues: StringValues
      };

  })();

  angular.module('ImageCropper',[])
    .directive('imageCrop', function() {

      return {
        template: '<div id="image-crop-{{ rand }}" class="ng-image-crop ng-image-crop--{{ shape }}" ng-style="moduleStyles"><section ng-style="sectionStyles" ng-show="step==1"></section><section ng-style="sectionStyles" ng-show="step==2"><canvas class="cropping-canvas" width="{{ canvasWidth }}" height="{{ canvasHeight }}" ng-mousemove="onCanvasMouseMove($event)" ng-mousedown="onCanvasMouseDown($event)"></canvas><div ng-style="croppingGuideStyles" class="cropping-guide"></div><div class="zoom-handle" ng-mousemove="onHandleMouseMove($event)" ng-mousedown="onHandleMouseDown($event)" ng-mouseup="onHandleMouseUp($event)"><span>&larr; zoom &rarr;</span></div></section><section ng-style="sectionStyles" class="image-crop-section-final" ng-show="step==3"><img class="image-crop-final" ng-src="{{ croppedDataUri }}" /></section></div>',
        replace: true,
        restrict: 'AE',
        scope: {
		  crop: '=',
          width: '@',
          height: '@',
          shape: '@',
		  src: '=',
          resultBlob: '=',
		  result: '=',
          step: '=',
          padding: '@',
		  maxSize: '@'
        },
        link: function (scope, element, attributes) {
		  
		  var padding = scope.padding ? Number(scope.padding) : 200;
		  
          scope.rand = Math.round(Math.random() * 99999);
          scope.step = scope.step || 1;
          scope.shape = scope.shape || 'circle';
          scope.width = parseInt(scope.width, 10) || 300;
          scope.height = parseInt(scope.height, 10) || 300;

          scope.canvasWidth = scope.width + padding;
          scope.canvasHeight = scope.height + padding;

          var $elm = element[0];

          var $canvas = $elm.getElementsByClassName('cropping-canvas')[0];
          var $handle = $elm.getElementsByClassName('zoom-handle')[0];
          var $finalImg = $elm.getElementsByClassName('image-crop-final')[0];
          var $img = new Image();
          var fileReader = new FileReader();

          var maxLeft = 0, minLeft = 0, maxTop = 0, minTop = 0, imgLoaded = false, imgWidth = 0, imgHeight = 0;
          var currentX = 0, currentY = 0, dragging = false, startX = 0, startY = 0, zooming = false;
          var newWidth = imgWidth, newHeight = imgHeight;
          var targetX = 0, targetY = 0;
          var zoom = 1;
          var maxZoomGestureLength = 0;
          var maxZoomedInLevel = 0, maxZoomedOutLevel = 2;
          var minXPos = 0, maxXPos = (padding/2), minYPos = 0, maxYPos = (padding/2); // for dragging bounds		  
		  var maxSize = scope.maxSize ? Number(scope.maxSize) : null; //max size of the image in px
		  
          var zoomWeight = .6;
          var ctx = $canvas.getContext('2d');
          var exif = null;
          var files = [];

          // ---------- INLINE STYLES ----------- //
          scope.moduleStyles = {
            width: (scope.width + padding) + 'px',
            height: (scope.height + padding) + 'px'
          };

          scope.sectionStyles = {
            width: (scope.width + padding) + 'px',
            height: (scope.height + padding) + 'px'
          };

          scope.croppingGuideStyles = {
            width: scope.width + 'px',
            height: scope.height + 'px',
            top: (padding/2)+'px',
            left: (padding/2)+'px'
          };
  		  
		  function handleSize(base64ImageSrc) {
		  
			return new Promise(function(resolve, reject) {
				
				if(!maxSize) {
					return resolve(base64ImageSrc);
				}
				
				var img = new Image();
				img.src = base64ImageSrc;
				
				img.onload = function() {
				
					var height = img.height;
					var width = img.width;
															
					//if the size is already ok, just return the image
					if(height <= maxSize && width <= maxSize) {						
						return resolve(base64ImageSrc);
					}			 	
					
					var ratio = width/height;
					
					if(ratio > 1) {
						width = maxSize;
						height = maxSize/ratio;
					}
					else {
						width = maxSize*ratio;
						height = maxSize;
					}							
					
					width = Math.round(width);
					height = Math.round(height);			 	
					
					var canvas = document.createElement("canvas");
					canvas.width = width;
					canvas.height = height;			 	
					
					var context = canvas.getContext("2d");
									
					context.drawImage(img, 0, 0, img.width,    img.height,      // source
										   0, 0, canvas.width, canvas.height);  // destination	 
					
					context.save();
								
					var dataUrl = canvas.toDataURL();
					
					resolve(dataUrl);

				};
					
			});		  
				
		  }
					
		  function handleEXIF(base64ImageSrc, exif) {
		  		
			return new Promise(function(resolve, reject) {
								
				var img = new Image();
				img.src = base64ImageSrc;
				
				img.onload = function() {
				
					var canvas = document.createElement("canvas");
					
					if(exif.Orientation >= 5) {
						canvas.width = img.height;
						canvas.height = img.width;
					} else {
						canvas.width = img.width;
						canvas.height = img.height;
					}
					
					var context = canvas.getContext("2d");
		
					// change mobile orientation, if required
					switch(exif.Orientation){
						case 1:
							// nothing
							break;
						case 2:
							// horizontal flip
							context.translate(img.width, 0);
							context.scale(-1, 1);
							break;
						case 3:
							// 180 rotate left
							context.translate(img.width, img.height);
							context.rotate(Math.PI);
							break;
						case 4:
							// vertical flip
							context.translate(0, img.height);
							context.scale(1, -1);
							break;
						case 5:
							// vertical flip + 90 rotate right
							context.rotate(0.5 * Math.PI);
							context.scale(1, -1);
							break;
						case 6:
							// 90 rotate right
							context.rotate(0.5 * Math.PI);
							context.translate(0, -img.height);
							break;
						case 7:
							// horizontal flip + 90 rotate right
							context.rotate(0.5 * Math.PI);
							context.translate(img.width, -img.height);
							context.scale(-1, 1);
							break;
						case 8:
							// 90 rotate left					 		                   
							context.rotate(-0.5 * Math.PI);
							context.translate(-img.width, 0);
							break;
						default:
							break;
					}
					
					context.drawImage(img, 0, 0);	
					context.save();
					
					var dataUrl = canvas.toDataURL();
					
					resolve(dataUrl);										
				
				};
				
			});				
				
		  }
		  
		  function loadImage(base64ImageSrc) {
		  
			//get the EXIF information from the image
            var byteString = atob(base64ImageSrc.split(',')[1]);
            var binary = new BinaryFile(byteString, 0, byteString.length);
            exif = EXIF.readFromBinaryFile(binary);		  
           
		    //handle image size
            handleSize(base64ImageSrc).then(function(base64ImageSrc) {
			
				//if the image has EXIF orientation..
				if (exif && exif.Orientation && exif.Orientation > 1) {			
					return handleEXIF(base64ImageSrc, exif);
				} 
				//otherwise, just return the image without any treatment
				else {
					return base64ImageSrc;
				}
				
			}).then(function(base64ImageSrc) {
			
				$img.src = base64ImageSrc;
				
			}).catch(function(error) {							
				console.log(error);				
			});    
			
		  };
		  
          // ---------- EVENT HANDLERS ---------- //
          fileReader.onload = function(e) {
          	
          	loadImage(this.resultBlob);	

          };	  

          $img.onload = function() {
		  
			scope.step = 2;
			scope.$apply();		  
			
            ctx.drawImage($img, 0, 0);

            imgWidth = $img.width;
            imgHeight = $img.height;

            minLeft = (scope.width + padding) - this.width;
            minTop = (scope.height + padding) - this.height;
            newWidth = imgWidth;
            newHeight = imgHeight;
            
			if(imgWidth >= imgHeight) {
				maxZoomedInLevel = ($canvas.height - padding) / imgHeight;
			} else {
				maxZoomedInLevel = ($canvas.width - padding) / imgWidth;
			}		

            maxZoomGestureLength = to2Dp(Math.sqrt(Math.pow($canvas.width, 2) + Math.pow($canvas.height, 2)));

            updateDragBounds();
			
			var initialX = Math.round((minXPos + maxXPos)/2);
			var initialY = Math.round((minYPos + maxYPos)/2);
						
			moveImage(initialX, initialY);
			
          };
		  
          function reset() {
            files = [];
            zoom = 1;
			currentX = 0; 
			currentY = 0; 
			dragging = false; 
			startX = 0; 
			startY = 0; 
			zooming = false;
            ctx.clearRect(0, 0, $canvas.width, $canvas.height);            
            $img.src = '';
          }		  

          // ---------- PRIVATE FUNCTIONS ---------- //
          function moveImage(x, y) {
			
			x = x < minXPos ? minXPos : x;
			x = x > maxXPos ? maxXPos : x;
			y = y < minYPos ? minYPos : y;
			y = y > maxYPos ? maxYPos : y;			

            targetX = x;
            targetY = y;
			
            ctx.clearRect(0, 0, $canvas.width, $canvas.height);
            ctx.drawImage($img, x, y, newWidth, newHeight);
			
			return x == minXPos || x == maxXPos || y == minYPos || y == maxYPos;
          }

          function to2Dp(val) {
            return Math.round(val * 1000) / 1000;
          }

          function updateDragBounds() {
            // $img.width, $canvas.width, zoom

            minXPos = $canvas.width - ($img.width * zoom) - (padding/2);
            minYPos = $canvas.height - ($img.height * zoom) - (padding/2);

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

            zoom = proposedZoomLevel;
            // console.log('zoom', zoom);

            updateDragBounds();

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
            var zoomGestureRatio = to2Dp(hyp / maxZoomGestureLength);
            var newZoomDiff = to2Dp((maxZoomedOutLevel - maxZoomedInLevel) * zoomGestureRatio * zoomWeight);
            return diffX > 0 ? -newZoomDiff : newZoomDiff;
			
          }
          
		  function dataURItoBlob(dataURI) {
			    var byteString, 
			        mimestring;
			
			    if(dataURI.split(',')[0].indexOf('base64') !== -1 ) {
			        byteString = atob(dataURI.split(',')[1]);
			    } else {
			        byteString = decodeURI(dataURI.split(',')[1]);
			    }
			
			    mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0];
			
			    var content = new Array();
			    for (var i = 0; i < byteString.length; i++) {
			        content[i] = byteString.charCodeAt(i);
			    }
			
			    return new Blob([new Uint8Array(content)], {type: mimestring});
		  }       

          // ---------- SCOPE FUNCTIONS ---------- //

		  scope.$watch('src', function(){
			if(scope.src) {
				if(scope.step != 3) {
					if(typeof(scope.src) == 'Blob') {
						fileReader.readAsDataURL(scope.src);	
					} else {
						loadImage(scope.src);
					}
				}		
			} else {
				scope.step = 1;
				reset();
			}
		  });	

		  scope.$watch('crop',function(){
			if(scope.crop) {
				scope.doCrop();
				scope.crop = false;
			}
		  });	
		  
          $finalImg.onload = function() {			
            var tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.width - padding;
            tempCanvas.height = this.height - padding;
            tempCanvas.style.display = 'none';

            var tempCanvasContext = tempCanvas.getContext('2d');
            tempCanvasContext.drawImage($finalImg, -(padding/2), -(padding/2));

            $elm.getElementsByClassName('image-crop-section-final')[0].appendChild(tempCanvas);
			
			var dataUrl = tempCanvas.toDataURL();
			
			scope.result = dataUrl;
            scope.resultBlob = dataURItoBlob(dataUrl);
            
            scope.$apply();
          };

          scope.doCrop = function() {
            scope.croppedDataUri = $canvas.toDataURL();
            scope.step = 3;
          };

          scope.onCanvasMouseUp = function(e) {

            if (!dragging) {
              return;
            }

            e.preventDefault();
            e.stopPropagation(); // if event was on canvas, stop it propagating up

            startX = 0;
            startY = 0;
            dragging = false;
            currentX = targetX;
            currentY = targetY;

            removeBodyEventListener('mouseup', scope.onCanvasMouseUp);
            removeBodyEventListener('touchend', scope.onCanvasMouseUp);
            removeBodyEventListener('mousemove', scope.onCanvasMouseMove);
            removeBodyEventListener('touchmove', scope.onCanvasMouseMove);
          };

          $canvas.addEventListener('touchend', scope.onCanvasMouseUp, false);

          scope.onCanvasMouseDown = function(e) {
            startX = e.type === 'touchstart' ? e.changedTouches[0].clientX : e.clientX;
            startY = e.type === 'touchstart' ? e.changedTouches[0].clientY : e.clientY;
            zooming = false;
            dragging = true;

            addBodyEventListener('mouseup', scope.onCanvasMouseUp);
            addBodyEventListener('mousemove', scope.onCanvasMouseMove);
          };

          $canvas.addEventListener('touchstart', scope.onCanvasMouseDown, false);

          function addBodyEventListener(eventName, func) {
            document.documentElement.addEventListener(eventName, func, false);
          }

          function removeBodyEventListener(eventName, func) {
            document.documentElement.removeEventListener(eventName, func);
          }

          scope.onHandleMouseDown = function(e) {

            e.preventDefault();
            e.stopPropagation(); // if event was on handle, stop it propagating up

            startX = lastHandleX = (e.type === 'touchstart') ? e.changedTouches[0].clientX : e.clientX;
            startY = lastHandleY = (e.type === 'touchstart') ? e.changedTouches[0].clientY : e.clientY;
            dragging = false;
            zooming = true;

            addBodyEventListener('mouseup', scope.onHandleMouseUp);
            addBodyEventListener('touchend', scope.onHandleMouseUp);
            addBodyEventListener('mousemove', scope.onHandleMouseMove);
            addBodyEventListener('touchmove', scope.onHandleMouseMove);
			
          };

          $handle.addEventListener('touchstart', scope.onHandleMouseDown, false);

          scope.onHandleMouseUp = function(e) {

            // this is applied on the whole section so check we're zooming
            if (!zooming) {
              return;
            }

            e.preventDefault();
            e.stopPropagation(); // if event was on canvas, stop it propagating up

            startX = 0;
            startY = 0;
            zooming = false;
            currentX = targetX;
            currentY = targetY;

            removeBodyEventListener('mouseup', scope.onHandleMouseUp);
            removeBodyEventListener('touchend', scope.onHandleMouseUp);
            removeBodyEventListener('mousemove', scope.onHandleMouseMove);
            removeBodyEventListener('touchmove', scope.onHandleMouseMove);
          };

          $handle.addEventListener('touchend', scope.onHandleMouseUp, false);

          scope.onCanvasMouseMove = function(e) {

            e.preventDefault();
            e.stopPropagation();

            if (!dragging) {
              return;
            }

            var diffX = startX - ((e.type === 'touchmove') ? e.changedTouches[0].clientX : e.clientX); // how far mouse has moved in current drag
            var diffY = startY - ((e.type === 'touchmove') ? e.changedTouches[0].clientY : e.clientY); // how far mouse has moved in current drag
            /*targetX = currentX - diffX; // desired new X position
            targetY = currentY - diffY; // desired new X position*/

            moveImage(currentX - diffX, currentY - diffY);

          };

          $canvas.addEventListener('touchmove', scope.onCanvasMouseMove, false);

          var lastHandleX = null, lastHandleY = null;

          scope.onHandleMouseMove = function(e) {

            e.stopPropagation();
            e.preventDefault();

            // this is applied on the whole section so check we're zooming
            if (!zooming) {
              return false;
            }

            var diffX = lastHandleX - ((e.type === 'touchmove') ? e.changedTouches[0].clientX : e.clientX); // how far mouse has moved in current drag
            var diffY = lastHandleY - ((e.type === 'touchmove') ? e.changedTouches[0].clientY : e.clientY); // how far mouse has moved in current drag

            lastHandleX = (e.type === 'touchmove') ? e.changedTouches[0].clientX : e.clientX;
            lastHandleY = (e.type === 'touchmove') ? e.changedTouches[0].clientY : e.clientY;

            var zoomVal = calcZoomLevel(diffX, diffY);			
            zoomImage(zoomVal);

          };

          $handle.addEventListener('touchmove', scope.onHandleMouseMove, false);	  		 
		  	  		  
		  scope.onHandleMouseWheel = function(e){
			  e.preventDefault();		  
			  
			  zoomImage(e.deltaY > 0 ? -0.05 : 0.05);			  
		  };

		  $canvas.addEventListener('mousewheel', scope.onHandleMouseWheel);
		  $handle.addEventListener('mousewheel', scope.onHandleMouseWheel);

        }
      };
    });


})();