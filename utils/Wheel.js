/**
 * 大转盘
 * @author qiao
 * @version 2017/12/30
 */
function Circle(x, y, radius, slicePrizes) {
  this.x = x;
  this.y = y;
  this.width = 0;
  this.height = 0;
  this.radius = radius;
  this.slicePrizes = slicePrizes;
  this.rotation = 0;
  this.img = null;
  this.scaleX = 1;
  this.scaleY = 1;
  this.inputEvent = false;
  this.onInputDown = null;
  this.colors = ["#bb33ee", "#ffcc44", "#ff2244", "#00bb88"];
  this.prizeWidth = 20;
  this.prizeHeight = 20;
  this.prizeFontSize = 14;
  this.prizeFontStyle = 'black';
  this.size = slicePrizes.length;
  this.angle = 360 / this.size;
}

Circle.prototype.draw = function (context) {
  // 保存
  context.save();
  // 移动到圆心
  context.translate(this.x, this.y);
  // 旋转
  context.rotate(this.rotation);
  // 缩放
  // context.scale(this.scaleX, this.scaleY);

  if (this.img) {
    var imgX = -this.width / 2;
    var imgY = -this.height / 2;
    context.drawImage(this.img, imgX, imgY);
  }
  var colors = this.colors;
  var size = this.size;
  var angle = this.angle;

  var r = this.radius;

  // 画扇形
  for (var i = 0; i < size; i++) {
    context.beginPath()
    context.moveTo(0, 0)
    context.arc(0, 0, r, 0, angle * Math.PI / 180)
    context.setFillStyle(colors[i % colors.length])
    context.fill()
    context.rotate(angle * Math.PI / 180);
  }

  // 画图案
  // 计算圆上任意一点
  var offset = this.radius / 2;
  var offsetA = angle / 2;
  var offsetX = Math.cos(offsetA * Math.PI / 180) * offset;
  var offsetY = Math.sin(offsetA * Math.PI / 180) * offset;
  for (var i = 0; i < size; i++) {
    var prize = this.slicePrizes[i]
    context.save();

    context.translate(offsetX, offsetY);

    context.rotate((180 - ((180 - angle) / 2)) * Math.PI / 180);
    context.drawImage(prize.img, -10, -30, this.prizeWidth, this.prizeHeight);

    // 写文字
    context.setFontSize(this.prizeFontSize)
    context.setFillStyle(this.prizeFontStyle)
    context.textAlign = "center";
    context.fillText(prize.text, 0, (offset - 25) * -1)

    // 话圆点参考
    // context.beginPath()
    // context.arc(0, 0, 2, 0, 2 * Math.PI)
    // context.setFillStyle('red')
    // context.fill()

    context.restore()
    context.rotate(angle * Math.PI / 180);
  }

  // 还原
  context.restore();
};

Circle.prototype.scale = function (x, y) {
  this.scaleX = x;
  this.scaleY = y;
};

Circle.prototype.contains = function (obj) {
  return Circle.contains(this, obj.x, obj.y);
};

Circle.contains = function (a, x, y) {
  //  Check if x/y are within the bounds first
  if (a.radius > 0 && x >= a.left && x <= a.right && y >= a.top && y <= a.bottom) {
    var dx = (a.x - x) * (a.x - x);
    var dy = (a.y - y) * (a.y - y);

    return (dx + dy) <= (a.radius * a.radius);
  }
  else {
    return false;
  }
};

Object.defineProperty(Circle.prototype, "left", {
  get: function () {
    return this.x - this.radius;
  },

  set: function (value) {
    if (value > this.x) {
      this.radius = 0;
    }
    else {
      this.radius = this.x - value;
    }
  }
});

Object.defineProperty(Circle.prototype, "right", {

  get: function () {
    return this.x + this.radius;
  },

  set: function (value) {
    if (value < this.x) {
      this.radius = 0;
    }
    else {
      this.radius = value - this.x;
    }
  }
});

Object.defineProperty(Circle.prototype, "top", {
  get: function () {
    return this.y - this.radius;
  },

  set: function (value) {
    if (value > this.y) {
      this.radius = 0;
    }
    else {
      this.radius = this.y - value;
    }
  }
});

Object.defineProperty(Circle.prototype, "bottom", {
  get: function () {
    return this.y + this.radius;
  },
  set: function (value) {
    if (value < this.y) {
      this.radius = 0;
    }
    else {
      this.radius = value - this.y;
    }
  }
});

module.exports = Circle;