let login = document.querySelector('.user-navigation__link');
let modalOverlayLogin = document.querySelector('.modal-overlay--login');
let closeBtnLogin = modalOverlayLogin.querySelector('.modal__close');
let modal = document.querySelector('.modal');
let form = modal.querySelector('.form-login');
let modalLogin = modalOverlayLogin.querySelector('.modal--login')
let modalInputLogin = form.querySelector('.form-input--login');
let modalInputPass = form.querySelector('.form-input--pass');
let storage = localStorage.getItem('login');
let linkMap = document.querySelector('.btn-js-map');
let modalOverlayMap = document.querySelector('.modal-overlay--map');
let closeBtnMap = modalOverlayMap.querySelector('.modal__close');




login.addEventListener('click', function (evt) {
  evt.preventDefault();
  modalOverlayLogin.classList.remove('modal-overlay--js-close');
  modalOverlayLogin.classList.remove('modal-overlay--hidden');
  modalOverlayLogin.classList.add('modal-overlay--js-visible');
  if (storage){
    modalInputLogin.value = storage;
    modalInputPass.focus();
  } else {
    modalInputLogin.focus();
  }
})

form.addEventListener('submit', function (evt) {
  if(!modalInputLogin.value || !modalInputPass.value){
    evt.preventDefault();
    modalLogin.classList.add('modal-overlay--error');
    setTimeout(function() {modalLogin.classList.remove('modal-overlay--error')}, 600);
  } else {
    localStorage.setItem('login', modalInputLogin.value);
  }
});

closeBtnLogin.addEventListener('click', function (evt) {
  evt.preventDefault();
  modalOverlayLogin.classList.remove('modal-overlay--error');
  modalOverlayLogin.classList.remove('modal-overlay--js-visible');
  modalOverlayLogin.classList.add('modal-overlay--js-close');
  setTimeout(function() {modalOverlayLogin.classList.add('modal-overlay--hidden')}, 400);
})


window.addEventListener('keydown', function (evt) {
  if(evt.keyCode === 27) {
    if (!modalOverlayLogin.classList.contains('modal-overlay--hidden')){
      modalOverlayLogin.classList.remove('modal-overlay--error');
      modalOverlayLogin.classList.remove('modal-overlay--js-visible');
      modalOverlayLogin.classList.add('modal-overlay--js-close');
      setTimeout(function() {modalOverlayLogin.classList.add('modal-overlay--hidden')}, 400);
    }
  }
});


linkMap.addEventListener('click', function (evt) {
  evt.preventDefault();
  modalOverlayMap.classList.remove('modal-overlay--js-close');
  modalOverlayMap.classList.remove('modal-overlay--hidden');
  modalOverlayMap.classList.add('modal-overlay--js-visible');
})

closeBtnMap.addEventListener('click', function (evt) {
  evt.preventDefault();
  modalOverlayMap.classList.remove('modal-overlay--js-visible');
  modalOverlayMap.classList.add('modal-overlay--js-close');
  setTimeout(function() { modalOverlayMap.classList.add('modal-overlay--hidden')}, 400);
})


window.addEventListener('keydown', function (evt) {
  if(evt.keyCode === 27) {
    if (!modalOverlayMap.classList.contains('modal-overlay--hidden')){
      modalOverlayMap.classList.remove('modal-overlay--js-visible');
      modalOverlayMap.classList.add('modal-overlay--js-close');
      setTimeout(function() {modalOverlayMap.classList.add('modal-overlay--hidden')}, 400);
    }
  }
});