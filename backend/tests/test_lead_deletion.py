from app.core.security import create_access_token, hash_password
from app.models import User


def test_admin_deletion_updates_list_and_dashboard(client, admin, payload):
    lead_id = client.post("/api/leads", json=payload).json()["lead_id"]
    url = f"/api/leads/{lead_id}"

    assert client.delete(url).status_code == 401
    assert client.get(url, headers=admin).status_code == 200
    assert client.delete(url, headers=admin).status_code == 204
    assert client.get(url, headers=admin).status_code == 404
    assert client.delete(url, headers=admin).status_code == 404
    assert client.get("/api/leads", headers=admin).json()["total"] == 0
    summary = client.get("/api/dashboard/summary", headers=admin).json()
    assert summary["total_leads"] == 0
    assert summary["average_credit_score"] is None
    # Permanent deletion frees the mobile number for a new application.
    assert client.post("/api/leads", json=payload).status_code == 201


def test_non_admin_cannot_delete_application(client, db, admin, payload):
    user = User(
        email="viewer@example.com",
        password_hash=hash_password("TestingPassword123"),
        role="viewer",
    )
    db.add(user)
    db.commit()
    headers = {"Authorization": f"Bearer {create_access_token(user.id)}"}
    lead_id = client.post("/api/leads", json=payload).json()["lead_id"]
    url = f"/api/leads/{lead_id}"
    assert client.delete(url, headers=headers).status_code == 403
    assert client.get(url, headers=admin).status_code == 200
