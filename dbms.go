package main

import (
	"database/sql"
	"fmt"
	"os"
)

// ConnectSQLite establishes a connection to the SQLite database.
func ConnectSQLite() (*sql.DB, error) {
	dbPath := "./app.db" // Ensure this file is bundled with the release
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("database file not found: %s", dbPath)
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	return db, nil
}

func SaveVideoState() {

}
