
-- Seed initial documents
INSERT INTO documents (title, description, category, file_type, file_size, is_important, file_url)
VALUES 
('Employee Handbook 2025', 'Complete guide to company policies, benefits, and expectations.', 'handbooks', 'PDF', '2.4 MB', true, 'https://example.com/handbook.pdf'),
('Code of Conduct', 'Standards of behavior and professional ethics.', 'policies', 'PDF', '856 KB', true, 'https://example.com/conduct.pdf'),
('Time Off Request Form', 'Template for requesting vacation, sick leave, or personal time.', 'forms', 'DOCX', '124 KB', false, 'https://example.com/timeoff.docx'),
('Remote Work Policy', 'Guidelines and expectations for remote and hybrid work.', 'policies', 'PDF', '1.2 MB', true, 'https://example.com/remote.pdf'),
('Expense Report Template', 'Standard form for submitting business expenses for reimbursement.', 'forms', 'XLSX', '98 KB', false, 'https://example.com/expense.xlsx');
