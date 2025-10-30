const fs = require('fs');
const path = require('path');

console.log('Checking for common build issues...\n');

// Check 1: Required files exist
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  'app/layout.tsx',
  'app/page.tsx'
];

console.log('1. Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✓ ${file} exists`);
  } else {
    console.log(`   ✗ ${file} missing`);
  }
});

// Check 2: Package.json scripts
console.log('\n2. Checking package.json scripts:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log(`   ✓ Build script found: ${packageJson.scripts.build}`);
  } else {
    console.log('   ✗ No build script found');
  }
} catch (err) {
  console.log('   ✗ Error reading package.json');
}

// Check 3: Basic syntax check of main files
console.log('\n3. Checking main app files for basic syntax:');

function checkBasicSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Basic checks
    const hasUnclosedBrackets = (content.match(/\(/g) || []).length !== (content.match(/\)/g) || []).length;
    const hasUnclosedBraces = (content.match(/\{/g) || []).length !== (content.match(/\}/g) || []).length;

    if (hasUnclosedBrackets || hasUnclosedBraces) {
      console.log(`   ⚠️  ${filePath} may have unclosed brackets`);
      return false;
    }

    console.log(`   ✓ ${filePath} looks OK`);
    return true;
  } catch (err) {
    console.log(`   ✗ Error reading ${filePath}: ${err.message}`);
    return false;
  }
}

checkBasicSyntax('app/layout.tsx');
checkBasicSyntax('app/page.tsx');
checkBasicSyntax('app/db/page.tsx');
checkBasicSyntax('app/db/schema.ts');

console.log('\nBuild check completed.');