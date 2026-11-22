// src/data/binaryLookupMaps.ts
var shadeToByte = { "Blue": 48, "Green": 49, "Dark Yellow": 50, "Light Green": 51, "Light Blue": 52, "Light Magenta": 53, "Violet": 54, "White": 55, "Red": 56, "Light Cyan": 57, "Dark Orange": 58, "Light Brown": 59, "Pink": 60, "Magenta": 61, "Dark Purple": 62, "Light Pink": 63, "Orange": 64, "Brown": 65, "Dark Green": 66, "Dark Brown": 67, "Purple": 68, "Dark Red": 69, "Light Orange": 70, "Light Yellow": 71, "Light Red": 72, "Cyan": 73, "Yellow": 74, "Grey": 75, "Dark Blue": 76, "Black": 77, "Dark Grey": 78, "Dark Cyan": 79, "Light Violet": 80, "Dark Violet": 81, "Dark Pink": 82, "Light Grey": 83, "Dark Magenta": 84, "Light Purple": 85 };
var byteToShadeOffset = { 48: "Blue", 49: "Green", 50: "Dark Yellow", 51: "Light Green", 52: "Light Blue", 53: "Light Magenta", 54: "Violet", 55: "White", 56: "Red", 57: "Light Cyan", 58: "Dark Orange", 59: "Light Brown", 60: "Pink", 61: "Magenta", 62: "Dark Purple", 63: "Light Pink", 64: "Orange", 65: "Brown", 66: "Dark Green", 67: "Dark Brown", 68: "Purple", 69: "Dark Red", 70: "Light Orange", 71: "Light Yellow", 72: "Light Red", 73: "Cyan", 74: "Yellow", 75: "Grey", 76: "Dark Blue", 77: "Black", 78: "Dark Grey", 79: "Dark Cyan", 80: "Light Violet", 81: "Dark Violet", 82: "Dark Pink", 83: "Light Grey", 84: "Dark Magenta", 85: "Light Purple" };
var byteToShadeNormal = ["Blue", "Green", "Dark Yellow", "Light Green", "Light Blue", "Light Magenta", "Violet", "White", "Red", "Light Cyan", "Dark Orange", "Light Brown", "Pink", "Magenta", "Dark Purple", "Light Pink", "Orange", "Brown", "Dark Green", "Dark Brown", "Purple", "Dark Red", "Light Orange", "Light Yellow", "Light Red", "Cyan", "Yellow", "Grey", "Dark Blue", "Black", "Dark Grey", "Dark Cyan", "Light Violet", "Dark Violet", "Dark Pink", "Light Grey", "Dark Magenta", "Light Purple"];
var offset = 48;
export {
  byteToShadeNormal,
  byteToShadeOffset,
  offset,
  shadeToByte
};
