/**
 *
 * @author qiao
 * @version 2017/12/30
 */
var utils = {};

utils.getRandom = function (max, min) {
  min = arguments[1] || 0;
  return Math.floor(Math.random() * (max - min + 1) + min);
};

utils.containsPoint = function (rect, x, y) {
  return !(x < rect.x ||
    x > rect.x + rect.width ||
    y < rect.y ||
    y > rect.y + rect.height);
};

utils.captureTouch = function (element) {
  var isTouch = ('ontouchend' in document);
  var touchstart = null;
  var touchmove = null;
  var touchend = null;
  if (isTouch) {
    touchstart = 'touchstart';
    touchmove = 'touchmove';
    touchend = 'touchend';
  } else {
    touchstart = 'mousedown';
    touchmove = 'mousemove';
    touchend = 'mouseup';
  }
  var touch = { x: null, y: null, isPressed: false, event: null },
    body_scrollLeft = document.body.scrollLeft,
    element_scrollLeft = document.documentElement.scrollLeft,
    body_scrollTop = document.body.scrollTop,
    element_scrollTop = document.documentElement.scrollTop,
    offsetLeft = element.offsetLeft,
    offsetTop = element.offsetTop;

  /*传入Event对象*/
  function getPoint(event) {
    /*将当前的触摸点坐标值减去元素的偏移位置，返回触摸点相对于element的坐标值*/
    event = event || window.event;
    var touchEvent = isTouch ? event.changedTouches[0] : event;
    var x = (touchEvent.pageX || touchEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft);
    x -= element.offsetLeft;
    var y = (touchEvent.pageY || touchEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop);
    y -= element.offsetTop;
    return {
      x: x,
      y: y
    };
  };

  element.addEventListener(touchstart, function (event) {
    var point = getPoint(event);
    touch.x = point.x;
    touch.y = point.y;
    touch.isPressed = true;
    touch.event = event;
  }, false);

  element.addEventListener(touchend, function (event) {
    touch.isPressed = false;
    touch.x = null;
    touch.y = null;
    touch.event = event;
  }, false);

  element.addEventListener(touchmove, function (event) {
    var point = getPoint(event);
    touch.x = point.x;
    touch.y = point.y;
    touch.event = event;
  }, false);

  return touch;
};

module.exports = utils;