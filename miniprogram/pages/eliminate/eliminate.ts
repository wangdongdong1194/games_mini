Page({
  /**
   * 页面的初始数据
   */
  data: {
    eliminateDatas:Array<{type: string;selected: boolean}>(),
    pressInfo: {
      startClientX: 0,
      startClientY: 0,
    },
    index: -1,
    MOVE_DISTANCE: 10, // 超过这个值算移动
    state: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const eliminateDatas = Array.from({ length: 81 }).map((_,index) => {
      return {
        type: String(index),
        selected: false,
      }
    });
    this.setData({
      eliminateDatas,
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  onTouchStart(e:any){
    const index = e.currentTarget.dataset.index;
    const {clientX, clientY} = e.touches[0];
    this.data.pressInfo.startClientX = clientX;
    this.data.pressInfo.startClientY = clientY;
    console.log(index);
    this.data.index = index;
    this.data.eliminateDatas.map((t,innerIndex) => {
      if(index ===innerIndex){
        t.selected = true;
      }else {
        t.selected = false;
      }
      return t;
    });
    this.setData({
      eliminateDatas: this.data.eliminateDatas,
      state: true,
    });
  },
  onTouchMove(e:any) {
    if(!this.data.state){
      return;
    }
    const {clientX, clientY} = e.touches[0];
    const x = clientX - this.data.pressInfo.startClientX;
    const y = clientY - this.data.pressInfo.startClientY;
    const absX = Math.abs(x);
    const absY = Math.abs(y)
    if(absX < this.data.MOVE_DISTANCE && absY < this.data.MOVE_DISTANCE){
      return;
    }
    this.data.state = false;
    const index = this.data.index;
    let modifyIndex = -1;
    if(absX > absY){
      if(x > 0){
        this.data.eliminateDatas.map((t,innerIndex) => {
          if(index + 1 ===innerIndex || index === innerIndex){
            t.selected = true;
          }else {
            t.selected = false;
          }
          return t;
        });
        modifyIndex = index + 1;
      }else if(x < 0){
        this.data.eliminateDatas.map((t,innerIndex) => {
          if(index - 1 ===innerIndex || index === innerIndex){
            t.selected = true;
          }else {
            t.selected = false;
          }
          return t;
        });
        modifyIndex = index - 1;
      }
    }else if(absX < absY){
      if(y > 0){
        this.data.eliminateDatas.map((t,innerIndex) => {
          if(index + 9 ===innerIndex || index === innerIndex){
            t.selected = true;
          }else {
            t.selected = false;
          }
          return t;
        });
        modifyIndex = index + 9;
      }else if(y < 0){
        this.data.eliminateDatas.map((t,innerIndex) => {
          if(index - 9 ===innerIndex || index === innerIndex){
            t.selected = true;
          }else {
            t.selected = false;
          }
          return t;
        });
        modifyIndex = index - 9;
      }
    }
    const type = String(this.data.eliminateDatas[index].type);
    this.data.eliminateDatas[index].type = this.data.eliminateDatas[modifyIndex].type;
    this.data.eliminateDatas[modifyIndex].type = type;
    this.setData({
      eliminateDatas: this.data.eliminateDatas,
    });
  },
  onTouchEnd(e:any) {
    const index = e.currentTarget.dataset.index;
    console.log('松开', index)
    this.data.state = false;
  },
})