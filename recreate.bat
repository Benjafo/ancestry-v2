@echo off

echo ====================================
echo === Removing existing containers ===
echo ====================================
docker-compose down

echo ==========================
echo === Building containers ===
echo ==========================
docker-compose build

echo ==========================
echo === Running containers ===
echo ==========================
docker-compose up -d

echo =====================
echo === Watching logs ===
echo =====================
docker-compose logs -f client server