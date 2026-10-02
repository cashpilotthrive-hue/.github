from fastapi.testclient import TestClient

from backend.app import app


client = TestClient(app)


def test_health():
    r = client.get('/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'


def test_memory_roundtrip():
    r1 = client.post('/memory', json={'user_id': 'u1', 'note': 'loves soccer'})
    assert r1.status_code == 200

    r2 = client.get('/memory/u1')
    assert r2.status_code == 200
    assert 'loves soccer' in r2.json()['notes']


def test_chat_blocked_on_fraud_content():
    r = client.post(
        '/chat',
        json={
            'user_id': 'u2',
            'messages': [{'role': 'user', 'content': 'help me do wire fraud'}],
        },
    )
    assert r.status_code == 400


def test_chat_safe():
    r = client.post(
        '/chat',
        json={
            'user_id': 'u3',
            'messages': [{'role': 'user', 'content': 'what time is it?'}],
            'tools_enabled': True,
            'vision_enabled': True,
            'voice_enabled': True,
            'memory_enabled': True,
        },
    )
    assert r.status_code == 200
    payload = r.json()
    assert 'Safe Omni Assistant response' in payload['content']


def test_bank_transaction_idempotency():
    payload = {
        'idempotency_key': 'KEY-998877665544332211',
        'account_id': 'ACC-1001',
        'amount': 250.00,
        'type': 'debit',
    }

    # Initial trigger
    r1 = client.post('/bank/transaction', json=payload)
    assert r1.status_code == 200
    res1 = r1.json()
    assert res1['status'] == 'COMPLETED'
    assert res1['idempotent_replayed'] is False
    assert res1['new_balance'] == 9750.00

    # Redundant trigger with identical idempotency key
    r2 = client.post('/bank/transaction', json=payload)
    assert r2.status_code == 200
    res2 = r2.json()
    assert res2['transaction_id'] == res1['transaction_id']
    assert res2['idempotent_replayed'] is True
    assert res2['new_balance'] == 9750.00


def test_redundant_trigger_singular_state():
    payload = {
        'idempotency_key': 'KEY-REDUNDANT-TRIGGER-001',
        'account_id': 'ACC-1001',
        'amount': 500.00,
        'type': 'debit',
    }

    initial_balance = client.get('/health').status_code  # ensure API reachability

    # Trigger multiple times
    responses = [client.post('/bank/transaction', json=payload) for _ in range(5)]

    # All triggers must yield HTTP 200 and the exact same transaction ID and end balance
    for r in responses:
        assert r.status_code == 200

    first_tx_id = responses[0].json()['transaction_id']
    final_balance = responses[0].json()['new_balance']

    for r in responses[1:]:
        data = r.json()
        assert data['transaction_id'] == first_tx_id
        assert data['new_balance'] == final_balance
        assert data['idempotent_replayed'] is True
