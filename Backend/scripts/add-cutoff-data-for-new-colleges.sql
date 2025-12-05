-- Script to add cutoff data for new colleges
-- This will help populate cutoff_data table for colleges that were added but don't have cutoff entries

USE admit_genie;

-- First, let's see which colleges don't have cutoff data
SELECT 
    c.id as college_id,
    c.name as college_name,
    co.id as course_id,
    co.course_name,
    COUNT(cd.id) as cutoff_count
FROM colleges c
JOIN courses co ON c.college_id = c.id
LEFT JOIN cutoff_data cd ON cd.college_id = c.id AND cd.course_id = co.id
GROUP BY c.id, c.name, co.id, co.course_name
HAVING cutoff_count = 0
ORDER BY c.id, co.id;

-- Example: Add cutoff data for Mangalore/Udupi region colleges
-- You need to adjust college_id and course_id based on your actual data

-- For St Joseph Engineering College (SJEC) - CSE
-- Replace college_id and course_id with actual IDs from your database
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT 
    c.id,
    co.id,
    'General',
    2024,
    4500,
    8000,
    6250,
    4500,
    8000
FROM colleges c
JOIN courses co ON c.college_id = c.id
WHERE c.name LIKE '%St Joseph Engineering College%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1;

-- For MITE - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT 
    c.id,
    co.id,
    'General',
    2024,
    5500,
    9500,
    7500,
    5500,
    9500
FROM colleges c
JOIN courses co ON c.college_id = c.id
WHERE c.name LIKE '%Mangalore Institute of Technology%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1;

-- For Canara Engineering College - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT 
    c.id,
    co.id,
    'General',
    2024,
    7000,
    12000,
    9500,
    7000,
    12000
FROM colleges c
JOIN courses co ON c.college_id = c.id
WHERE c.name LIKE '%Canara Engineering College%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1;

-- Add more colleges as needed...
-- You can run this query to see all colleges without cutoff data:
-- SELECT c.id, c.name, COUNT(cd.id) as cutoff_count 
-- FROM colleges c 
-- LEFT JOIN cutoff_data cd ON cd.college_id = c.id 
-- GROUP BY c.id, c.name 
-- HAVING cutoff_count = 0;

