import { mkdirSync } from 'node:fs'
import { dirname,resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
export function openDatabase(path=process.env.INSIGHT_DB_PATH||'./data/insight.db'){
  const target=path===':memory:'?path:resolve(path);if(target!==':memory:')mkdirSync(dirname(target),{recursive:true})
  const db=new DatabaseSync(target);db.exec('PRAGMA foreign_keys=ON')
  for(const sql of[
    `CREATE TABLE IF NOT EXISTS workspaces(id TEXT PRIMARY KEY,name TEXT NOT NULL,admin_key_hash TEXT NOT NULL,plan TEXT NOT NULL DEFAULT 'starter',created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id),repo_full_name TEXT NOT NULL,name TEXT NOT NULL,homepage_url TEXT,visibility TEXT NOT NULL DEFAULT 'private',write_key_hash TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,updated_at TEXT NOT NULL,UNIQUE(workspace_id,repo_full_name))`,
    `CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,workspace_id TEXT NOT NULL REFERENCES workspaces(id),project_id TEXT NOT NULL REFERENCES projects(id),session_hash TEXT NOT NULL,event_name TEXT NOT NULL,app TEXT NOT NULL,page TEXT,properties_json TEXT NOT NULL DEFAULT '{}',revenue REAL NOT NULL DEFAULT 0,currency TEXT NOT NULL DEFAULT 'JPY',occurred_at TEXT NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS events_workspace_time_idx ON events(workspace_id,occurred_at)`,
    `CREATE INDEX IF NOT EXISTS events_project_time_idx ON events(project_id,occurred_at)`
  ])db.prepare(sql).run()
  return db
}
