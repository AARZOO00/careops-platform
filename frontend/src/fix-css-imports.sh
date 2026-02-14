#!/bin/bash

echo "🔧 Fixing CSS import TypeScript errors..."

# Create globals.d.ts file
cat > frontend/src/globals.d.ts << 'EOF'
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module './globals.css' {
  const content: any;
  export default content;
}
EOF

# Update tsconfig.json to include the new declaration file
sed -i.bak 's/"include": \[/"include": \[\n    "src\/globals.d.ts",/g' frontend/tsconfig.json

echo "✅ Fixed! Now restart your TypeScript server:"
echo "   Ctrl+Shift+P -> TypeScript: Restart TS server"