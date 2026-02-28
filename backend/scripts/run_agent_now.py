import os
import sys

# Ajustar o sys.path para o Python encontrar o diretório "app" do backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.integration import SocialIntegration
from app.tasks.agent_runner import run_agent_for_integration

def main():
    db = SessionLocal()
    try:
        # Pega a primeira integração ativa do banco
        integration = db.query(SocialIntegration).filter(
            SocialIntegration.is_active == True
        ).first()

        if not integration:
            print("Nenhuma integração ativa encontrada no banco de dados.")
            print("Vá até o painel (aba Agentes) e certifique-se de que há um agente ligado.")
            return

        print(f"Iniciando agente para a integração '{integration.channel_name}' (ID: {integration.id})...")
        print("Isso vai buscar os comentários na plataforma e gerar respostas via IA.")
        
        # Executa o agente de forma síncrona (imediata), ignorando a fila do Celery!
        run_agent_for_integration(integration.id)
        
        print("\nPronto! Agente executado com sucesso.")
        print("Verifique os logs ou o painel para ver as respostas geradas.")
    except Exception as e:
        print(f"Ocorreu um erro ao rodar o agente: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
