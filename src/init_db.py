from database import engine
import models

def init_database():
    models.Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db() 