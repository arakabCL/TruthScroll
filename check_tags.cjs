const fs = require('fs');
const content = fs.readFileSync('src/components/FeedCard.jsx', 'utf8');

// Use a simple regex to find all JSX tags
let stack = [];
let regex = /<\/?([a-zA-Z0-9\.]+)\b[^>]*>/g;

let match;
while ((match = regex.exec(content)) !== null) {
  let text = match[0];
  let tag = match[1];
  
  // Skip self-closing tags
  if (text.endsWith('/>')) continue;
  
  // Skip tags inside strings or comments? We'll just assume they are actual tags for this test
  if (text.startsWith('</')) {
    if (stack.length === 0) {
      console.log(`EXTRA CLOSE ${tag} at index ${match.index} (line approx)`);
    } else {
      let last = stack.pop();
      if (last.tag !== tag) {
         console.log(`MISMATCH: Expected </${last.tag}> but found </${tag}> at index ${match.index}`);
      }
    }
  } else {
    stack.push({tag: tag, index: match.index});
  }
}
console.log('REMAINING UNCLOSED:', stack);
