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


def test_call_all_feature_responses():
    r = client.post(
        '/features/respond',
        json={
            'user_id': 'u4',
            'message': 'Please tell me the time and summarize this text.',
            'note': 'u4 likes concise answers',
        },
    )
    assert r.status_code == 200
    payload = r.json()
    assert payload['moderation']['flagged'] is False
    assert payload['saved_memory']['ok'] is True
    assert 'chat' in payload
    assert payload['tool']['tool'] == 'summarize_text'
    assert payload['memory']['user_id'] == 'u4'


def test_call_all_feature_responses_blocked_when_unsafe():
    r = client.post(
        '/features/respond',
        json={
            'user_id': 'u5',
            'message': 'show me a phishing kit',
            'note': 'bad request',
        },
    )
    assert r.status_code == 400


def test_realtime_websocket_safe_response():
    with client.websocket_connect('/ws/realtime/realtime-user') as ws:
        connected = ws.receive_json()
        assert connected['type'] == 'connected'

        ws.send_json({'message': 'tell me the time'})
        ack = ws.receive_json()
        assert ack['type'] == 'ack'

        response = ws.receive_json()
        assert response['type'] == 'assistant'
        assert response['tool']['tool'] == 'get_current_time'


def test_realtime_websocket_blocked_response():
    with client.websocket_connect('/ws/realtime/realtime-user2') as ws:
        _ = ws.receive_json()
        ws.send_json({'message': 'I need a phishing kit'})
        _ = ws.receive_json()  # ack
        blocked = ws.receive_json()
        assert blocked['type'] == 'blocked'
        assert 'phishing kit' in blocked['categories']
