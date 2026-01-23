import Database from "better-sqlite3";
import path from "path";

// Database file path
const dbPath = path.join(process.cwd(), "data", "wedding.db");

// Create database instance
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require("fs");
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");

    // Initialize tables
    initializeTables(db);
  }
  return db;
}

function initializeTables(database: Database.Database) {
  // Create RSVP table
  database.exec(`
    CREATE TABLE IF NOT EXISTS rsvp_guests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      attendance TEXT NOT NULL CHECK(attendance IN ('attending', 'not_attending', 'pending')),
      number_of_guests INTEGER DEFAULT 1,
      message TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

export interface RSVPGuestRow {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  attendance: "attending" | "not_attending" | "pending";
  number_of_guests: number;
  message: string | null;
  created_at: string;
}

// RSVP CRUD operations
export function getAllRSVPGuests(): RSVPGuestRow[] {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM rsvp_guests ORDER BY created_at DESC");
  return stmt.all() as RSVPGuestRow[];
}

export function getRSVPGuestById(id: number): RSVPGuestRow | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM rsvp_guests WHERE id = ?");
  return stmt.get(id) as RSVPGuestRow | undefined;
}

export function createRSVPGuest(guest: {
  name: string;
  email?: string;
  phone?: string;
  attendance: "attending" | "not_attending" | "pending";
  numberOfGuests?: number;
  message?: string;
}): RSVPGuestRow {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO rsvp_guests (name, email, phone, attendance, number_of_guests, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    guest.name,
    guest.email || null,
    guest.phone || null,
    guest.attendance,
    guest.numberOfGuests || 1,
    guest.message || null
  );
  return getRSVPGuestById(result.lastInsertRowid as number)!;
}

export function deleteRSVPGuest(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM rsvp_guests WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

export function deleteAllRSVPGuests(): number {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM rsvp_guests");
  const result = stmt.run();
  return result.changes;
}
