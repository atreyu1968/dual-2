import sqlite3 from 'sqlite3'
import bcrypt from 'bcryptjs';
const { Database } = sqlite3;

// Helper to hash password
const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

// Initialize database connection
export const initDb = async () => {
  return new Promise((resolve, reject) => {
    const db = new Database('database.sqlite', async (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        // Promisify db.run and db.exec
        db.run = promisify(db.run.bind(db));
        db.exec = promisify(db.exec.bind(db));
        db.get = promisify(db.get.bind(db));
        db.all = promisify(db.all.bind(db));
        
        await createTables(db);
        await insertInitialData(db);
        resolve(db);
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Helper to promisify callback-based functions
const promisify = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
};

const createTables = async (db) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'center_tutor', 'company_tutor')),
      active BOOLEAN NOT NULL DEFAULT 1,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      full_name TEXT NOT NULL,
      department TEXT NOT NULL,
      must_change_password BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS academic_years (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      legal_name TEXT NOT NULL,
      tax_id TEXT UNIQUE NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      website TEXT,
      active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS work_centers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      tutor_id INTEGER,
      active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id),
      FOREIGN KEY (tutor_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      academic_year_id INTEGER NOT NULL,
      active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (academic_year_id) REFERENCES academic_years (id)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_name_year ON groups(name, academic_year_id);

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cial TEXT UNIQUE NOT NULL,
      dni TEXT NOT NULL UNIQUE,
      nuss TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      group_id INTEGER NOT NULL REFERENCES groups(id),
      active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups (id)
    );

    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
    
    CREATE INDEX IF NOT EXISTS idx_academic_years_active ON academic_years(active);
    CREATE INDEX IF NOT EXISTS idx_academic_years_dates ON academic_years(start_date, end_date);
    
    CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(active);
    CREATE INDEX IF NOT EXISTS idx_companies_tax_id ON companies(tax_id);
    
    CREATE INDEX IF NOT EXISTS idx_work_centers_company ON work_centers(company_id);
    CREATE INDEX IF NOT EXISTS idx_work_centers_tutor ON work_centers(tutor_id);
    CREATE INDEX IF NOT EXISTS idx_work_centers_active ON work_centers(active);
    
    CREATE INDEX IF NOT EXISTS idx_groups_academic_year ON groups(academic_year_id);
    CREATE INDEX IF NOT EXISTS idx_groups_active ON groups(active);
    
    CREATE INDEX IF NOT EXISTS idx_students_group ON students(group_id);
    CREATE INDEX IF NOT EXISTS idx_students_active ON students(active);
    CREATE INDEX IF NOT EXISTS idx_students_cial ON students(cial);
    CREATE INDEX IF NOT EXISTS idx_students_dni ON students(dni);

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      date DATE NOT NULL,
      hours INTEGER NOT NULL CHECK (hours > 0),
      status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students (id)
    );

    CREATE INDEX IF NOT EXISTS idx_activities_student ON activities(student_id);
    CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
    CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
  `);
};

const insertInitialData = async (db) => {
  // Check if admin user exists
  const adminUser = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);

  if (!adminUser) {
    const hashedPassword = await hashPassword('admin');
    console.log('Creating admin user...');
    
    await db.run(`
      INSERT INTO users (
        username, password, role, active, email, phone, full_name, department, must_change_password
      ) VALUES (
        'admin', ?, 'admin', 1, 'admin@example.com', '+34600000000', 'Administrador', 'Dirección', 1
      )
    `, hashedPassword);
    
    console.log('Admin user created successfully');
  }
};