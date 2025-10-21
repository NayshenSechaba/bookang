#!/bin/bash
# Script to replace all purple colors with blue colors in the codebase

find src/components src/pages -name "*.tsx" -type f -exec sed -i '' 's/purple/blue/g' {} \;

echo "Replaced all purple colors with blue colors"
