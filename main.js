// Note: -IMPORTANT-
// The API_KEY should be handled in the backend. Since this project is only for practicing REST requests without a backend, it is exposed here as an exception.
//If you want to test the code go to the cat api link, log in and they will send you your API_KEY to the email, you just have to replace the API_KEY in this js file
// The cat api: https://developers.thecatapi.com/view-account/ylX4blBYT9FaoVd6OhvR?report=FJkYOq9tW
const API_KEY = 'Copy your API_KEY';
const X_API_KEY = 'Copy your X_API_KEY';
const RANDOM_CATS_API = 'https://api.thecatapi.com/v1/images/search';
const FAVOURITE_CATS_API = `https://api.thecatapi.com/v1/favourites`;
const DELETE_FAVOURITE_CAT_API = (id) => `https://api.thecatapi.com/v1/favourites/${id}`;
const UPLOAD_PHOTO_API = `https://api.thecatapi.com/v1/images/upload`;



const api = axios.create({
    baseURL: 'https://api.thecatapi.com/v1'
});
api.defaults.headers.common['X-API-KEY'] = X_API_KEY;



const showCatButton = document.getElementById('showCat');
const randomCatsSection = document.getElementById('randomCatsSection');
const favoriteCatsSection = document.getElementById('favoriteCatsSection');
const errorNotice = document.getElementById('error');
const form = document.getElementById('uploadingForm');
const inputFile = document.getElementById('file');



async function loadRandomCats(){
    const response = await fetch(`${RANDOM_CATS_API}?limit=2&${API_KEY}`);
    const data = await response.json();
    console.log(data);
    if(response.status !== 200){
        errorNotice.innerHTML = `There was an error: ${response.status}, ${data.message}`;
    }

    const images = document.querySelectorAll('.random-cat-img');
    images.forEach((img, i) => {
        //This error that appears here in the console does not generate any problem in the code
        img.src = data[i].url;
        img.id = data[i].id;
    });
}

async function loadFavoriteCats(){
    try {
        let response = await fetch(FAVOURITE_CATS_API, {
            method: 'GET',
            headers: {
                'X-API-KEY': X_API_KEY,
            }
        });
        let data = await response.json();
        console.log(data);
        
        if(response.status !== 200){
            console.log('errorNotice')
            errorNotice.innerHTML = `There was an error: ${response.status}, ${data.message}`;
        }

        favoriteCatsSection.innerHTML = '';
        const sectionTitleFavoriteCats = document.createElement('h2')
        sectionTitleFavoriteCats.textContent = 'Favorites cats';
        favoriteCatsSection.appendChild(sectionTitleFavoriteCats);

        data.forEach(cat => {
            const article = document.createElement('article');
            const img = document.createElement('img');
            const removeCatButton = document.createElement('button');

            img.style.width = '250px';
            img.src = cat.image.url;
            
            removeCatButton.classList.add('remove-cat-button');
            removeCatButton.textContent = 'Remove cat from favorites';
            
            article.setAttribute('id', cat.id);
            article.append(img, removeCatButton);
            favoriteCatsSection.appendChild(article);
        });

    } catch (error) {
        console.warn(error);
    }
}

async function saveFavoriteCat(id) {
    const { data, status } = await api.post('/favourites', {
        image_id: id
    });

    // Practice with fetch
    // const response = await fetch(FAVOURITE_CATS_API, {
    //     method: 'POST',
    //     headers: {
    //         'Content-type': 'application/json',
    //         'X-API-KEY': X_API_KEY,
    //     },
    //     body: JSON.stringify({
    //         image_id: id
    //     }),
    // });
    // const data = await response.json();

    if(status !== 200){
        errorNotice.innerHTML = `There was an error: ${status}`;
    }
    console.info('The cat image has been succesfully loaded');
}

async function deleteFavoriteCat(id) {
    const response = await fetch(DELETE_FAVOURITE_CAT_API(id), {
        method: 'DELETE',
        headers: {
            'X-API-KEY': X_API_KEY,
        }
    });
    const data = await response.json();
    console.log(response, data);

    if(!response.status){
        errorNotice.innerHTML = `There was an error: ${response.status}, ${data.message}`;
    }
    console.info('The cat image has been succesfully removed');
}

async function uploadPhotoOfCat(){
    const formData = new FormData(form);
    console.log(formData.get('file'));

    const response = await fetch(UPLOAD_PHOTO_API, {
        method: 'POST',
        headers: {
            // 'Content-Type': 'multipart/form-data',
            'X-API-KEY': X_API_KEY
        },
        body: formData,
    });
    const data = await response.json();

    if(!response.status){
        errorNotice.innerText = `There was an error: ${response.status}`;
    }
    
    console.info('The photo was uploaded successfully');
    saveFavoriteCat(data.id);
}

document.addEventListener('DOMContentLoaded', () => {
    loadFavoriteCats();

    showCatButton.addEventListener('click', loadRandomCats);

    randomCatsSection.addEventListener('click', async (event) => {
        if(event.target.classList.contains('save-cat-button')){
            const buttonClicked = event.target;
            const img = buttonClicked.previousElementSibling;

            await saveFavoriteCat(img.id);
            loadFavoriteCats();
        }
    });

    favoriteCatsSection.addEventListener('click', async (event) => {
        if(event.target.classList.contains('remove-cat-button')){
            const buttonClicked = event.target;
            const article = buttonClicked.parentElement;

            await deleteFavoriteCat(article.id);
            article.remove();
        }
    });

    form.addEventListener('click', async (event) => {
        if(event.target.classList.contains('button-to-upload-photo')){
            await uploadPhotoOfCat();
            loadFavoriteCats();
        }
    });

    // Thumbnail photo
    inputFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
    
        if(file){
            const url = URL.createObjectURL(file);
    
            const thumbnail = document.querySelector('.thumbnail-photo');
    
            thumbnail.src = url;
        }
    });
});