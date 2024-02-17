CREATE TABLE IF NOT EXISTS completed_activities (
  id TEXT PRIMARY KEY,
  activity_id TEXT,
  date TEXT,
  last_modified,
  duration,
  intensity,
  notes TEXT
)
