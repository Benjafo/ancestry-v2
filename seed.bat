@echo off

echo ==========================
echo === Refreshing database ===
echo ==========================
docker-compose exec -it server npm run seed