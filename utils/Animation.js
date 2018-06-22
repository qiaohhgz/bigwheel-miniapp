var utils = require('utils.js');
/**
 * 动画
 * @author qiao
 * @version 2017/12/30
 */
function Animation(circle, screen) {
  this.circle = circle;
  this.screen = screen;
  // 角速度
  this.speed = 0;
  // 最大速度
  this.maxSpeed = 10;
  // 摩擦力
  this.friction = 0.98;
  // 加速度
  this.acceleration = 0.5;
  // 是否开始运行
  this.isRun = false;
  // 圈数
  this.rounds = 5;
  // 角度
  this.degrees = 0;
  // 当前角度
  this.angle = -90;
  // 开始减速
  this.speedDown = false;
  // 开始加速
  this.speedUp = true;
  // 顺时针还是逆时针
  this.anticlockwise = false;
  // 完成
  this.onComplete = null;
  // debug
  this.isDebug = false;
}

Animation.prototype.run = function () {
  this.speedDown = false;
  this.speedUp = true;
  this.isRun = true;
  this.speed = 0;
  this.prize = null;
};

Animation.prototype.draw = function (context) {
  // 保存
  context.save();
  if (this.isDebug) {
    // 移动到圆心
    context.translate(10, 15);

    context.setFontSize(12)
    context.setFillStyle('black')
    context.fillText("angle: " + Math.round(this.angle), 0, 0);

    context.translate(0, 15);
    context.fillText("speed: " + this.speed, 0, 0);

    if (this.prize) {
      context.translate(0, 15);
      context.fillText("minAngle: " + this.minAngle, 0, 0);

      context.translate(0, 15);
      context.fillText("maxAngle: " + this.maxAngle, 0, 0);

      context.translate(0, 15);
      context.fillText("prize.text: " + this.prize.text, 0, 0);
    }
  }
  // 画logo
  var w = this.screen.w - 20;
  var h = 70;
  context.drawImage("assets/logo.png", 10, 10, w, h);

  // 还原
  context.restore();
};

Animation.prototype.update = function () {
  if (this.isRun) {
    // 到达奖品区
    var isJoin = this.prize && this.angle > this.minAngle && this.angle < this.maxAngle;
    // 是否要减速
    if (isJoin) {
      this.speedDown = true;
    }

    // 是否要停止加速
    if (this.speed >= this.maxSpeed) {
      this.speedUp = false;
    }

    // 加速
    if (this.speedUp) {
      this.speed += this.acceleration;
    }

    // 减速
    if (this.speedDown) {
      if (this.speed <= 2 && isJoin) {
        this.isRun = false;
        this.speed = 0;
        if (this.onComplete) this.onComplete(this.prize);
      } else if (this.speed <= 1) {
        this.speed = 1;
      } else {
        this.speed *= this.friction;
      }
    }

    this.angle += this.speed;
    // 转动角度
    if (Math.abs(this.angle) > 360) {
      this.angle -= 360;
    }
    // 旋转方向
    if (this.anticlockwise) {
      this.circle.rotation += (Math.PI / 180) * this.speed;
    } else {
      this.circle.rotation -= (Math.PI / 180) * this.speed;
    }
  }
};

Animation.prototype.stopTo = function (prizeIndex) {
  var wheel = this.circle;
  var angle = wheel.angle;
  var offset = utils.getRandom(angle / 2);
  this.minAngle = prizeIndex * angle + offset;
  this.maxAngle = prizeIndex * angle + angle;
  this.prize = wheel.slicePrizes[prizeIndex];
};

module.exports = Animation;