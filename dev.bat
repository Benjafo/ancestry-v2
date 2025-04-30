@echo off

echo ==========================
echo === Running containers ===
echo ==========================
docker-compose up -d

echo =====================
echo === Watching logs ===
echo =====================
docker-compose logs -f client server