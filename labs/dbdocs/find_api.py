import urllib.request
import re

url = 'https://dbdocs.io/Holistics/Ecommerce'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    print('Found URLs in HTML:')
    for match in re.finditer(r'https?://[^\s\"\'<>]+', html):
        print(match.group(0))
    for match in re.finditer(r'/api/[^\s\"\'<>]+', html):
        print(match.group(0))
except Exception as e:
    print('HTTP error:', e)
