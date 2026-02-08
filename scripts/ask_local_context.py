import sys
import os
import argparse
import logging
from typing import List

# Suppress logging warnings
logging.getLogger().setLevel(logging.ERROR)

from llama_index.core import StorageContext, load_index_from_storage, Settings
from llama_index.embeddings.openai import OpenAIEmbedding

STORAGE_DIR = "storage_context"

def get_relevant_context_local(query_text, top_k=3):
    if not os.path.exists(STORAGE_DIR):
        print("❌ Error: No se encontró el índice local.")
        return []

    embed_model = OpenAIEmbedding(
        mode="similarity", 
        api_base="http://localhost:8080/v1", 
        api_key="sk-local",
        model_name="nomic-embed-text-v1.5"
    )
    Settings.llm = None 
    Settings.embed_model = embed_model

    try:
        # Nomic prefix requirement
        if not query_text.startswith("search_query:"):
            query_with_prefix = f"search_query: {query_text}"
        else:
            query_with_prefix = query_text

        storage_context = StorageContext.from_defaults(persist_dir=STORAGE_DIR)
        index = load_index_from_storage(storage_context)
        
        retriever = index.as_retriever(similarity_top_k=top_k)
        nodes = retriever.retrieve(query_with_prefix)
        return nodes
            
    except Exception as e:
        print(f"Error al consultar índice: {e}")
        return []

def print_results(query, nodes):
    if not nodes:
        print("No se encontró información relevante.")
        return

    print(f"--- CONTEXTO ENCONTRADO PARA: '{query}' ---\n")
    for i, node in enumerate(nodes):
        print(f"### Fragmento {i+1} (Score: {node.score:.4f})")
        print(f"Fuente: {node.metadata.get('file_path', 'N/A')}")
        print("Contenido:")
        print(node.node.get_text().replace("search_document: ", "").strip())
        print("\n------------------------------------------------\n")

def generate_answer(query, nodes, use_cloud=False):
    try:
        from openai import OpenAI
    except ImportError:
        print("Error: Librería 'openai' no instalada.")
        return

    client = None
    model_name = ""
    api_key = "sk-local"
    base_url = "https://openrouter.ai/api/v1" if use_cloud else "http://localhost:8080/v1"

    if use_cloud:
        api_key = os.environ.get("OPENROUTER_API_KEY")
        if not api_key:
            print("❌ Error: Necesitas definir OPENROUTER_API_KEY")
            return
        model_name = "mistralai/mistral-7b-instruct:free"
        print(f"☁️  Usando OpenRouter ({model_name})")
    else:
        model_name = "local-model" 
        print(f"🏠 Usando Servidor Local")

    try:
        client = OpenAI(base_url=base_url, api_key=api_key)
        
        context_str = "\n\n".join([f"Fuente: {n.metadata.get('file_path', 'N/A')}\n{n.node.get_text()}" for n in nodes])
        
        system_prompt = """Eres un experto en Next.js, React Server Components y Observabilidad (Prometheus).
Ayuda al usuario a entender el microservicio de observabilidad.
Usa STRICTAMENTE el contexto proporcionado."""

        user_prompt = f"""Contexto:
{context_str}

Pregunta: {query}
"""
        print(f"\n🤖 Generando respuesta...\n")
        stream = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            stream=True,
            temperature=0.3
        )
        
        for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                print(content, end="", flush=True)
        print("\n")
        
    except Exception as e:
        print(f"Error generando respuesta: {e}")

def main():
    parser = argparse.ArgumentParser(description="Busca contexto en Observability Dashboard")
    parser.add_argument("query", nargs="+", help="La pregunta a realizar")
    parser.add_argument("--chat", action="store_true", help="Generar respuesta con LLM")
    parser.add_argument("--cloud", action="store_true", help="Usar OpenRouter para la respuesta")
    parser.add_argument("--top-k", type=int, default=3, help="Número de fragmentos")
    
    args = parser.parse_args()
    query = " ".join(args.query)
    
    nodes = get_relevant_context_local(query, top_k=args.top_k)
    
    if args.chat or args.cloud:
        if nodes:
            generate_answer(query, nodes, use_cloud=args.cloud)
        else:
            print("No se encontró contexto suficiente.")
    else:
        print_results(query, nodes)

if __name__ == "__main__":
    main()
