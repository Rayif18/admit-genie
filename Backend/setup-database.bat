@echo off
echo ========================================
echo Admit Genie Database Setup
echo ========================================
echo.
echo This script will drop and recreate all database tables.
echo Make sure MySQL is running and you have the correct password.
echo.
pause

echo.
echo Running database schema...
mysql -u root -p admit_genie < config\dbSchema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database setup completed successfully!
    echo.
    echo You can now start the server with: npm run dev
) else (
    echo.
    echo ❌ Database setup failed!
    echo Please check:
    echo 1. MySQL is running
    echo 2. Database 'admit_genie' exists
    echo 3. You have correct MySQL credentials
    echo.
    echo You can also run the SQL file manually in MySQL Workbench.
)

pause

