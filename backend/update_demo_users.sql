-- Update demo users with correct password hashes
UPDATE users SET password='$2b$12$dwoTC.kQPO8Jk50iXtDrd.7E6sWHNhztinUY6QIDgoDBpA2u.JaxK' WHERE email='employee@expensehub.com';
UPDATE users SET password='$2b$12$sj5Q/4YXsOMWtXemEOJ1vup6wnfqz0f6JvgPEx/5SABqBYawiCJ4O' WHERE email='manager@expensehub.com';
UPDATE users SET password='$2b$12$XtZDL3ezQY85ajBA/c6xyu7G4c0N8B.NebAQiBqe3HfTK1/HzYiTq' WHERE email='sarah.johnson@expensehub.com';
