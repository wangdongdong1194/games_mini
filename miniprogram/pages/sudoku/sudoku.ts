// pages/sudoku/sudoku.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    sudokuDatas: Array<string>(81).fill(''),
    inputDatas: ['1','2','3','4','5','6','7','8','9','C'],
    boxColors: Array<string>(81).fill(''),
    selectedIndex: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getSudokuApi()
    this.initBoxColors();
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
  // 请求接口
  async getSudokuApi() {
    if(this.data.loading) return;
    this.setData({ loading: true });
    wx.showLoading({ title: '加载中' })
    const a = [5, 3, 0, 0, 7, 0, 0, 0, 0,
      6, 0, 0, 1, 9, 5, 0, 0, 0,
      0, 9, 8, 0, 0, 0, 0, 6, 0,
      8, 0, 0, 0, 6, 0, 0, 0, 3,
      4, 0, 0, 8, 0, 3, 0, 0, 1,
      7, 0, 0, 0, 2, 0, 0, 0, 6,
      0, 6, 0, 0, 0, 0, 2, 8, 0,
      0, 0, 0, 4, 1, 9, 0, 0, 5,
      0, 0, 0, 0, 8, 0, 0, 7, 9];
    const b = a.map(t => t ? String(t):'');
    this.setData({
      sudokuDatas: b,
    });
    wx.hideLoading();
    this.setData({ loading: false });
    // wx.request({
    //   url: '你的接口地址',
    //   method: 'GET',
    //   success: (res) => {
    //     // 赋值渲染 grid 数据
    //   },
    //   complete: () => {
    //     wx.hideLoading()
    //     this.setData({ loading: false })
    //   }
    // })
  },
  // 点击选中事件
  clickCellEvent(e: any){
    const index = e.currentTarget.dataset.index;
    const value = this.data.sudokuDatas[index];
    console.log(index,value);
    this.setData({
      selectedIndex: Number(index),
    });
    this.initBoxColors();
  },
  // 点击输入
  clickInputCellEvent(e: any){
    const index = e.currentTarget.dataset.index;
  },
  // 计算每个格子属于哪个小九宫 2、4、6、8 标为 true
  initBoxColors() {
    const TOTAL_COUNT = 81;
    const CLASS_SELECTED = 'selected';
    const CLASS_SELECTED_MARK = 'selectedMark';
    const CLASS_SAMEMARK = 'sameMark';
    const currentSelectedIndex = this.data.selectedIndex;
    const currentChar = this.data.sudokuDatas[currentSelectedIndex];
    const currentRow = Math.floor(currentSelectedIndex/9);
    const currentCol = currentSelectedIndex%9;
    const currentBoxRow = Math.floor(currentRow / 3);
    const currentBoxCol = Math.floor(currentCol / 3);
    const currentBoxNum = currentBoxRow * 3 + currentBoxCol + 1;
    let tmpSelected = this.data.boxColors[currentSelectedIndex]!==CLASS_SELECTED; // 是否选中了节点
    const tmpSelectedArray: number[] = []; // 选中后横竖9宫索引
    const sameCharArray: number[] = []; // 同字
    for (let i = 0; i < TOTAL_COUNT; i++) {
      const row = Math.floor(i / 9)
      const col = i % 9
      const boxRow = Math.floor(row / 3)
      const boxCol = Math.floor(col / 3)
      const boxNum = boxRow * 3 + boxCol + 1
      // 横竖9宫
      if((currentRow === row || currentCol === col || (boxNum === currentBoxNum)) && currentSelectedIndex !== i){
        tmpSelectedArray.push(i);
      }
      if(this.data.sudokuDatas[i] && this.data.sudokuDatas[i] === currentChar && currentSelectedIndex !== i){
        sameCharArray.push(i);
      }
      // 2、4、6、8 号小九宫 → 浅色
      this.data.boxColors[i] = [2, 4, 6, 8].includes(boxNum) ? 'even' : 'odd';
    }
    if(tmpSelected){
      // 取消则选中
      this.data.boxColors[currentSelectedIndex] = CLASS_SELECTED;
      // 横竖9宫
      for(const i of tmpSelectedArray){
        this.data.boxColors[i] = CLASS_SELECTED_MARK;
      }
      for(const i of sameCharArray){
        if(!tmpSelectedArray.includes(i)){
          this.data.boxColors[i] = CLASS_SAMEMARK;
        }
      }
    }
    this.setData({ boxColors: this.data.boxColors })
  },
})