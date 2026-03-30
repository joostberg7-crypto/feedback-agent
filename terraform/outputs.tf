output "database_ip" {
  description = "Het publieke IP-adres van de database"
  value       = google_sql_database_instance.postgres_instance.public_ip_address
}

output "database_connection_name" {
  description = "De connectienaam voor Cloud Run (project:regio:instance)"
  value       = google_sql_database_instance.postgres_instance.connection_name
}