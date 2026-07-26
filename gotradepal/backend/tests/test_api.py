from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get('/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'

def test_ai_chat():
    r = client.post('/ai/chat', json={'agent':'financial_coach','message':'help me save'})
    assert r.status_code == 200
    assert r.json()['agent'] == 'financial_coach'
    assert r.json()['recommendations']
