console.log("Testing environment setup verification");

// Simple check to verify Node.js environment
console.log("Node.js version:", process.version);

// Check if required packages are available
try {
  require('@angular/core/testing');
  console.log("✅ @angular/core/testing is available");
} catch (e) {
  console.error("❌ @angular/core/testing is not available", e.message);
}

try {
  require('@angular/common/http/testing');
  console.log("✅ @angular/common/http/testing is available");
} catch (e) {
  console.error("❌ @angular/common/http/testing is not available", e.message);
}

// Check if Jasmine is available
try {
  const jasmine = require('jasmine-core');
  console.log("✅ Jasmine is available:", jasmine.version?.full || "version unknown");
} catch (e) {
  console.error("❌ Jasmine is not available", e.message);
}

// Check if Karma is available
try {
  const karma = require('karma');
  console.log("✅ Karma is available");
} catch (e) {
  console.error("❌ Karma is not available", e.message);
}

// Check if Cypress is available
try {
  const cypress = require('cypress');
  console.log("✅ Cypress is available");
} catch (e) {
  console.error("❌ Cypress is not available", e.message);
}

console.log("\nTo run Karma tests: npm test");
console.log("To run Cypress tests: npx cypress open");

console.log("\nVerification complete!");
