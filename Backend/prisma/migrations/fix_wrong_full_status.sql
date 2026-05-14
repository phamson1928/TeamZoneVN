-- Set zone về OPEN nếu chưa đủ người
UPDATE "Zone" z
SET status = 'OPEN'
WHERE z.status = 'FULL'
AND (
  CASE WHEN EXISTS (SELECT 1 FROM "Group" g WHERE g."zoneId" = z.id)
    THEN (SELECT COUNT(*) FROM "GroupMember" gm INNER JOIN "Group" g ON g.id = gm."groupId" WHERE g."zoneId" = z.id)
    ELSE (SELECT COUNT(*) FROM "ZoneJoinRequest" jr WHERE jr."zoneId" = z.id AND jr.status = 'APPROVED') + 1
  END
) < (z."requiredPlayers" + 1);
