// pages/sudoku/sudoku.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    sudokuDatas: Array<string>(81).fill(''),
    inputDatas: Array<{value: string;remain: number}>(),
    DELETE_FLAG: 'C',
    boxColors: Array<string>(81).fill(''),
    selectedIndex: -1,
    readableColors: Array<string>(81).fill(''),
    disabledInputList: Array<boolean>(10).fill(false),
    TOTAL_COUNT: 81,
    CLASS_SELECTED: 'selected' , // 选中
    CLASS_READABLE: 'readable',
    CLASS_SELECTED_MARK : 'selectedMark',
    CLASS_SAMEMARK : 'sameMark',
    STORAGE_QUESTION_LIST: 'storageQuestionList',
    STORAGE_RESPONSE_LIST: 'storageResponseList',
    STORAGE_ANSWER_LIST: 'storageAnswrerList',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getSudokuApi()
    this.calBoxColors(-1, false);
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
    let sudokuList = wx.getStorageSync(this.data.STORAGE_QUESTION_LIST) as string;
    if(!sudokuList || sudokuList.length !== this.data.TOTAL_COUNT){
      sudokuList = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
      const answers = '534678912672195348198342567859761423426853791713924856961537284287419635345286179';
      wx.setStorageSync(this.data.STORAGE_QUESTION_LIST, sudokuList);
      wx.setStorageSync(this.data.STORAGE_ANSWER_LIST, answers);
    }
    if(!sudokuList || sudokuList.length !== this.data.TOTAL_COUNT){
      wx.showLoading({ title: '接口异常' })
      this.setData({ loading: false });
    } else {
      let sudokuDatas = sudokuList.split('').map(t => t && t !== '0' ? String(t):'');
      const readableColors: string[] = [];
      sudokuDatas.forEach((item) => {
        if (item) {
          readableColors.push(this.data.CLASS_READABLE);
        } else {
          readableColors.push('');
        }
      });
      const responses = wx.getStorageSync(this.data.STORAGE_RESPONSE_LIST) as string;
      if(responses && responses.length === 81){
        sudokuDatas = responses.split('').map(t => t && t !== '0' ? String(t):'');
      }
      this.setData({
        sudokuDatas,
        readableColors,
        loading: false,
      });
      this.calRemain();
      wx.hideLoading();
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
    }
  },
  // 点击选中事件
  clickCellEvent(e: any){
    const index = e.currentTarget.dataset.index;
    this.setData({
      selectedIndex: Number(index),
    });
    this.calBoxColors(Number(index), this.data.boxColors[index]!==this.data.CLASS_SELECTED);
    this.calRemainDisable(index);
  },
  // 点击输入
  clickInputCellEvent(e: any){
    const index = e.currentTarget.dataset.index;
    const selectedIndex = this.data.selectedIndex;
    if(selectedIndex > -1 && this.data.boxColors[selectedIndex]===this.data.CLASS_SELECTED && !this.data.readableColors[selectedIndex]){
      const currentChar = this.data.inputDatas[index].value;
      this.data.sudokuDatas[selectedIndex] = currentChar === this.data.DELETE_FLAG ? '' : currentChar;
      this.setData({
        sudokuDatas: this.data.sudokuDatas,
      });
      const answers = this.data.sudokuDatas.map(t => t ? t: '0').join('');
      wx.setStorageSync(this.data.STORAGE_RESPONSE_LIST, answers);
      this.calBoxColors(selectedIndex, true);
      this.calRemain();
      this.calRemainDisable(selectedIndex);
    }
  },
  // 设置box颜色
  calBoxColors(currentSelectedIndex: number, selected: boolean){
    const currentChar = this.data.sudokuDatas[currentSelectedIndex];
    const currentRow = Math.floor(currentSelectedIndex/9);
    const currentCol = currentSelectedIndex%9;
    const currentBoxRow = Math.floor(currentRow / 3);
    const currentBoxCol = Math.floor(currentCol / 3);
    const currentBoxNum = currentBoxRow * 3 + currentBoxCol + 1;
    const tmpSelectedArray: number[] = []; // 选中后横竖9宫索引
    const sameCharArray: number[] = []; // 同字
    for (let i = 0; i < this.data.TOTAL_COUNT; i++) {
      const row = Math.floor(i / 9)
      const col = i % 9
      const boxRow = Math.floor(row / 3)
      const boxCol = Math.floor(col / 3)
      const boxNum = boxRow * 3 + boxCol + 1
      // 横竖9宫
      if((currentRow === row || currentCol === col || (boxNum === currentBoxNum)) && currentSelectedIndex !== i){
        tmpSelectedArray.push(i);
      }
      // 2、4、6、8 号小九宫
      this.data.boxColors[i] = [2, 4, 6, 8].includes(boxNum) ? 'even' : 'odd';

      if(this.data.sudokuDatas[i] && this.data.sudokuDatas[i] === currentChar && currentSelectedIndex !== i){
        sameCharArray.push(i);
      }
    }
    if(selected){
      // 取消则选中
      this.data.boxColors[currentSelectedIndex] = this.data.CLASS_SELECTED;
      // 横竖9宫
      for(const i of tmpSelectedArray){
        this.data.boxColors[i] = this.data.CLASS_SELECTED_MARK;
      }
      for(const i of sameCharArray){
        if(!tmpSelectedArray.includes(i)){
          this.data.boxColors[i] = this.data.CLASS_SAMEMARK;
        }
      }
    }
    this.setData({ boxColors: this.data.boxColors })
  },
  // 计算剩余
  calRemain(){
    const inputDatas = [{
      value: '1',
      remain: 9,
    },{
      value: '2',
      remain: 9,
    },{
      value: '3',
      remain: 9,
    },{
      value: '4',
      remain: 9,
    },{
      value: '5',
      remain: 9,
    },{
      value: '6',
      remain: 9,
    },{
      value: '7',
      remain: 9,
    },{
      value: '8',
      remain: 9,
    },{
      value: '9',
      remain: 9,
    },{
      value: this.data.DELETE_FLAG,
      remain: 0,
    }];
    const inputMap = new Map<string, number>(
      inputDatas.map(item => [item.value, item.remain])
    );
    for(let i = 0 ; i < this.data.TOTAL_COUNT; i ++){
      const value = this.data.sudokuDatas[i];
      if(value){
        const num = inputMap.get(value) || 0;
        inputMap.set(value, num - 1);
      }
    }
    this.setData({
      inputDatas: Array.from(inputMap).map(([value, remain]) => ({
        value: value,
        remain: remain
      }))
    });
  },
  // 计算可填数字
  calRemainDisable(currentSelectedIndex: number){
    // 题干不需要操作
    let disabledInputList: boolean[] = [];
    if(this.data.readableColors[currentSelectedIndex] === this.data.CLASS_READABLE){
      disabledInputList = this.data.disabledInputList.map(_ => true);
    } else {
      const currentRow = Math.floor(currentSelectedIndex/9);
      const currentCol = currentSelectedIndex%9;
      const currentBoxRow = Math.floor(currentRow / 3);
      const currentBoxCol = Math.floor(currentCol / 3);
      const currentBoxNum = currentBoxRow * 3 + currentBoxCol + 1;
      const writeNumSet = new Set<string>();
      for (let i = 0; i < this.data.TOTAL_COUNT; i++) {
        const row = Math.floor(i / 9)
        const col = i % 9
        const boxRow = Math.floor(row / 3)
        const boxCol = Math.floor(col / 3)
        const boxNum = boxRow * 3 + boxCol + 1
        const tChar = this.data.sudokuDatas[i];
        if(!tChar){
          continue;
        }
        if(row === currentRow || col === currentCol || boxNum === currentBoxNum){
          writeNumSet.add(tChar);
        }
      }
      disabledInputList = this.data.disabledInputList.map((_, index) => {
        return writeNumSet.has(this.data.inputDatas[index].value);
      });
      disabledInputList[disabledInputList.length-1] = false;
    }
    this.setData({
      disabledInputList,
    });
  },
  replay(){
    wx.removeStorageSync(this.data.STORAGE_RESPONSE_LIST);
    this.getSudokuApi();
  },
  prompt(){
    const selectedIndex = this.data.selectedIndex;
    if(selectedIndex > -1 && this.data.boxColors[selectedIndex]===this.data.CLASS_SELECTED && !this.data.readableColors[selectedIndex]){
      const questions = wx.getStorageSync(this.data.STORAGE_ANSWER_LIST) as string;
      console.log(questions);
      if(questions && questions.length === this.data.TOTAL_COUNT){
        wx.showToast({
          title: questions[selectedIndex],
          icon: 'none'
        });
      }
    }
  }
})