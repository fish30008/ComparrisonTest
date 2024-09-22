let IP = "http://127.0.0.1:5000"
let input = document.querySelector("#inputlink");
let btn = document.querySelector(".linkButton");
let pros = document.querySelector('.pros');
let cons = document.querySelector('.cons');
let conclusionOutput = document.querySelector('.conclusionOutput');
let titleOutput = document.querySelector('.titleOutput');
let description = document.querySelector('.description');
let outputContainer = document.querySelector('.outputContainer');
let prosP = document.querySelector('#prosP');
let consP = document.querySelector('#consP');
let ConclusionP = document.querySelector('#ConclusionP');
let loading = document.querySelector('#loading-wrapper');
loading.style.display = "none"

btn.addEventListener("click", _ => {
    console.log("sup");
    getComp(input.value);
})

async function getComp(url) {
    loading.style.display = ""
    const response = await fetch(IP + '/comp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: url })
    });
    const data = await response.json();
    if (response.ok) {
        pros.replaceChildren();
        cons.replaceChildren();
        conclusionOutput.replaceChildren();
        pros.append(prosP);
        cons.append(consP);
        conclusionOutput.append(ConclusionP);
        console.log(data)
        obj = JSON.parse(data["result"]);
        titleOutput.textContent = obj.title;
        conclusionOutput.textContent += obj.conclusion;
        description.textContent = obj.description;
        obj['cons'].forEach(element => {
            let li = document.createElement('li');
            li.textContent = element
            cons.append(li);
        });
        obj['pros'].forEach(element => {
            let li = document.createElement('li');
            li.textContent = element
            pros.append(li);
        });
        outputContainer.style.display = 'grid';
    } else {
        console.log(`Error: ${data.error}`)
    }
    loading.style.display = "none"
}