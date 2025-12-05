-- Check which colleges are missing cutoff data
-- Run this to see which colleges need cutoff data added

USE admit_genie;

-- Colleges without any cutoff data
SELECT 
    c.id,
    c.name,
    c.location,
    COUNT(cd.id) as cutoff_records
FROM colleges c
LEFT JOIN cutoff_data cd ON cd.college_id = c.id
GROUP BY c.id, c.name, c.location
HAVING cutoff_records = 0
ORDER BY c.id;

-- Colleges with cutoff data but missing for certain categories
SELECT 
    c.id,
    c.name,
    cd.category,
    COUNT(*) as records
FROM colleges c
JOIN cutoff_data cd ON cd.college_id = c.id
GROUP BY c.id, c.name, cd.category
ORDER BY c.id, cd.category;

-- Summary: Total colleges vs colleges with cutoff data
SELECT 
    (SELECT COUNT(*) FROM colleges) as total_colleges,
    (SELECT COUNT(DISTINCT college_id) FROM cutoff_data) as colleges_with_cutoff,
    (SELECT COUNT(*) FROM cutoff_data) as total_cutoff_records;

