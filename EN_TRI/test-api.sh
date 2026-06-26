#!/bin/bash

# Script de test API MindLife V12
echo "========================================"
echo "  TEST API MINDLIFE V12"
echo "========================================"

BASE_URL="http://localhost:3000"

# Fonction de test
test_api() {
    local name="$1"
    local url="$2"
    local method="$3"
    local data="$4"
    
    echo ""
    echo "--- $name ---"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s --max-time 15 -X POST "$url" -H "Content-Type: application/json" -d "$data" 2>&1)
    else
        response=$(curl -s --max-time 15 "$url" 2>&1)
    fi
    
    echo "$response"
}

# Attendre que le serveur soit prêt
echo "Attente du serveur..."
for i in {1..10}; do
    if curl -s --max-time 2 "$BASE_URL/api/ai-agent" > /dev/null 2>&1; then
        echo "Serveur prêt!"
        break
    fi
    sleep 1
done

# Tests
test_api "1. GET Personas" "$BASE_URL/api/ai-agent" "GET"
test_api "2. POST Chat Assistant" "$BASE_URL/api/ai-agent" "POST" '{"message":"bonjour","persona":"assistant","userId":"test"}'
test_api "3. POST Chat Coach" "$BASE_URL/api/ai-agent" "POST" '{"message":"motivation","persona":"coach","userId":"test"}'
test_api "4. POST Chat Nutrition" "$BASE_URL/api/ai-agent" "POST" '{"message":"recette","persona":"nutrition","userId":"test"}'
test_api "5. POST Chat Wellness" "$BASE_URL/api/ai-agent" "POST" '{"message":"stress","persona":"wellness","userId":"test"}'
test_api "6. POST Chat Productivity" "$BASE_URL/api/ai-agent" "POST" '{"message":"procrastination","persona":"productivity","userId":"test"}'
test_api "7. GET Stats" "$BASE_URL/api/ai-agent?action=stats&userId=test" "GET"
test_api "8. Convex Status" "$BASE_URL/api/convex?action=status" "GET"
test_api "9. Convex User Context" "$BASE_URL/api/convex?action=user-context&userId=test" "GET"

echo ""
echo "========================================"
echo "  FIN DES TESTS"
echo "========================================"
