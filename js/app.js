// ------------------------------------------
//  SETUP
// ------------------------------------------
const $card = $('.card'); 
const $stored = $('.stored'); 
const $storeBtn = $('#store-button');
let currentEmailIndex;
let emailList = [];
let dark = false;

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
  updateEmailIndex();
  $(`#img_${i}`).fadeOut(200);
  storing = true;

  //if the selected email is new, create a div for it 
  if (emailList[currentEmailIndex].Urls.length === 0) {
    createStoreDiv(currentEmailIndex, dark);
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
    for (let j=0; j < emailList.length; j++) {
      if (emailList[j].value == userInput) {
        emailDuplicate = true;
      }
    }
    if (!emailDuplicate) {
      let newEmailObject = new Email(userInput, []);

      if ($storeBtn.hasClass('greyed')) {
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
    <option id="option-${emailList.length}">${userInput}</option>
  `)
  if($storeBtn.hasClass('greyed')) {
    $storeBtn.removeClass('greyed');
  }
}

//function to create a new div for each new email
function createStoreDiv(emailIndex, theme) {
  let themeClass;
  if (!theme) {
    themeClass = 'light';
  } else {
    themeClass = 'dark';
  }
  //create html 
  $('#stored-grid-inner').prepend(`
    <div class="stored theme theme-${themeClass}" id="stored-outer-${emailIndex}">
      <p><span class="icon"></span>${emailList[emailIndex].value}</p>
      <button type="button" class="edit" id="edit-${emailIndex}">...</button>
      <div class="owl-carousel" id="stored-${emailIndex}"></div>
      <div class="edit-menu theme">
        <button type="button" class="delete-post" id="delete-${emailIndex}">Delete post</button>
      </div>
    </div>
  `);
  //initialise owl-carousel
  $(`#stored-${emailIndex}`).owlCarousel({
    items: displayItems,
  }).css('width', width);

  resizeHeader();
}


//resize header function

let prevStored = 0;
function resizeHeader() {
  let widthClass;
  if ($('#h2').hasClass('width')) {
    widthClass = 'width';
  } else if ($('#h2').hasClass('width-1')) {
    widthClass = 'width-1';
  } else if ($('#h2').hasClass('width-2')) {
    widthClass = 'width-2';
  }
  let time = 0;
  if (prevStored >= $('#stored-grid-inner').children().length) {
    time = 200;
  }
  setTimeout(function() {
    if ($('#stored-grid-inner').children().length <= 1) {
      $('#h2, #stored-grid-inner').removeClass(`${widthClass}`).addClass('width-1');
    } else if ($('#stored-grid-inner').children().length == 2) {
      $('#h2, #stored-grid-inner').removeClass(`${widthClass}`).addClass('width-2');
    } else if ($('#stored-grid-inner').children().length >= 3) {
      $('#h2, #stored-grid-inner').removeClass(`${widthClass}`).addClass('width');
    }
  }, time)
  setTimeout(function() {
    prevStored = $('#stored-grid-inner').children().length;
  }, 210)
}



function addTransition(target, time) {
  $(target).css('transition', `${time}s ease`);
  setTimeout (function() {
    $(target).css('transition', ``);
  }, (time* 1000));
}

function switchClass(target, classOne, classTwo) {
  $(target).removeClass(classOne).addClass(classTwo);
  addTransition(target, .5);
}

//function to delete a post assigned to an email
function deletePost(target, time) {

  //remove the div containing the stored item
  let number = target.substring(7);
  let $parent = $(`#stored-outer-${number}`);
  $parent.fadeOut(time);
  setTimeout(function() {
    $parent.remove();
  }, time)

  //replace the Email in the email list array with ''
  //Cannot simply remove as other things rely on its length
  emailList[Number(number)].value = ''; 
  emailList[Number(number)].Urls = [];

  //remove dropdown option 
  $(`#option-${number}`).remove();

  if ($dropdown.children().length == 0) {
    $dropdown.append(`
      <option value="" disabled selected hidden>Choose an email...</option>
    `);
    $storeBtn.addClass('greyed');
  }

  resizeHeader();
}

function updateEmailIndex() {
  for (let j=0; j<emailList.length; j++) {
    if (emailList[j].value === $dropdown.val()) {
      currentEmailIndex = j;
    }
  }
}


// ------------------------------------------
//  EVENT LISTENERS
// ------------------------------------------

$storeBtn.click(function() {
  if (!loading && !storing && !$storeBtn.hasClass('greyed')) {
    storeImage();
  } 
  if (emailList[currentEmailIndex].Urls.length === 1) {
    $(`#delete-${currentEmailIndex}`).click(function(e) {
      deletePost(e.target.id, 200);
    })
    $(`#edit-${currentEmailIndex}`).click(function(e) {
      let number = e.target.id.substring(5);
      if ($(`#delete-${number}`).parent().css('display') == 'none') {
        $(`#delete-${number}`).parent().slideDown(100);
        editMenu = true;
      } else {
        $(`#delete-${number}`).parent().slideUp(100);
        editMenu = false;
      }
      
    })
  }
  
})

$emailBtn.click(function() {
  createEmail($email.val());
})

$email.on('change', function (event) {
  $('.email-invalid').css('display', 'none');
});

$('.switch').change(function() {
  setTimeout(function() {
    dark = $('#checkbox').is(':checked');
    if (dark) {
      switchClass('body', 'background-light', 'background-dark');
      switchClass('.theme, h1, .icon', 'theme-light', 'theme-dark');
    } else {
      switchClass(`body`, `background-dark`, `background-light`);
      switchClass('.theme, h1, .icon', 'theme-dark', 'theme-light');
    }
  }, 10);
});

let ham = false;

$('#hamburger button').click(function() {
  if ($(window).width() <= 737) {
    if (ham == false) {

      $('.img-select').slideUp(300);
      switchClass('#hamburger .icon', 'minus', 'plus');
      setTimeout(function() {
        $('#hamburger button p').show('slide', {direction: 'right'}, 100);
      }, 200)
      ham = true;
    } else {
      $('.img-select').slideDown(300);
      switchClass('#hamburger .icon', 'plus', 'minus');
      $('#hamburger button p').hide(0);
      ham = false;
    }
  }
});

$(window).resize(function(){
  if ($(window).width() >= 737 && ham == true) {
    $('.img-select').css('display', '');
    switchClass('#hamburger .icon', 'plus', 'minus');
    ham = false;
  } else if ($(window).width() >= 737) {
    $('#hamburger button p').css('display', '')
  }
})



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




