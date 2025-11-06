use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Plan {
    pub id: Option<i64>,
    pub title: String,
    pub description: String,
    pub priority: String,
    pub category: String,
    pub completed: bool,
    #[serde(rename = "totalTime")]
    pub total_time: i64,
    #[serde(rename = "startDate")]
    pub start_date: String,
    #[serde(rename = "endDate")]
    pub end_date: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Reflection {
    pub id: Option<i64>,
    #[serde(rename = "planId")]
    pub plan_id: i64,
    pub content: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
}

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                priority TEXT NOT NULL,
                category TEXT NOT NULL,
                completed INTEGER NOT NULL DEFAULT 0,
                total_time INTEGER NOT NULL DEFAULT 0,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS reflections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plan_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
            )",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_reflections_plan_id ON reflections(plan_id)",
            [],
        )?;

        Ok(Database {
            conn: Mutex::new(conn),
        })
    }

    pub fn add_plan(&self, plan: &Plan) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO plans (title, description, priority, category, completed, total_time, start_date, end_date, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                plan.title,
                plan.description,
                plan.priority,
                plan.category,
                plan.completed as i32,
                plan.total_time,
                plan.start_date,
                plan.end_date,
                plan.created_at,
                plan.updated_at,
            ],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get_all_plans(&self) -> Result<Vec<Plan>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, title, description, priority, category, completed, total_time, start_date, end_date, created_at, updated_at
             FROM plans ORDER BY start_date DESC, created_at DESC"
        )?;

        let plans = stmt.query_map([], |row| {
            Ok(Plan {
                id: Some(row.get(0)?),
                title: row.get(1)?,
                description: row.get(2)?,
                priority: row.get(3)?,
                category: row.get(4)?,
                completed: row.get::<_, i32>(5)? != 0,
                total_time: row.get(6)?,
                start_date: row.get(7)?,
                end_date: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })?;

        plans.collect()
    }

    pub fn update_plan(&self, plan: &Plan) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE plans SET title=?1, description=?2, priority=?3, category=?4, 
             completed=?5, total_time=?6, start_date=?7, end_date=?8, updated_at=?9 WHERE id=?10",
            params![
                plan.title,
                plan.description,
                plan.priority,
                plan.category,
                plan.completed as i32,
                plan.total_time,
                plan.start_date,
                plan.end_date,
                plan.updated_at,
                plan.id,
            ],
        )?;
        Ok(())
    }

    pub fn delete_plan(&self, id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM plans WHERE id=?1", params![id])?;
        Ok(())
    }

    pub fn add_reflection(&self, reflection: &Reflection) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO reflections (plan_id, content, created_at) VALUES (?1, ?2, ?3)",
            params![reflection.plan_id, reflection.content, reflection.created_at],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get_reflections_for_plan(&self, plan_id: i64) -> Result<Vec<Reflection>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, plan_id, content, created_at FROM reflections WHERE plan_id=?1 ORDER BY created_at DESC"
        )?;

        let reflections = stmt.query_map(params![plan_id], |row| {
            Ok(Reflection {
                id: Some(row.get(0)?),
                plan_id: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
            })
        })?;

        reflections.collect()
    }

    pub fn delete_reflection(&self, id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM reflections WHERE id=?1", params![id])?;
        Ok(())
    }

    pub fn export_data(&self) -> Result<String> {
        let plans = self.get_all_plans()?;
        let mut export_data = serde_json::json!({
            "plans": plans,
            "reflections": {}
        });

        for plan in &plans {
            if let Some(id) = plan.id {
                let reflections = self.get_reflections_for_plan(id)?;
                export_data["reflections"][id.to_string()] = serde_json::json!(reflections);
            }
        }

        Ok(serde_json::to_string_pretty(&export_data).unwrap())
    }
}
