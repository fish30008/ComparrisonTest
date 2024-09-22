import requests
 
url = 'http://www.google.com'
 
# create request
text = requests.get(url).text

print(text)