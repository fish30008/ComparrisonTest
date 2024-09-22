let IP = "http://127.0.0.1:5000"
const modal = document.getElementById("interestsModal");
const btn = document.getElementById("openModalBtn");
const span = document.getElementsByClassName("close")[0];
const procBtn = document.querySelector("#processButton");
const loading = document.querySelector("#loading-wrapper");
loading.style.display = "none";

let selectedInterests = [];

btn.addEventListener("click", e => {
    console.log("hi")
    modal.style.display = "block";
    e.stopPropagation();
})

span.addEventListener("click", _ => {
    modal.style.display = "none";
})

window.addEventListener("click", _ => {
    modal.style.display = "none";
})

document.querySelector(".modal-content").addEventListener("click", e => {
    e.stopPropagation();
})

procBtn.addEventListener("click", _ => {
    modal.style.display = "none";
    getArticles(selectedInterests);
})

async function getArticles(input) {
    loading.style.display = "";
    input = JSON.stringify(input);
    const response = await fetch(IP+'/artc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: input })
    });
    const data = await response.json();
    if (response.ok) {
        console.log(data.result);
        for(let obj of data.result) {
            addPost(obj.title, "Click here to move to the site.", obj.url, `https://picsum.photos/seed/${getRandomInt(100000)}/200/300`);
        }
    }
    loading.style.display = "none";
}


const interestItems = document.querySelectorAll('.interest-item');

interestItems.forEach(item => {
    item.onclick = function () {
        item.classList.toggle('selected');
        const interest = item.textContent;
        if (item.classList.contains('selected')) {
            selectedInterests.push(interest);
        } else {
            selectedInterests = selectedInterests.filter(i => i !== interest);
        }
        console.log(selectedInterests);
    }
});

function addPost(title, text, url, imgUrl) {
    let postCard = document.createElement("a");
    postCard.href = url;
    postCard.classList.add("post-card");
    let postImage = document.createElement("div");
    postImage.classList.add("post-image");
    let img = document.createElement("img")
    img.src = imgUrl;
    img.alt = "Post image";
    let postContent = document.createElement("div");
    postContent.classList.add("post-content");
    let postTitle = document.createElement("h3");
    postTitle.classList.add("post-title");
    postTitle.textContent = title;
    let postDescription = document.createElement("p");
    postDescription.classList.add("post-description");
    postDescription.textContent = text;
    postImage.append(img);
    postContent.append(postTitle);
    postContent.append(postDescription);
    postCard.append(postImage);
    postCard.append(postContent);
    document.querySelector(".post-container").append(postCard);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}