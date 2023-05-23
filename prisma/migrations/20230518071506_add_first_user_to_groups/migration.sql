UPDATE groups
SET user_id = (
    SELECT id
    FROM users
    ORDER BY created_at ASC
    LIMIT 1
);
