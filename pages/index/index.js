// pages/main/main.js
var utils = require('../../utils/utils.js');
var Animation = require('../../utils/Animation.js');
var Pointer = require('../../utils/Pointer.js');
var Wheel = require('../../utils/Wheel.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowWidth: 0,
    windowHeight: 0,
    wheelImg: 'assets/wheel.png',
    pointImg: 'assets/point.png',
    touch: { x: 0, y: 0, isPressed: false }
  },

  touchMove: function (event) {

  },

  canvasTouchStart: function (event) {
    var touch = event.changedTouches[0];
    touch.isPressed = true;
    this.setData({
      touch: touch
    })
  },

  canvasTouchEnd: function (event) {
    var touch = event.changedTouches[0];
    touch.isPressed = false;
    this.setData({
      touch: touch
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 把设备的尺寸赋值给画布，以做到全屏效果
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight
        });
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '幸运大转盘',
    })
    var that = this,
      fps = 60,
      slicePrizes = ["恭喜中了大奖", "50 积分", "500 积分", "谢谢参与", "200 积分", "100 积分", "150 积分", "谢谢参与"],
      slicePrizes = [
        { text: "恭喜中了大奖", img: "assets/gift.png" },
        { text: "50 积分", img: "assets/gift.png" },
        { text: "500 积分", img: "assets/gift.png" },
        { text: "谢谢参与", img: "assets/gift.png" },
        { text: "200 积分", img: "assets/gift.png" },
        { text: "100 积分", img: "assets/gift.png" },
        { text: "150 积分", img: "assets/gift.png" },
        { text: "谢谢参与", img: "assets/gift.png" }
      ],
      w = this.data.windowWidth,
      h = this.data.windowHeight,
      context = wx.createCanvasContext('canvas'),
      wheel = new Wheel(w / 2, h / 2.5, w / 2 - 50, slicePrizes),
      point = new Pointer(w / 2, h / 2.5, 40, wheel),
      animation = new Animation(wheel, { w: w, h: h })
      ;

    wheel.prizeWidth = 30;
    wheel.prizeHeight = 30;

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
  }
})
