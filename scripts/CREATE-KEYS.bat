@echo off
cd /d "%~dp0\.."
echo.
echo Opening Notepad to create keys.env ...
echo.
echo Paste your Groq and Gemini keys in this format:
echo.
echo DATABASE_URL=file:./dev.db
echo ADMIN_EMAILS=niravb68@gmail.com
echo SINGLE_TENANT=true
echo GROQ_API_KEY=paste-groq-key-here
echo GOOGLE_API_KEY=paste-gemini-key-here
echo GEMINI_API_KEY=paste-gemini-key-here
echo.
if not exist keys.env (
  echo DATABASE_URL=file:./dev.db> keys.env
  echo ADMIN_EMAILS=niravb68@gmail.com>> keys.env
  echo SINGLE_TENANT=true>> keys.env
  echo GROQ_API_KEY=>> keys.env
  echo GOOGLE_API_KEY=>> keys.env
  echo GEMINI_API_KEY=>> keys.env
)
notepad keys.env
echo.
echo Saved. Now run: npm run dev
echo Then open: http://localhost:3000/setup
pause
