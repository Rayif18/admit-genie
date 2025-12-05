-- Comprehensive script to add KCET cutoff data for all Mangalore/Karnataka colleges
-- This script uses college names and course names to find IDs and add cutoff data

USE admit_genie;

-- ========================================
-- MANGALORE/UDUPI REGION COLLEGES
-- ========================================

-- St Joseph Engineering College (SJEC) - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 4500, 8000, 6250, 4500, 8000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%St Joseph Engineering College%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- MITE - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 5500, 9500, 7500, 5500, 9500
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Mangalore Institute of Technology%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- Canara Engineering College - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 7000, 12000, 9500, 7000, 12000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Canara Engineering College%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- Srinivas Institute of Technology - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 8500, 14000, 11250, 8500, 14000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Srinivas Institute of Technology%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- Bearys Institute of Technology - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 10000, 18000, 14000, 10000, 18000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Bearys Institute of Technology%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- Yenepoya Institute of Technology - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 12000, 20000, 16000, 12000, 20000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Yenepoya Institute of Technology%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- Alva's Institute of Engineering & Technology - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 9500, 16000, 12750, 9500, 16000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Alva%Institute of Engineering%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- PA College of Engineering - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 13000, 22000, 17500, 13000, 22000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%PA College of Engineering%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- ========================================
-- BANGALORE MID-TIER COLLEGES
-- ========================================

-- Bangalore Institute of Technology (BIT) - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 4000, 7500, 5750, 4000, 7500
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Bangalore Institute of Technology%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- RNS Institute of Technology - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 4500, 8500, 6500, 4500, 8500
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%RNS Institute of Technology%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- JSS Academy of Technical Education - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 5000, 9000, 7000, 5000, 9000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%JSS Academy of Technical Education%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- CMR Institute of Technology - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 5500, 10000, 7750, 5500, 10000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%CMR Institute of Technology%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- Acharya Institute of Technology - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 6000, 11000, 8500, 6000, 11000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Acharya Institute of Technology%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- Global Academy of Technology - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 6500, 12000, 9250, 6500, 12000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Global Academy of Technology%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- Atria Institute of Technology - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 7000, 13000, 10000, 7000, 13000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Atria Institute of Technology%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- Vidyavardhaka College of Engineering - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 7500, 14000, 10750, 7500, 14000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Vidyavardhaka College of Engineering%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- Sri Jayachamarajendra College of Engineering - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 8000, 15000, 11500, 8000, 15000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Sri Jayachamarajendra College of Engineering%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- KLS Gogte Institute of Technology - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 9000, 16500, 12750, 9000, 16500
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%KLS Gogte Institute of Technology%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- Basaveshwar Engineering College - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 10000, 18000, 14000, 10000, 18000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Basaveshwar Engineering College%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- ========================================
-- LOWER-TIER COLLEGES
-- ========================================

-- K.S. Institute of Technology - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 14000, 25000, 19500, 14000, 25000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%K.S. Institute of Technology%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- The Oxford College of Engineering - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 15000, 27000, 21000, 15000, 27000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Oxford College of Engineering%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- Sapthagiri College of Engineering - CSE
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank)
SELECT c.id, co.id, 'General', 2024, 16000, 28000, 22000, 16000, 28000
FROM colleges c
JOIN courses co ON co.college_id = c.id
WHERE c.name LIKE '%Sapthagiri College of Engineering%' 
  AND co.course_name LIKE '%Computer%'
LIMIT 1
ON DUPLICATE KEY UPDATE avg_rank = VALUES(avg_rank);

-- Continue adding more colleges as needed...
-- You can add OBC, SC, ST categories similarly by changing the category value

SELECT 'Cutoff data insertion completed!' as Status;
SELECT CONCAT('Total cutoff records: ', COUNT(*)) FROM cutoff_data WHERE year = 2024;

