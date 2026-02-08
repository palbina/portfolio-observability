#!/bin/bash
HOOK_DIR=".git/hooks"
HOOK_FILE="$HOOK_DIR/pre-commit"

if [ ! -d ".git" ]; then
    echo "Error: No se detecta repositorio git en $(pwd)"
    exit 1
fi

echo "Installing pre-commit hook..."

cat > $HOOK_FILE << 'EOF'
#!/bin/bash
# Hook inteligente RAG (Observability)

PYTHON_CMD="/home/peter/DEV/llama.cpp/.venv/bin/python"
SCRIPT_DIR=$(dirname "$0")

if [ -f "scripts/rag_git_check.py" ]; then
    $PYTHON_CMD scripts/rag_git_check.py
fi

exit 0
EOF

chmod +x $HOOK_FILE
echo "✅ Hook pre-commit instalado correctamente en $HOOK_FILE"
