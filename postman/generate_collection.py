"""Regenerate the portable Postman collection using only the Python standard library."""

import json
from pathlib import Path

lead = {
    "full_name": "Asha Sharma",
    "mobile": "{{mobile}}",
    "email": "asha@example.com",
    "date_of_birth": "1995-05-12",
    "city": "Bengaluru",
    "pincode": "560001",
    "loan_type": "Home Loan",
    "employment_type": "Salaried",
    "monthly_income": 75000,
    "loan_amount": 4000000,
    "property_value": 6000000,
    "consent": True,
}
rule = {
    "rule_name": "Demo income threshold",
    "field": "monthly_income",
    "operator": ">=",
    "value": 40000,
    "reference_field": None,
    "rejection_message": "Income below configured threshold",
    "is_active": True,
}


def request(name, method, path, body=None, public=False, capture=None):
    item = {
        "name": name,
        "request": {"method": method, "header": [], "url": "{{base_url}}" + path},
    }
    if public:
        item["request"]["auth"] = {"type": "noauth"}
    if body is not None:
        item["request"]["header"] = [
            {"key": "Content-Type", "value": "application/json"}
        ]
        item["request"]["body"] = {
            "mode": "raw",
            "raw": json.dumps(body, indent=2),
            "options": {"raw": {"language": "json"}},
        }
    if capture:
        key, field = capture
        item["event"] = [
            {
                "listen": "test",
                "script": {
                    "type": "text/javascript",
                    "exec": [
                        f'if (pm.response.code < 300) pm.collectionVariables.set("{key}", pm.response.json().{field});'
                    ],
                },
            }
        ]
    return item


login = request(
    "Admin login (captures token)",
    "POST",
    "/api/auth/login",
    public=True,
    capture=("token", "access_token"),
)
login["request"]["body"] = {
    "mode": "urlencoded",
    "urlencoded": [
        {"key": "username", "value": "{{admin_email}}"},
        {"key": "password", "value": "{{admin_password}}"},
    ],
}
collection = {
    "info": {
        "name": "MoneyBeing Loan Assessment",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        "description": "Run login first for admin operations. Use a fresh mobile for each new lead. Scores are MOCK.",
    },
    "auth": {
        "type": "bearer",
        "bearer": [{"key": "token", "value": "{{token}}", "type": "string"}],
    },
    "variable": [
        {"key": key, "value": value}
        for key, value in {
            "base_url": "http://localhost:8000",
            "admin_email": "admin@moneybeing.local",
            "admin_password": "MoneyBeing@123",
            "token": "",
            "mobile": "9876543210",
            "lead_id": "",
            "rule_id": "",
        }.items()
    ],
    "item": [
        login,
        request("Current user", "GET", "/api/auth/me"),
        request(
            "Create lead (captures lead_id)",
            "POST",
            "/api/leads",
            lead,
            True,
            ("lead_id", "lead_id"),
        ),
        request("Duplicate lead → 409", "POST", "/api/leads", lead, True),
        request("List leads", "GET", "/api/leads?page=1&page_size=10"),
        request(
            "Search and filter leads",
            "GET",
            "/api/leads?search=Asha&loan_type=Home%20Loan&bre_status=Eligible&page=1&page_size=10",
        ),
        request("Lead detail", "GET", "/api/leads/{{lead_id}}"),
        request("Export Excel", "GET", "/api/leads/export"),
        request("Dashboard summary", "GET", "/api/dashboard/summary"),
        request("List rules", "GET", "/api/rules"),
        request(
            "Create rule (captures rule_id)",
            "POST",
            "/api/rules",
            rule,
            capture=("rule_id", "id"),
        ),
        request("Get rule", "GET", "/api/rules/{{rule_id}}"),
        request(
            "Update rule", "PUT", "/api/rules/{{rule_id}}", {**rule, "value": 45000}
        ),
        request("Delete demo rule", "DELETE", "/api/rules/{{rule_id}}"),
        request("Health", "GET", "/health", public=True),
    ],
}
Path(__file__).with_name("MoneyBeing.postman_collection.json").write_text(
    json.dumps(collection, indent=2), encoding="utf-8"
)
