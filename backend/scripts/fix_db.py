from sqlalchemy import text
from app.core.database import SessionLocal, Base, engine

def upgrade_tables():
    db = SessionLocal()
    try:
        # Tenta adicionar as colunas potencialmente faltantes em agent_configs
        colunas = [
            "auto_mode BOOLEAN DEFAULT TRUE",
            "approval_required BOOLEAN DEFAULT FALSE",
            "working_hours_start VARCHAR(5) DEFAULT '00:00'",
            "working_hours_end VARCHAR(5) DEFAULT '23:59'",
            "working_days JSON DEFAULT '[0, 1, 2, 3, 4, 5, 6]'",
            "blacklist_words JSON DEFAULT '[]'",
            "whitelist_channels JSON DEFAULT '[]'",
            "respond_to_praise BOOLEAN DEFAULT TRUE",
            "respond_to_questions BOOLEAN DEFAULT TRUE",
            "respond_to_neutral BOOLEAN DEFAULT TRUE",
            "respond_to_criticism BOOLEAN DEFAULT TRUE",
            "skip_spam BOOLEAN DEFAULT TRUE",
            "skip_offensive BOOLEAN DEFAULT TRUE",
            "max_responses_per_run INTEGER DEFAULT 10",
            "max_comments_per_hour INTEGER DEFAULT 10"
        ]

        for col in colunas:
            try:
                # Extrai apenas o nome da coluna (primeira palavra antes do espaço) para o IF NOT EXISTS ou equivalente
                col_name = col.split(' ')[0]
                db.execute(text(f"ALTER TABLE agent_configs ADD COLUMN IF NOT EXISTS {col_name} {col.split(' ', 1)[1]}"))
            except Exception as e:
                # Ignora se a coluna já existe e o IF NOT EXISTS não for suportado pelo PG antigo, ou outro erro transitório
                db.rollback()
                try:
                    db.execute(text(f"ALTER TABLE agent_configs ADD COLUMN {col}"))
                except Exception as ex2:
                    db.rollback()
                    pass # Já deve existir
            
            db.commit()
            
        print("Migração concluída com sucesso! Tabela 'agent_configs' atualizada.")
    except Exception as e:
        db.rollback()
        print(f"Erro geral durante a migração: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    upgrade_tables()
