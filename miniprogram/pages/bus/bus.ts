import { IBindinput } from "./type";

// pages/bus.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    busName: ""
  },
  onLoad() {
    console.log('onLoad');
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success (res) {
        console.log('RES',res);
        const latitude = res.latitude
        const longitude = res.longitude
        wx.showToast({
          title: latitude + '_' + longitude
        });
      }
    })
  },
  onReady() {

  },
  onShow() {

  },
  busNameEvent(e: IBindinput){
    const busNameTrim = (e.detail.value || '').trim(); 
    this.setData({
      busName: busNameTrim,
    });
  }
})