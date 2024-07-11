document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData();
    const image = document.querySelector('input[type="file"]').files[0];
    formData.append('image', image);

    const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    displayImage(result.file);
    fetchImages();
});

async function fetchImages() {
    const response = await fetch('http://localhost:5000/images');
    const images = await response.json();
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    images.forEach(image => {
        const img = document.createElement('img');
        img.src = `http://localhost:5000/image/${image.filename}`;
        gallery.appendChild(img);
    });
}

function displayImage(file) {
    const gallery = document.getElementById('gallery');
    const img = document.createElement('img');
    img.src = `http://localhost:5000/image/${file.filename}`;
    gallery.appendChild(img);
}

// Fetch images on page load
window.onload = fetchImages;
