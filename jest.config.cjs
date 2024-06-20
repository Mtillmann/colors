module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  testPathIgnorePatterns: ["/node_modules/"],
  
  transformIgnorePatterns: [`/node_modules/(?!(filenamify)|filename-reserved-regex)`],
}
