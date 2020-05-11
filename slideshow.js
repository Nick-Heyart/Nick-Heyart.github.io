document.addEventListener('mousemove', e => {

  const x = e.pageX;
  const y = e.pageY;

  const elm = document.querySelector('.card');
  const coords = elm.getBoundingClientRect();

  const elmX = coords.left + elm.offsetWidth / 2;
  const elmY = coords.top + elm.offsetHeight / 2;

  const angleX = (elmY - y) / 100;
  const angleY = (elmX - x) / -100;

  //smooth out x motion
  var xpos10 = xpos9;
  var xpos9 = xpos8;
  var xpos8 = xpos7;
  var xpos7 = xpos6;
  var xpos6 = xpos5;
  var xpos5 = xpos4;
  var xpos4 = xpos3;
  var xpos3 = xpos2;
  var xpos2 = xpos1;
  var xpos1 = angleX;
  var xSmoothed = (xpos1 + xpos2 + xpos3 + xpos4 + xpos5 + xpos6 + xpos7 + xpos8 + xpos9 + xpos10) / 10;

  elm.style.transform = `rotateX(${xSmoothed}deg)
												 rotateY(${angleY}deg)`;

});