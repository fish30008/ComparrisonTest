from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from duckduckgo_search import DDGS
import ast
import requests
from urllib.parse import urlparse
from urllib.request import urlopen
from bs4 import BeautifulSoup

client = Groq(
    api_key="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",
)


app = Flask(__name__)
CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/prefs', methods=['POST'])
def prefs():
    data = request.json
    if 'input' in data:
        chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": 'The user will enter a name of a product, your job, is to find some relevant specifications for that product, to narrow down the specific requirements of the user, and the output should be in the form of a js array only without any extra text, in the form of ["spec1", "spec2"....], for example, the user inputs: "tv", your output should be something like: ["Full Hd", "4k", "cheap", "smart"], the number of elements should be at least 10, these are options that user can select, they can be contradictory, they should be someting that can be either true or false, for example "cheap", but not something that can be experessed as a scalar, for example processor speed.',
            },
            {
                "role": "user",
                "content": data['input'],
            }
        ],
        model="llama3-8b-8192",
        max_tokens=3000,
        )
        answer = chat_completion.choices[0].message.content
        response = jsonify({'result': answer})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    return jsonify({'error': 'No input provided'}), 400


# input: {'input': '["product", "pref1", "pref2", ...]'}
@app.route('/recs', methods=['POST'])
def recs():
    data = request.json
    if 'input' in data:
        print(data)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": 'You will get a name of a product e.g. "laptop" and a list of preferences for example ["cheap", "gaming", "stylish"], your job is to determine the best models of the product given that fits the description, need only 3 for now in the form of a list ["","","",...], DONT send any additional text, ONLY the array. no matter how wierd the question is, always answer, with a js array, never answer with anything else.',
                },
                {
                    "role": "user",
                    "content": data['input'],
                }
            ],
            model="llama3-8b-8192",
            max_tokens=3000,
        )
        answer = ast.literal_eval(chat_completion.choices[0].message.content)
        final = {}
        for item in answer:
            results = DDGS().text(
                keywords=item+" buy in moldova",
                safesearch='off',
                max_results=3,
            )
            for result in results:
                url = result["href"]
                dom = extract_domain(url)
                key = item + " - " + (dom.upper())
                final[key] = [url]

        response = jsonify({'result': final})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    return jsonify({'error': 'No input provided'}), 400

@app.route('/imgs', methods=['POST'])
def imgs():
    data = request.json
    if 'input' in data:
        api_key = 'acc_b2ce897cff3dc5f'
        api_secret = '6f4b85b06e254971f717c8872311225e'
        image_base64 = data["input"]

        payload = {
            'image_base64': image_base64
        }

        tags_url = 'https://api.imagga.com/v2/tags'
        response = requests.post(tags_url, auth=(api_key, api_secret), data=payload)
        if response.status_code == 200:
            return response.json()
        else:
            print('Error:', response.status_code, response.text)
    return jsonify({'error': 'No input provided'}), 400

@app.route('/comp', methods=['POST'])
def comp():
    data = request.json
    if 'input' in data:
        url = data['input']
        try:
            html_content = get_text(url)
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": 'You will get some data extracted from an html file from a url, this data will probably be about a product, what you will need to do, is exctract the important infromation, give a small description about this product, explain the pros and cons, and at the end say whether you recommend this product or not, it may be overpriced, or it could be a very good deal, now the return information has to be in the form of an object, the format is as the following, {"title":"product name here", "description":"a brief description about the product here", "pros": ["first pro", "second pro", ...], "cons": ["first con", "second con", ...], "conclusion":"the final conclusion here and whether you recommend this product or not"}, the out put should be in that format ALWAYS no matter what, never give any different format of answers. dont send any extra text, ONLY the object, ANOTHER WARNING, never put any text before the object, ONLY THE OBJECT ITSELF',
                    },
                    {
                        "role": "user",
                        "content": html_content,
                    }
                ],
                model="llama3-8b-8192",
                max_tokens=3000,
            )
            answer = chat_completion.choices[0].message.content
            return jsonify({"result": answer})
        except requests.exceptions.RequestException as e:
            return jsonify({'error': str(e)}), 400
    return jsonify({'error': 'No input provided'}), 400


@app.route('/artc', methods=['POST'])
def artc():
    data = request.json
    if 'input' in data:
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": 'You are given a list of interests, now your job is to generate 6 google searches to find relevant articles to these searches, you will be given a list of interests for example ["sports", "gym", "cars",...], you have to make a list of google searches that might lead to articles that talk about these interests, try to make the searches creative, also the output is only allowed to be in the form of a js array [], without any extra text, only the array as an output. the resulted prompts, should be something like "article about how to take care of computers" if the input has something about computers. at least 6 prompts give me boy',
                    },
                    {
                        "role": "user",
                        "content": data['input'],
                    }
                ],
                model="llama3-8b-8192",
                max_tokens=3000,
            )
            answer = chat_completion.choices[0].message.content
            array = ast.literal_eval(answer)
            print(array)
            objects = []
            for prompt in array:
                print("started")
                res = DDGS().text(
                    keywords=prompt+" article",
                    safesearch='off',
                    max_results=1,
                )
                link = res[0]["href"]
                objects.append({"title":prompt, "url": link})
            return jsonify({"result": objects})
        except requests.exceptions.RequestException as e:
            return jsonify({'error': str(e)}), 400
    return jsonify({'error': 'No input provided'}), 400


@app.route('/vs', methods=['POST'])
def vs():
    data = request.json
    if 'input' in data:
        sites = ast.literal_eval(data['input'])
        for i in range(len(sites)):
            sites[i] = get_text(sites[i])
        texts = "Site 1:\n" + sites[0] + "\n\n\nSite 2:\n" + sites[1]

        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": 'You are given 2 sites of 2 products, your job is to compare both products, in terms of price, quality, performance, value etc, depending on the product add more features to compare if needed, try to have at least 7 features to compare with, also use emojies if you can to make it look more appealing, also have a conclusion at the end.',
                    },
                    {
                        "role": "user",
                        "content": texts,
                    }
                ],
                model="llama3-8b-8192",
                max_tokens=3000,
            )
            answer = chat_completion.choices[0].message.content
            print(answer)
            return jsonify({"result": answer})
        except requests.exceptions.RequestException as e:
            return jsonify({'error': str(e)}), 400
    return jsonify({'error': 'No input provided'}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=False)

def extract_domain(url):
    parsed_url = urlparse(url)
    netloc = parsed_url.netloc
    parts = netloc.split('.')
    if len(parts) > 2:
        domain = parts[-2]
    else:
        domain = parts[0]

    return domain

def get_text(url):
    html = urlopen(url).read()
    soup = BeautifulSoup(html, features="html.parser")
    
    for script in soup(["script", "style"]):
        script.extract()

    text = soup.get_text()
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)

    return text