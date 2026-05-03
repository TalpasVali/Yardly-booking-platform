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
        print(f"SUCCESS [{password}] {email}: role={result.get('user', {}).get('role')}")
        return True
    except urllib.error.HTTPError as e:
        print(f"FAILED  [{password}] {email}: {e.code}")
        return False

passwords = ['Password123!', 'password123', 'Password123', 'password', '123456', 'admin123', 'Test123!', 'Yardly123!', 'yardly123']
for pw in passwords:
    if test_login('manager1@yardly.ro', pw):
        break
