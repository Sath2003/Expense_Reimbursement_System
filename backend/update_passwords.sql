UPDATE users SET password = '$2b$12$ox9dY/hwu7CRECYFNlgY3uDwIfpNJLlDSbmMvnIVwQBqYeQcWwLYu' WHERE email IN ('sarah.johnson@expensehub.com', 'manager@expensehub.com');
SELECT email, password FROM users WHERE email IN ('sarah.johnson@expensehub.com', 'manager@expensehub.com');
