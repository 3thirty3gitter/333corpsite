-- Add trent@3thirty3.ca as Admin
INSERT INTO employees (email, name, role) 
VALUES ('trent@3thirty3.ca', 'Trent', 'Admin') 
ON CONFLICT (email) DO UPDATE SET role = 'Admin';
