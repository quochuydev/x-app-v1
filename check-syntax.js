const fs = require('fs');
const path = require('path');

function checkFileSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Basic syntax checks for TypeScript/React files
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      // Check for basic syntax issues
      const lines = content.split('\n');
      let hasError = false;

      lines.forEach((line, index) => {
        // Check for unclosed brackets
        const openBrackets = (line.match(/\(/g) || []).length;
        const closeBrackets = (line.match(/\)/g) || []).length;
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;

        if (openBrackets !== closeBrackets || openBraces !== closeBraces) {
          console.log(`Possible bracket mismatch in ${filePath}:${index + 1}: ${line.trim()}`);
          hasError = true;
        }
      });

      if (!hasError) {
        console.log(`✓ ${filePath} - Syntax looks OK`);
      }
    }
  } catch (error) {
    console.log(`✗ Error reading ${filePath}: ${error.message}`);
  }
}

function checkDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      checkDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      checkFileSyntax(filePath);
    }
  });
}

console.log('Checking syntax...');
checkDirectory('./app');
console.log('Syntax check completed.');