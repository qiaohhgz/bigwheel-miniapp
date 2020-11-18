## 前言
大转盘营销活动大家应该都不陌生那如何用小程序实现呢？
第一个版本的大转盘都是用图片做的，奖品等信息都是不无法修改的，说白了就是没啥实际用途，作者我就直接用canvas撸了一个全手工绘制的大转盘分享给大家。此处应有掌声 : )

### 效果图
> 因为gif动态效果图实在是太大了，就截取了两张图片给大家看

![](https://upload-images.jianshu.io/upload_images/9260441-fa18737c987a30ee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/9260441-7aa220d8ccdfb2de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 项目结构
![](https://upload-images.jianshu.io/upload_images/9260441-54271569eae57ede.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 运行流程
* 获取所有奖品列表
* 绘制指针和转盘
* 绑定指针区域点击事件
* 点击指针开始转动
* 请求后端获取抽中的奖品
* 调用大转盘停止方法把奖品传进去
* 大转盘停止转动
* 展示奖品和信息

### 关键代码
绘制大转盘和绑定指针点击事件
```javascript
 // 启用事件
    point.inputEvent = true;
    point.onInputDown = run;
// 更新动画
    var update = function () {
      // 清空
      context.clearRect(0, 0, w, h);
      // 画转盘
      wheel.draw(context);
      // 画指针
      point.draw(context);

      // 更新数据
      animation.draw(context);
      // 更新数据
      animation.update();

      // 获取手指点击
      var touch = that.data.touch;
      if (point.inputEvent && touch.isPressed && point.onInputDown) {
        // 如果点击到了指针
        if (point.contains(touch)) {
          // 调用点击回调方法
          point.onInputDown();
        }
      }

      // 绘图   
      context.draw()

    };
    setInterval(update, 1000 / fps, 1000 / fps);
```

点击指针之后的回调处理
使用setTimeout 模拟后端返回结果
使用stopTo 方法来让大转盘停止到某一个奖品
```javascript
 // 开始转
    function run() {
      // 避免重复调用
      if (animation.isRun) return;
      // 当动画完成时
      animation.onComplete = function (prize) {
        wx.showToast({
          image: prize.img,
          title: prize.text,
          duration: 3000,
          mask: true,
        })
      };

      // 开始转
      animation.run();

      // 模拟后台返回数据
      setTimeout(function () {
        // 随机一个奖品
        var prizeIndex = utils.getRandom(slicePrizes.length - 1);
        // 计算奖品角度
        animation.stopTo(prizeIndex);
      }, 3000);
    }
```
转动处理的构造方法
```javascript
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
```
转动效果，先加速》匀速一段时间》调用stopTo方法后》减速》停止
```javascript

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
```

大转盘的绘制
```javascript

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
```
指针和跑马灯的绘制
```javascript

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

  // 指针
  context.beginPath()
  context.setFillStyle('#ffffff')
  context.moveTo(0, (this.radius + 50) * -1);
  context.lineTo(-10, 0);
  context.lineTo(10, 0);
  context.fill()

  // 圆盘
  context.beginPath()
  context.setFillStyle('#ffffff')
  context.arc(0, 0, this.radius, 0, 2 * Math.PI)
  context.fill()

  // 文字
  context.setFontSize(30)
  context.setFillStyle('#ff2244')
  context.setTextAlign("center");
  context.fillText('抽奖', 0, 10)

  var r = this.wheel.radius;
  // 跑马灯外框  F6D000  FFA200
  context.beginPath()
  context.setLineWidth(15);
  context.setStrokeStyle("#FFA200")
  context.arc(0, 0, r + 20, 0, 2 * Math.PI)
  context.stroke()

  // 跑马灯内框 F6D000
  context.beginPath()
  context.setLineWidth(10);
  context.setStrokeStyle("#F6D000")
  context.arc(0, 0, r + 8, 0, 2 * Math.PI)
  context.stroke()

  // 跑马灯灯  
  for (var i = 0; i < 32; i++) {
    context.beginPath()
    context.setFillStyle(i % 2 == 0 ? "#ffffff" : "#FF403A")
    context.arc(r + 20, 0, 4, 0, 2 * Math.PI)
    context.fill()
    context.rotate((360 / 32) * Math.PI / 180);
  }
  // 还原
  context.restore();
};
```

### 其他推荐
微信小程序-欢乐夹娃娃 https://blog.100boot.cn/post/3067

[![微信小程序-欢乐夹娃娃](https://blog.100boot.cn/storage/thumbnails/_signature/2MN5CRHT0NNDA9QRAFIBS6G7HS.jpg)](https://blog.100boot.cn/post/3067)

### 完整代码
GitHub 地址: https://github.com/qiaohhgz/bigwheel-miniapp

### 关注我们

![](http://upload-images.jianshu.io/upload_images/9260441-fbb877c1ace32df7.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> IT实战联盟是集产品、UI设计、前后端、架构、大数据和AI人工智能等为一体的实战交流服务平台！联盟嘉宾都为各互联网公司项目的核心成员，联盟主旨是“让实战更简单”，欢迎来撩~~~

> 我们的网站: [http://100boot.cn](http://100boot.cn)
