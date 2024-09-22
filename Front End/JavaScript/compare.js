let IP = "http://127.0.0.1:5000"
let input1 = document.querySelector("#firstLink");
let input2 = document.querySelector("#secondLink");
let btn = document.querySelector(".compareButton");
let firstLink = document.querySelector('#firstLink');
let secondLink = document.querySelector('#secondLink');
let compareP = document.querySelector('#compareP');
let output = document.querySelector('#output');
let loading = document.querySelector('#loading-wrapper');
loading.style.display = "none"

try {
    firstLink.addEventListener('focus', () => {
        firstLink.placeholder = "";
    })
    firstLink.addEventListener('blur', () => {
        firstLink.placeholder = "First Link";
    })
    secondLink.addEventListener('focus', () => {
        secondLink.placeholder = "";
    })
    secondLink.addEventListener('blur', () => {
        secondLink.placeholder = "Second Link";
    })
} catch (error) {
    console.log(error);
}

btn.addEventListener("click", _ => {
    let msg = [input1.value, input2.value];
    send(JSON.stringify(msg));
})


async function send(input) {
    loading.style.display = ""
    const response = await fetch(IP + '/vs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: input })
    });
    const data = await response.json();
    if (response.ok) {
        output.innerHTML = data.result.replace(/\n/g, '<br>').replace(/\*/g, '');
        output.style.display = 'grid';
        firstLink.style.display = 'none';
        secondLink.style.display = 'none';
        btn.style.display = 'none';
        compareP.style.display = 'none';

    } else {
        console.log(`Error: ${data.error}`)
    }
    loading.style.display = "none"
}