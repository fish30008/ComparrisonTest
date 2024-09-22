let IP = "http://127.0.0.1:5000"

let prefsCont = document.querySelector(".preferencesContainer");
let preferences = document.getElementById('preferences');
preferences.replaceChildren();
let inputTwoFactor = document.querySelector('#inputTwoFactor');
let factorButton = document.querySelector('.factorButton');
let preferenceWord;
let product = "";
let choices = new Set();
let preferenceButton = document.querySelector('.preferenceButton');
let imgBtn = document.querySelector("#imgSrch");
let imgCnt = document.querySelector(".file-uploader");
let displayed = false;
const loading = document.querySelector("#loading-wrapper");
loading.style.display = "none";
imgCnt.style.display = "none";
preferenceButton.style.visibility = 'hidden';
preferenceButton.addEventListener("click", _ => {
    document.querySelector(".cardsContainer").replaceChildren();
    let strArr = JSON.stringify(Array.from(choices));
    getArticles(product + ": " + strArr);
})

imgBtn.addEventListener("click", _ => {
    displayed = !displayed;
    if(displayed) {
        imgCnt.style.display = "";
    } else {
        imgCnt.style.display = "none";
    }
})

factorButton.addEventListener('click', () => {
    preferenceWord = inputTwoFactor.value;
    if(preferenceWord.length < 1) return;
    factorButton.style.display = "none";
    imgCnt.style.display = "none";
    imgBtn.style.display = "none";
    console.log(preferenceWord);
    sendRequest(preferenceWord);
})

function updateWords(array) {
    prefsCont.style.visibility = 'visible';
    choices = new Set();
    preferences.replaceChildren();
    array = JSON.parse(array);
    array.forEach(value => {
        let div = document.createElement('div');
        div.classList.add('preference');
        div.textContent = value;
        div.addEventListener('click', () => {
            console.log(choices.size);
            div.classList.toggle('active');
            if (choices.has(value)) {
                choices.delete(value);
            } else {
                choices.add(value);
            }
            if (choices.size === 0) {
                preferenceButton.style.visibility = 'hidden';
            } else {
                preferenceButton.style.visibility = 'visible';
            }
            console.log([...choices]);
        })
        preferences.appendChild(div);
    });
}

async function sendRequest(input) {
    loading.style.display = "";
    product = input;
    const response = await fetch(IP+'/prefs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: input })
    });

    const data = await response.json();

    if (response.ok) {
        updateWords(data.result);
    }
    loading.style.display = "none";
}

async function getArticles(input) {
    loading.style.display = "";
    const response = await fetch(IP+'/recs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: input })
    });
    const data = await response.json();
    if (response.ok) {
        console.log(data)
    } else {
        console.log(`Error: ${data.error}`)
    }

    for (const [key, value] of Object.entries(data['result'])) {
        for(link of value) {
            addCard(key, link);
        }
    }
    loading.style.display = "none";
}

function addCard(title, url) {
    let ele = document.createElement("a");
    ele.classList.add("card");
    ele.textContent = title;
    ele.href = url;
    document.querySelector(".cardsContainer").append(ele);
}