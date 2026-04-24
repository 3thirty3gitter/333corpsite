
-- Remove placeholder KB articles and training modules
DELETE FROM knowledge_base_articles WHERE category IN ('Tools', 'Pricing', 'HR');
DELETE FROM training_modules WHERE category IN ('Onboarding', 'Technical', 'Soft Skills');

-- SinaLite File Preparation Guide
INSERT INTO knowledge_base_articles (title, content, category)
VALUES 
('SinaLite File Preparation Guide', 
'# SinaLite File Preparation Guide

To ensure high-quality prints and avoid production delays, follow these technical specifications for all SinaLite orders:

### 1. Color Space
*   **Always use CMYK.** Files submitted in RGB or Pantone will be automatically converted, which can cause significant color shifts.
*   **Blacks:** For large areas of black, use "Rich Black" (C:60 M:40 Y:40 K:100) instead of 100% K for a deeper finish.

### 2. Resolution
*   Minimum **300 DPI** at 100% size for standard commercial print (Business Cards, Flyers).
*   Minimum **150 DPI** at 100% size for Large Format (Banners, Coroplast).

### 3. Bleeds & Margins
*   **Standard Bleed:** 0.125" (1/8 inch) on all sides.
*   **Safe Zone:** Keep all text and important graphics at least 0.125" away from the trim line.
*   **No Crop Marks:** Do not include crop marks or registration marks in your final export unless specifically requested.

### 4. File Format
*   **Preferred:** PDF/X-1a:2001.
*   All fonts MUST be outlined (converted to curves).
*   Flatten all transparencies before exporting.', 
'Production'),

-- Large Format Proofing Checklist
('Large Format Proofing Checklist', 
'# Large Format Proofing Checklist

Before sending expensive rigid signs or banners to production, verify the following:

### 1. Scaling & Size
*   [ ] Is the document size correct? (e.g., 24"x36" should be exactly 24"x36" plus bleed).
*   [ ] If working at 1:10 scale, is the resolution high enough to scale up?

### 2. Finishing Requirements
*   [ ] **Grommets:** Are important elements clear of the corners? (Allow 1.5" safety).
*   [ ] **Hems:** Is there enough bleed for folded edges (usually 1")?
*   [ ] **Pole Pockets:** Have you accounted for the pocket size in your design?

### 3. Content & Quality
*   [ ] Are all fonts outlined?
*   [ ] Are images clear of pixelation at 100% zoom?
*   [ ] Is the spelling of the customer business name verified?
*   [ ] Are phone numbers and QR codes tested?', 
'Quality Control'),

-- Shipping & Logistics Overview
('Shipping & Logistics Overview', 
'# Shipping & Logistics Overview

Guidelines for selecting the correct shipping method for customer orders.

### 1. Local Courier (Small/Medium)
*   **Best for:** Business cards, flyers, small posters, apparel.
*   **Weight Limit:** Under 50 lbs.
*   **Condition:** Must fit in a standard vehicle.
*   **Timing:** Orders placed before 10 AM can often be delivered same-day.

### 2. Freight & LTL (Large/Bulky)
*   **Best for:** 4x8'' Coroplast sheets, Aluminum signs, Palletized bulk orders.
*   **Condition:** Anything that requires a liftgate or is over 100 lbs.
*   **Note:** Always confirm if the delivery location has a loading dock.

### 3. Cutoff Times
*   **Supplier Orders (SinaLite):** Must be placed by 2 PM EST for that business day.
*   **Internal Fulfillment:** Must be packed and labeled by 4 PM for next-day pickup.', 
'Logistics'),

-- Employee Handbook 2026
('Employee Handbook 2026', 
'# Employee Handbook 2026 (Internal Version)

## 1. Welcome to PilotSuite 2025
Welcome to the team! This handbook is designed to acquaint you with PilotSuite 2025 and provide information about working conditions, employee benefits, and some of the policies affecting your employment.

## 2. Company Culture & Mission
Our mission is to empower local businesses with high-quality printing and signage solutions through technology-driven efficiency. We value **Precision**, **Speed**, and **Innovation**.

## 3. Workplace Conduct
*   **Professionalism:** We maintain a professional environment. Interaction with customers should always be courteous and helpful.
*   **Shop Safety:** Every employee is responsible for maintaining a clean and safe workspace. Personal Protective Equipment (PPE) is mandatory in designated shop areas.
*   **Equipment Use:** Use of company machinery (printers, cutters, laminators) is restricted to trained personnel only.

## 4. Work Hours & Attendance
*   **Standard Hours:** Monday through Friday, 8:30 AM to 5:00 PM.
*   **Punctuality:** On-time arrival is critical for production scheduling. If you are going to be late, please notify your manager via the internal tools 30 minutes prior to your shift.

## 5. Compensation & Benefits
*   **Pay Cycle:** Employees are paid bi-weekly on Fridays.
*   **Benefits:** Full-time employees are eligible for health and dental benefits after a 90-day probationary period.

## 6. Time Off
*   **Vacation:** Accrual starts after the first month of employment.
*   **Sick Leave:** Employees are entitled to 5 paid sick days per calendar year.
*   **Holidays:** We observe all standard federal holidays.', 
'HR'),

-- Standard Terms of Employment
('Standard Terms of Employment', 
'# Standard Terms of Employment

### 1. Confidentiality & Non-Disclosure
Employees may have access to proprietary software, customer lists, and pricing strategies (including our SinaLite markup logic). This information is strictly confidential and must not be shared outside the company.

### 2. Intellectual Property
All designs, scripts, and software developed during work hours or using company resources are the exclusive property of PilotSuite 2025.

### 3. Equipment Responsibility
Company-issued equipment (laptops, specialized tools) must be handled with care. Intentional damage or negligence may result in disciplinary action.

### 4. Non-Solicitation
During employment and for 12 months following termination, employees agree not to solicit current customers or employees for competing business interests.', 
'Legal');

-- Insert Training Modules
INSERT INTO training_modules (title, description, category, duration_minutes)
VALUES 
('PilotSuite Hub Onboarding', 'A walkthrough of the internal hub, how to access documents, and how to use the SinaLite pricing tool.', 'Onboarding', 15),
('Shop Safety & Production Standards', 'Overview of chemical safety for inks, machinery lock-out procedures, and PPE requirements.', 'Safety', 45),
('Advanced SinaLite Quoting', 'Learn how to manage shipping estimations, handling fees, and bulk markup rules.', 'Production', 30);
