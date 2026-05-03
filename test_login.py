import urllib.request, json

def test_login(email, password):
    data = json.dumps({'email': email, 'password': password}).encode()
    req = urllib.request.Request(
        'http://localhost:3000/auth/login',
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read().decode())
        print(f"SUCCESS {email}: role={result.get('user', {}).get('role')}, token={result.get('access_token', '')[:20]}...")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"FAILED {email}: {e.code} - {body}")

test_login('manager1@yardly.ro', 'Password123!')
test_login('admin@yardly.ro', 'Password123!')
test_login('user1@yardly.ro', 'Password123!')
