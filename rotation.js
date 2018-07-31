$(document).ready(function(){
  $('.rotation-group').slick({
    infinite: true,
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 0,
    adaptiveHeight: true
  });

  $('.rotation-group').slick('slickFilter', '.rotation-include');
  // Rotate between elements with class 'rotation-include'
});

