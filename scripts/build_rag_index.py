import os
import sys
import logging
from tqdm import tqdm

# Silenciar logs HTTP verbosos
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("openai").setLevel(logging.WARNING)

from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    Settings,
    StorageContext,
    Document
)
from llama_index.core.node_parser import TokenTextSplitter
from llama_index.embeddings.openai import OpenAIEmbedding

# Directorio de almacenamiento del índice
STORAGE_DIR = "storage_context"

# Configuración del servidor local - Nomic Embed Text v1.5
# Se asume que llama-server corre en puerto 8080 (compartido con llama.cpp)
embed_model = OpenAIEmbedding(
    mode="similarity", 
    api_base="http://localhost:8080/v1", 
    api_key="sk-local",
    model_name="nomic-embed-text-v1.5",
    timeout=300.0,
    embed_batch_size=12, 
)

Settings.llm = None
Settings.embed_model = embed_model
Settings.chunk_size = 512
Settings.chunk_overlap = 50

# Configuración de Directorios a Indexar (Específico para Next.js App Router)
SOURCE_DIRS = [
    "docs", 
    "app",        # Pages & API Routes
    "components", # React Components
    "lib"         # Utilities (Prometheus helper, etc)
]

# Extensiones permitidas
ALLOWED_EXTS = [
    ".md", ".txt",           # Docs
    ".ts", ".tsx", ".js", ".jsx",  # Code
    ".json", ".yaml", ".yml",      # Config
    ".css",                  # Styles
    ".dockerfile", "Dockerfile"
]

def build_index():
    print(f"🔄 Iniciando Indexación de Portfolio Observability...")
    
    all_documents = []
    
    for directory in SOURCE_DIRS:
        if not os.path.exists(directory):
            print(f"⚠️  Advertencia: No existe el directorio {directory}, saltando...")
            continue
            
        print(f"📂 Cargando archivos desde {directory}/...")
        try:
            reader = SimpleDirectoryReader(
                input_dir=directory, 
                recursive=True, 
                required_exts=ALLOWED_EXTS,
                exclude=["**/node_modules/*", "**/dist/*", "**/.next/*", "**/.git/*"]
            )
            docs = reader.load_data()
            print(f"   -> Encontrados {len(docs)} archivos.")
            all_documents.extend(docs)
        except Exception as e:
            print(f"   ❌ Error leyendo {directory}: {e}")

    if not all_documents:
        print("❌ Error Fatal: No se encontraron documentos para indexar.")
        return

    # Limpiar metadata
    print("🧹 Limpiando metadatos innecesarios...")
    for doc in all_documents:
        doc.excluded_embed_metadata_keys = ['file_size', 'creation_date', 'last_modified_date']
        doc.excluded_llm_metadata_keys = ['file_size', 'creation_date', 'last_modified_date']

    print(f"📚 Total de documentos a procesar: {len(all_documents)}")

    # Splitter
    text_splitter = TokenTextSplitter(chunk_size=512, chunk_overlap=50)
    
    print("✂️  Dividiendo en chunks (Tokens)...")
    nodes = text_splitter.get_nodes_from_documents(all_documents)
    print(f"🧩 Total de nodos (chunks) generados: {len(nodes)}")

    # Prefijos Nomic v1.5
    print("✅ Usando Nomic Embed v1.5 (Añadiendo prefijo 'search_document: ')")
    
    for node in nodes:
        clean_text = node.text.replace('\x00', '').replace('\r', '\n')
        node.text = f"search_document: {clean_text}"

    # Crear índice
    index = VectorStoreIndex([])
    
    BATCH_SIZE = 12
    print(f"🚀 Insertando nodos en Vector Store (Batch={BATCH_SIZE})...")
    success_count = 0
    fail_count = 0
    
    for i in tqdm(range(0, len(nodes), BATCH_SIZE)):
        batch = nodes[i : i + BATCH_SIZE]
        try:
            index.insert_nodes(batch)
            success_count += len(batch)
        except Exception as e:
            for node in batch:
                try:
                    index.insert_nodes([node])
                    success_count += 1
                except:
                    fail_count += 1

    print(f"\n✨ Indexación finalizada.")
    print(f"✅ Chunk insertados: {success_count}")
    print(f"❌ Fallos: {fail_count}")

    if success_count > 0:
        print("💾 Guardando índice en disco...")
        index.storage_context.persist(persist_dir=STORAGE_DIR)
        print(f"🎉 ¡COMPLETADO! Índice guardado en {os.path.abspath(STORAGE_DIR)}")
    else:
        print("❌ Falló la indexación completa.")

if __name__ == "__main__":
    build_index()
