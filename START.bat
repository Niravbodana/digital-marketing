@echo off
title Bodana Setup
cd /d "%~dp0"

echo ============================================
echo   BODANA CREATION MACHINE - START
echo ============================================
echo.
echo Folder: %CD%
echo.

if not exist package.json (
  echo ERROR: package.json nahi mili.
  echo Tum GALAT folder mein ho.
  echo "bodana-digital" folder ke ANDAR ye file chalao.
  echo.
  pause
  exit /b 1
)

echo [1/3] Creating keys.env ...
if not exist keys.env (
  echo DATABASE_URL=file:./dev.db> keys.env
  echo ADMIN_EMAILS=niravb68@gmail.com>> keys.env
  echo SINGLE_TENANT=true>> keys.env
  echo GROQ_API_KEY=>> keys.env
  echo GOOGLE_API_KEY=>> keys.env
  echo GEMINI_API_KEY=>> keys.env
  echo.
  echo Notepad khul raha hai - keys PASTE karo fir Save + band karo:
  echo   GROQ_API_KEY=gsk_...
  echo   GOOGLE_API_KEY=AQ...
  echo   GEMINI_API_KEY=AQ...
  echo.
  notepad keys.env
) else (
  echo keys.env already exists.
)

echo.
echo [2/3] npm install ...
call npm install
if errorlevel 1 (
  echo npm install failed.
  pause
  exit /b 1
)

echo.
echo [3/3] Starting server ...
echo.
echo Browser mein kholo:
echo   http://localhost:3000/login
echo   http://localhost:3000/setup
echo   http://localhost:3000/keys
echo   http://localhost:3000/studio
echo   http://localhost:3000/admin
echo.
call npm run dev
pause
