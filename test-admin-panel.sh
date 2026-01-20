#!/bin/bash

# Admin Panel Quick Test Script
# This script tests the basic functionality of the admin panel

echo "=========================================="
echo "Admin Panel Quick Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local test_name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4
    local token=$5
    local expected_status=${6:-200}

    echo -n "Testing: $test_name... "

    if [ -n "$data" ]; then
        if [ -n "$token" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$url" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$url" \
                -H "Content-Type: application/json" \
                -d "$data")
        fi
    else
        if [ -n "$token" ]; then
            response=$(curl -s -w "\n%{http_code}" "$url" \
                -H "Authorization: Bearer $token")
        else
            response=$(curl -s -w "\n%{http_code}" "$url")
        fi
    fi

    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}PASS${NC} (Status: $status_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        echo "Response: $body"
        ((FAILED++))
        return 1
    fi
}

# Check if backend is running
echo "Checking if backend is running..."
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Backend is not running!${NC}"
    echo "Please start the backend server first:"
    echo "  cd backend && npm run start:dev"
    exit 1
fi
echo -e "${GREEN}Backend is running!${NC}"
echo ""

# Test 1: Health Check
echo "=========================================="
echo "Test Suite 1: Health Check"
echo "=========================================="
test_endpoint "Health endpoint" "http://localhost:3000/api/health"
echo ""

# Test 2: Admin Login
echo "=========================================="
echo "Test Suite 2: Authentication"
echo "=========================================="
echo "Logging in as admin..."
login_response=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $login_response | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}FAIL: Could not get admin token${NC}"
    echo "Response: $login_response"
    ((FAILED++))
else
    echo -e "${GREEN}PASS: Admin login successful${NC}"
    ((PASSED++))
    echo "Token: ${ADMIN_TOKEN:0:20}..."
fi
echo ""

# Test 3: Dashboard Stats
echo "=========================================="
echo "Test Suite 3: Dashboard Statistics"
echo "=========================================="
if [ -n "$ADMIN_TOKEN" ]; then
    test_endpoint "Get dashboard stats" "http://localhost:3000/api/admin/stats" "GET" "" "$ADMIN_TOKEN"
else
    echo -e "${YELLOW}SKIP: No admin token available${NC}"
fi
echo ""

# Test 4: User Management
echo "=========================================="
echo "Test Suite 4: User Management"
echo "=========================================="
if [ -n "$ADMIN_TOKEN" ]; then
    test_endpoint "List all users" "http://localhost:3000/api/admin/users" "GET" "" "$ADMIN_TOKEN"
    test_endpoint "Filter active users" "http://localhost:3000/api/admin/users?status=active" "GET" "" "$ADMIN_TOKEN"
    test_endpoint "Filter free users" "http://localhost:3000/api/admin/users?plan=free" "GET" "" "$ADMIN_TOKEN"
    test_endpoint "Search users" "http://localhost:3000/api/admin/users?search=test" "GET" "" "$ADMIN_TOKEN"
else
    echo -e "${YELLOW}SKIP: No admin token available${NC}"
fi
echo ""

# Test 5: Broadcast Notifications
echo "=========================================="
echo "Test Suite 5: Broadcast Notifications"
echo "=========================================="
if [ -n "$ADMIN_TOKEN" ]; then
    test_endpoint "Broadcast to all users" \
        "http://localhost:3000/api/admin/notifications/broadcast" \
        "POST" \
        '{"title":"Test Notification","body":"This is a test broadcast","targetAudience":"all"}' \
        "$ADMIN_TOKEN"

    test_endpoint "Broadcast validation (missing title)" \
        "http://localhost:3000/api/admin/notifications/broadcast" \
        "POST" \
        '{"body":"Test","targetAudience":"all"}' \
        "$ADMIN_TOKEN" \
        400
else
    echo -e "${YELLOW}SKIP: No admin token available${NC}"
fi
echo ""

# Test 6: Security Tests
echo "=========================================="
echo "Test Suite 6: Security"
echo "=========================================="
test_endpoint "Unauthenticated access blocked" \
    "http://localhost:3000/api/admin/stats" \
    "GET" \
    "" \
    "" \
    401

# Login as regular user
echo "Logging in as regular user..."
regular_login=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}')

REGULAR_TOKEN=$(echo $regular_login | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$REGULAR_TOKEN" ]; then
    test_endpoint "Regular user blocked from admin endpoints" \
        "http://localhost:3000/api/admin/stats" \
        "GET" \
        "" \
        "$REGULAR_TOKEN" \
        403
else
    echo -e "${YELLOW}SKIP: Could not get regular user token${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the admin panel: cd admin && npm run dev"
    echo "2. Open http://localhost:3001 in your browser"
    echo "3. Login with: admin@example.com / admin123"
    echo "4. Test the UI manually using ADMIN_PANEL_TESTING_GUIDE.md"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo "Please review the errors above and fix the issues."
    exit 1
fi
