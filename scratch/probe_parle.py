import urllib.request
import ssl

ctx = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

urls = [
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Parle-G.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/parle-g.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Parle-G-Gold.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Gold.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Monaco.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Krackjack.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Hide-Seek.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Hide-and-seek.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Bourbon.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Fab.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Marie.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/20-20.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Melody.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Kismi.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Fulltoss.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Frooti.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Happy-Happy.png',
    'https://www.parleproducts.com/wp-content/uploads/2021/04/Nice.png'
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=3) as res:
            cl = res.headers.get('Content-Length', 'unknown')
            print(f'FOUND: {u} (size {cl})')
    except Exception as e:
        pass
