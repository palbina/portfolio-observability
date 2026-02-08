import sys
import subprocess
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from ask_local_context import get_relevant_context_local

def get_staged_files():
    try:
        result = subprocess.run(
            ['git', 'diff', '--name-only', '--cached'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        files = result.stdout.strip().split('\n')
        return [f for f in files if f] 
    except subprocess.CalledProcessError:
        return []

def main():
    staged_files = get_staged_files()
    if not staged_files:
        return

    # Extensiones Next.js / Observability
    RELEVANT_EXTS = ('.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.json', '.yml', '.yaml', '.dockerfile', 'Dockerfile')

    print("\n🔮 Observability RAG Hook: Analizando cambios...\n")
    
    seen_sources = set()
    found_info = False

    for file in staged_files:
        if not file.endswith(RELEVANT_EXTS) and 'Dockerfile' not in file:
            continue

        print(f"  -> Buscando contexto para: {file}")
        
        basename = os.path.basename(file).replace('.', ' ').replace('-', ' ')
        query = f"{basename} architecture nextjs usage"
        
        nodes = get_relevant_context_local(query, top_k=1)
        
        for node in nodes:
            if node.score > 0.65:
                source = node.metadata.get('file_path', 'N/A')
                if source in seen_sources: continue
                seen_sources.add(source)
                
                print(f"\n⚠️  DOCUMENTACIÓN RELEVANTE ENCONTRADA")
                print(f"    Archivo modificado: {file}")
                print(f"    Ver Referencia: {source} (Relevancia: {node.score:.2f})")
                print(f"    Extracto: {node.node.get_text().replace('search_document: ', '')[:200].strip()}...\n")
                found_info = True

    if found_info:
        print("💡 Consejo: Revisa los docs de Observabilidad para asegurar integridad de métricas.")
    
    print("\n------------------------------------------------\n")

if __name__ == "__main__":
    main()
