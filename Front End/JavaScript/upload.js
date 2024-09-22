document.addEventListener('DOMContentLoaded', () => {
    const fileUploadBox = document.querySelector('.file-upload-box');
    const fileBrowseInput = document.querySelector('.file-browse-input');
    const fileBrowseButton = document.querySelector('.file-browse-button');
    const fileList = document.querySelector('.file-list');
  
    fileUploadBox.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileUploadBox.classList.add('active');
    });
  
    fileUploadBox.addEventListener('dragleave', () => {
      fileUploadBox.classList.remove('active');
    });
  
    fileUploadBox.addEventListener('drop', (e) => {
      e.preventDefault();
      fileUploadBox.classList.remove('active');
      handleFiles(e.dataTransfer.files);
    });
  
    fileBrowseButton.addEventListener('click', () => {
      fileBrowseInput.click();
    });
  
    fileBrowseInput.addEventListener('change', () => {
      handleFiles(fileBrowseInput.files);
    });
  
    const handleFiles = (files) => {
      for (const file of files) {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          const base64String = fileReader.result.split(',')[1];
          console.log('Base64 Image String:', base64String);  // Print the base64 string to console
          sendToServer(base64String);
          addFileToList(file);
        };
        fileReader.readAsDataURL(file);
      }
    };
  
    const addFileToList = (file) => {
      const li = document.createElement('li');
      li.classList.add('file-item');
      li.innerHTML = `
        <div class="file-extension">${file.name.split('.').pop()}</div>
        <div class="file-content-wrapper">
          <div class="file-content">
            <div class="file-name">${file.name}</div>
            <button class="cancel-button">&times;</button>
          </div>
          <div class="file-info">
            <small>${(file.size / 1024).toFixed(2)} KB</small>
          </div>
        </div>
      `;
      fileList.appendChild(li);
    };
  
    const sendToServer = (base64String) => {
      let imgCnt = document.querySelector(".file-uploader");
      imgCnt.style.display = "none";
      fetch('http://192.168.43.133:5000/imgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: base64String })
      })
      .then(response => response.json())
      .then(data => {
        let ele = document.querySelector("#inputTwoFactor");
        ele.value = data["result"]["tags"][0]["tag"]["en"];
        let factorButton = document.querySelector('.factorButton');
        factorButton.click();
        ele.focus()
      })
      .catch(error => {
        console.error('Error:', error);
      });
    };
  });