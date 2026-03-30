# Maak de Cloud SQL Database Instance aan
resource "google_sql_database_instance" "postgres_instance" {
  name             = "feedback-agent-db-instance"
  database_version = "POSTGRES_15"
  region           = "europe-west4"

  settings {
    tier = "db-f1-micro" # De kleinste en goedkoopste optie voor een PoC

    # Voor nu zetten we een publiek IP open zodat we lokaal makkelijk kunt testen.
    # later gaan we dit beveiligen.
    ip_configuration {
      ipv4_enabled = true
    }
  }

  # Voorkom dat Terraform de database per ongeluk weggooit
  deletion_protection = false 
}

# Maak de daadwerkelijke database aan ín de instance
resource "google_sql_database" "feedback_db" {
  name     = "feedback_sessions"
  instance = google_sql_database_instance.postgres_instance.name
}

# Maak een database gebruiker aan
resource "google_sql_user" "db_user" {
  name     = "backend_user"
  instance = google_sql_database_instance.postgres_instance.name
  password = "super-secret-password-123!" # Normaal via Secret Manager, maar voor nu hardcoded om te testen
}