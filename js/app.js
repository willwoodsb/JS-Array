// ------------------------------------------
//  SETUP
// ------------------------------------------
const $card = $('.card'); 
const $stored = $('.stored'); 
const $storeBtn = $('#store-button');
let currentEmailIndex;
let emailList = [];

//Image variables
const width = 300, height = 300;
let imgUrl = []; //all urls used
let imgCodes = [];
let i = 0;
let displayItems = 1;
let loading = false;
let storing = false;

//email variables
const $email = $('input[type = email]');
const $emailBtn = $('input[type = submit]');
const $dropdown = $('#dropdown');

$(document).ready(function() {
  //when document is ready load first pic
  fetchPic(width, height, i);
});


// ------------------------------------------
//  FETCH FUNCTIONS
// ------------------------------------------

//function to get image from API and display
function fetchPic(w, h, i) {
  const fetchUrl = `https://source.unsplash.com/random/${w}x${h}`; //unsplash url

  //while loading display loading icon
  $card.append(`
    <div class="img-card" id="img_${i}">
      <div class="lds-dual-ring"></div>
    </div>
  `);
  $(`#img_${i}`).css('height', height).css('width', width); //make div correct size 

  loadPic(fetchUrl);
}

//load pic from unsplash
function loadPic(fetchUrl) {
  let duplicate = false;
  loading = true;
  fetch(fetchUrl)
  .then(checkStatus)
  .then(data => {
    imgUrl.push(data.url);

    //have to get a specific part of the url to test if it is a duplicate
    let currentCode = imgUrl[i].substring(imgUrl[i].indexOf('photo-') + 6, imgUrl[i].indexOf('photo-')+ 18);
    imgCodes.push(currentCode);
    for (let j=0; j<i; j++) {
      if (imgCodes[i] == imgCodes[j]) {
        duplicate = true;
      }
    }

    //generate img html unless img is a duplicate 
    if (!duplicate) {
      generateImage(imgUrl[i]);
      $(`#img_${i} .lds-dual-ring`).remove();
      loading = false;

    //if img is a duplicate, run function again to return a different img
    } else {
      imgCodes.splice(imgCodes.length - 1, 1);
      imgUrl.splice(imgUrl.length - 1, 1);
      loadPic(fetchUrl);
      loading = false;

    }
  })
  .catch(error => {
    generateErrorText(error, i);
    loading = false;
  });
}


// ------------------------------------------
//  HELPER FUNCTIONS
// ------------------------------------------

//check the status of the fetched element
function checkStatus(response) {
  if(response.ok) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}

//generate html for the image
function generateImage(data) {
  $(`#img_${i}`).append(`
    <img src="${data}" alt>
  `);
}

//function to generate error text when error getting image
function generateErrorText(error, i) {
  console.log('error: ', error);
  $(`#img_${i} .lds-dual-ring`).remove();
  $(`#img_${i}`).append(`
    <div class="error"><p>Sorry, something went wrong :(</p></div>
  `);
}

//store an image
function storeImage() {
  $(`#img_${i}`).fadeOut(200);
  storing = true;

  //if the selected email is new, create a div for it 
  if (emailList[currentEmailIndex].Urls.length === 0) {
    createStoreDiv(currentEmailIndex);
  }
  //add the url to the email opbject
  emailList[currentEmailIndex].Urls.push(imgUrl[i]);

  //run this code after the animations have finished
  setTimeout(function() {
    //make new oel-carousel element and add the image to it
    $(`#stored-${currentEmailIndex}`).trigger('add.owl.carousel', [$(`#img_${i}`), 0]).trigger('refresh.owl.carousel');
    $(`#img_${i}`).fadeIn(350);

    //increase global img counter by 1 and fetch a new pic from 
    //unsplash to display at the top
    i++;
    fetchPic(width, height, i);
    setTimeout(function() {
      storing = false;
      $('.owl-dots').removeClass('disabled');
    }, 350);
  }, 200);
}

//validate the email submission (against regex and previous submission)
function createEmail(userInput) {
  let emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  if (!emailRegex.test(userInput)) {
    $(`#reject`).css('display', 'block');
  } else {
    //check if submission is a duplicate
    let emailDuplicate = false;
    for (let j=0; j < emailList.length + 1; j++) {
      if (userInput == emailList[j]) {
        emailDuplicate = true;
      }
    }
    if (!emailDuplicate) {
      let newEmailObject = new Email(userInput, []);

      if (emailList.length == 0) {
        $('select option').remove();
        currentEmailIndex = 0;
      }
      //add the new email to the dropdown then add the new email object to email object array
      addEmail(userInput);
      emailList.push(newEmailObject);
    } else {
      $(`#preExisting`).css('display', 'block');
    }
    $email.val('');
  };
}

//function to add an email to the dropdown menu
function addEmail(userInput) {
  $dropdown.prepend(`
    <option>${userInput}</option>
  `)
  if($storeBtn.hasClass('greyed')) {
    $storeBtn.removeClass('greyed');
  }
}

//function to create a new div for each new email
function createStoreDiv(emailIndex) {
  //create html 
  $('#stored-grid-inner').prepend(`
    <div class="stored theme">
      <p><span class="icon"></span>${emailList[emailIndex].value}</p>
      <button type="button" class="edit">...</button>
      <div class="owl-carousel" id="stored-${emailIndex}"></div>
    </div>
  `);
  //initialise owl-carousel
  $(`#stored-${emailIndex}`).owlCarousel({
    items: displayItems,
  }).css('width', width);
}


// ------------------------------------------
//  EVENT LISTENERS
// ------------------------------------------

$dropdown.on('change', function() {
  //when the dropdown selection is changed, change the 
  //currentEmailIndex to the correct value
  for (let j=0; j<emailList.length; j++) {
    if (emailList[j].value === $dropdown.val()) {
      currentEmailIndex = j;
    }
  }
})

$storeBtn.click(function() {
  if (!loading && !storing && !$storeBtn.hasClass('greyed')) {
    storeImage();
  } else if ($storeBtn.hasClass('greyed')) {
    $('#no-email').css('display', 'block');
  }
})

$emailBtn.click(function() {
  createEmail($email.val());
})

$email.on('change', function (event) {
  $('.email-invalid').css('display', 'none');
});

// ------------------------------------------
//  CLASSES
// ------------------------------------------

//class that contains the urls for each new email object
class Email {
  constructor( value, Urls, codes ) {
    this.value = value;
    this.Urls = Urls;
  }
}




