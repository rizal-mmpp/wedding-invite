import Database from "better-sqlite3";
import path from "path";

// Database file path
const dataDir =
  process.env.RSVP_DATA_DIR ||
  (process.env.VERCEL ? path.join("/tmp", "data") : path.join(process.cwd(), "data"));
const dbPath = path.join(dataDir, "wedding.db");

// Create database instance
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require("fs");
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

  // Create guest list table
  database.exec(`
    CREATE TABLE IF NOT EXISTS guest_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title TEXT,
      whatsapp TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      invited INTEGER DEFAULT 0,
      rsvp_status TEXT NOT NULL CHECK(rsvp_status IN ('attending', 'not_attending', 'not_responded')) DEFAULT 'not_responded',
      message_sent INTEGER DEFAULT 0,
      message_sent_at TEXT,
      rsvp_message TEXT,
      country TEXT NOT NULL CHECK(country IN ('Indonesia', 'Singapore', 'United States', 'Netherlands')) DEFAULT 'Indonesia',
      language TEXT NOT NULL CHECK(language IN ('id', 'en')) DEFAULT 'id',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  ensureGuestListColumns(database);
}

function ensureGuestListColumns(database: Database.Database) {
  const columns = database
    .prepare("PRAGMA table_info('guest_list')")
    .all() as Array<{ name: string }>;
  const existing = new Set(columns.map((col) => col.name));

  if (!existing.has("rsvp_message")) {
    database.exec("ALTER TABLE guest_list ADD COLUMN rsvp_message TEXT");
  }
  if (!existing.has("country")) {
    database.exec(
      "ALTER TABLE guest_list ADD COLUMN country TEXT NOT NULL DEFAULT 'Indonesia'"
    );
  }
  if (!existing.has("language")) {
    database.exec(
      "ALTER TABLE guest_list ADD COLUMN language TEXT NOT NULL DEFAULT 'id'"
    );
  }
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

export interface GuestListRow {
  id: number;
  name: string;
  title: string | null;
  whatsapp: string;
  slug: string;
  invited: 0 | 1;
  rsvp_status: "attending" | "not_attending" | "not_responded";
  message_sent: 0 | 1;
  message_sent_at: string | null;
  rsvp_message: string | null;
  country: "Indonesia" | "Singapore" | "United States" | "Netherlands";
  language: "id" | "en";
  created_at: string;
  updated_at: string;
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

// Guest list CRUD operations
export function getAllGuests(filters?: {
  invited?: boolean;
  messageSent?: boolean;
  rsvpStatus?: "attending" | "not_attending" | "not_responded";
}): GuestListRow[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (typeof filters?.invited === "boolean") {
    conditions.push("invited = ?");
    params.push(filters.invited ? 1 : 0);
  }
  if (typeof filters?.messageSent === "boolean") {
    conditions.push("message_sent = ?");
    params.push(filters.messageSent ? 1 : 0);
  }
  if (filters?.rsvpStatus) {
    conditions.push("rsvp_status = ?");
    params.push(filters.rsvpStatus);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const stmt = db.prepare(
    `SELECT * FROM guest_list ${whereClause} ORDER BY created_at DESC`
  );
  return stmt.all(...params) as GuestListRow[];
}

export function getGuestById(id: number): GuestListRow | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM guest_list WHERE id = ?");
  return stmt.get(id) as GuestListRow | undefined;
}

export function getGuestBySlug(slug: string): GuestListRow | undefined {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM guest_list WHERE slug = ?");
  return stmt.get(slug) as GuestListRow | undefined;
}

export function createGuest(guest: {
  name: string;
  title?: string;
  whatsapp: string;
  slug: string;
  invited?: boolean;
  rsvpStatus?: "attending" | "not_attending" | "not_responded";
  country?: "Indonesia" | "Singapore" | "United States" | "Netherlands";
  language?: "id" | "en";
}): GuestListRow {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO guest_list (name, title, whatsapp, slug, invited, rsvp_status, message_sent, country, language)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
  `);
  const result = stmt.run(
    guest.name,
    guest.title || null,
    guest.whatsapp,
    guest.slug,
    guest.invited ? 1 : 0,
    guest.rsvpStatus || "not_responded",
    guest.country || "Indonesia",
    guest.language || "id"
  );
  return getGuestById(result.lastInsertRowid as number)!;
}

export function updateGuest(id: number, updates: {
  name?: string;
  title?: string | null;
  whatsapp?: string;
  slug?: string;
  invited?: boolean;
  rsvpStatus?: "attending" | "not_attending" | "not_responded";
  messageSent?: boolean;
  messageSentAt?: string | null;
  rsvpMessage?: string | null;
  country?: "Indonesia" | "Singapore" | "United States" | "Netherlands";
  language?: "id" | "en";
}): GuestListRow | undefined {
  const db = getDb();
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (typeof updates.name === "string") {
    fields.push("name = ?");
    params.push(updates.name);
  }
  if (updates.title !== undefined) {
    fields.push("title = ?");
    params.push(updates.title);
  }
  if (typeof updates.whatsapp === "string") {
    fields.push("whatsapp = ?");
    params.push(updates.whatsapp);
  }
  if (typeof updates.slug === "string") {
    fields.push("slug = ?");
    params.push(updates.slug);
  }
  if (typeof updates.invited === "boolean") {
    fields.push("invited = ?");
    params.push(updates.invited ? 1 : 0);
  }
  if (updates.rsvpStatus) {
    fields.push("rsvp_status = ?");
    params.push(updates.rsvpStatus);
  }
  if (typeof updates.messageSent === "boolean") {
    fields.push("message_sent = ?");
    params.push(updates.messageSent ? 1 : 0);
  }
  if (updates.messageSentAt !== undefined) {
    fields.push("message_sent_at = ?");
    params.push(updates.messageSentAt);
  }
  if (updates.rsvpMessage !== undefined) {
    fields.push("rsvp_message = ?");
    params.push(updates.rsvpMessage);
  }
  if (updates.country) {
    fields.push("country = ?");
    params.push(updates.country);
  }
  if (updates.language) {
    fields.push("language = ?");
    params.push(updates.language);
  }

  if (!fields.length) {
    return getGuestById(id);
  }

  fields.push("updated_at = datetime('now')");
  const stmt = db.prepare(`UPDATE guest_list SET ${fields.join(", ")} WHERE id = ?`);
  stmt.run(...params, id);
  return getGuestById(id);
}

export function deleteGuest(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM guest_list WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}
