// src/data/binaryLookupMaps.ts
var shadeToByte = { "Dark Blue": 48, "Green": 49, "Blue": 50, "Light Blue": 51, "Light Magenta": 52, "Violet": 53, "White": 54, "Red": 55, "Light Cyan": 56, "Dark Orange": 57, "Light Brown": 58, "Pink": 59, "Magenta": 60, "Light Pink": 61, "Dark Green": 62, "Dark Yellow": 63, "Orange": 64, "Brown": 65, "Dark Brown": 66, "Light Orange": 67, "Light Yellow": 68, "Light Red": 69, "Cyan": 70, "Yellow": 71, "Grey": 72, "Dark Red": 73, "Black": 74, "Dark Grey": 75, "Dark Cyan": 76, "Dark Violet": 77, "Light Green": 78, "Dark Pink": 79, "Light Grey": 80, "Dark Magenta": 81, "Dark Purple": 82, "Light Violet": 83, "Light Purple": 84, "Purple": 85 };
var byteToShadeOffset = { 48: "Dark Blue", 49: "Green", 50: "Blue", 51: "Light Blue", 52: "Light Magenta", 53: "Violet", 54: "White", 55: "Red", 56: "Light Cyan", 57: "Dark Orange", 58: "Light Brown", 59: "Pink", 60: "Magenta", 61: "Light Pink", 62: "Dark Green", 63: "Dark Yellow", 64: "Orange", 65: "Brown", 66: "Dark Brown", 67: "Light Orange", 68: "Light Yellow", 69: "Light Red", 70: "Cyan", 71: "Yellow", 72: "Grey", 73: "Dark Red", 74: "Black", 75: "Dark Grey", 76: "Dark Cyan", 77: "Dark Violet", 78: "Light Green", 79: "Dark Pink", 80: "Light Grey", 81: "Dark Magenta", 82: "Dark Purple", 83: "Light Violet", 84: "Light Purple", 85: "Purple" };
var byteToShadeNormal = ["Dark Blue", "Green", "Blue", "Light Blue", "Light Magenta", "Violet", "White", "Red", "Light Cyan", "Dark Orange", "Light Brown", "Pink", "Magenta", "Light Pink", "Dark Green", "Dark Yellow", "Orange", "Brown", "Dark Brown", "Light Orange", "Light Yellow", "Light Red", "Cyan", "Yellow", "Grey", "Dark Red", "Black", "Dark Grey", "Dark Cyan", "Dark Violet", "Light Green", "Dark Pink", "Light Grey", "Dark Magenta", "Dark Purple", "Light Violet", "Light Purple", "Purple"];
var offset = 48;
export {
  byteToShadeNormal,
  byteToShadeOffset,
  offset,
  shadeToByte
};
