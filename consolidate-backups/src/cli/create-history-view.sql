CREATE VIEW IF NOT EXISTS history AS
SELECT
	ca.id as completed_activities_id,
	ca.date,
	a.name as name,
	a.id as activity_id,
	ca.last_modified,
	ca.duration,
	ca.intensity,
	ca.notes
FROM completed_activities ca
JOIN activities a
ON a.id == ca.activity_id
ORDER by ca.date ASC
