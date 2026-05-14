-- Set FULL for zones where group members >= requiredPlayers
UPDATE "Zone" z
SET status = 'FULL'
WHERE z.status != 'FULL'
AND (
  SELECT COUNT(*) FROM "GroupMember" gm
  INNER JOIN "Group" g ON g.id = gm."groupId"
  WHERE g."zoneId" = z.id
) >= z."requiredPlayers";
