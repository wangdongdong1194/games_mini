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
      const datas = this.getDataAndStorage();
      sudokuList = datas.sudokuList;
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
  // 重玩
  replay(){
    wx.showModal({
      content: '确定要重玩？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync(this.data.STORAGE_RESPONSE_LIST);
          this.getSudokuApi();
        }
      }
    })
  },
  // 提示
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
  },
  // 换题
  exchange(){
    wx.showModal({
      content: '确定要换题？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync(this.data.STORAGE_ANSWER_LIST);
          wx.removeStorageSync(this.data.STORAGE_RESPONSE_LIST);
          wx.removeStorageSync(this.data.STORAGE_QUESTION_LIST);
          this.getSudokuApi();
        }
      }
    })
    // wx.request({
    //   url: 'http://www.wangzhidong.cn:3000/api/sudoku',
    //   method: 'GET',
    //   success: (res) => {
    //     // 赋值渲染 grid 数据
    //     console.log(res);
    //   },
    //   complete: () => {
    //     wx.hideLoading()
    //     this.setData({ loading: false })
    //   }
    // })
  },
  // 设置数据到缓存
  getDataAndStorage(){
    const resFromApi = this.getDataFromApi();
    if(resFromApi && resFromApi.sudokuList){
      const sudokuList = resFromApi.sudokuList;
      wx.setStorageSync(this.data.STORAGE_QUESTION_LIST, sudokuList);
    }
    const answers = resFromApi.answers;
    wx.setStorageSync(this.data.STORAGE_ANSWER_LIST, answers);
    return resFromApi;
  },
  // 获取题
  getDataFromApi(){
    const totalSudoku = [{
      "id": 16,
      "puzzle": "000000000000003085001020000000507000004000100090000000500000073002010000000040009",
      "solution": "275491638649783215381625947921537864854269173736148592518974326462315789197856423"
    },{
      "id": 15,
      "puzzle": "000000000003010000402000500010000090000504000080000070009000301000090200000000000",
      "solution": "958467213743215986462839517517328694236574189689146375829753461175698234341982756"
    },{
      "id": 14,
      "puzzle": "800000000003600000070090200050007000000045700000100030001000068008500010090000400",
      "solution": "812753649943682175576491283154327896389645721267189534421978365738564912695231478"
    },{
      "id": 13,
      "puzzle": "000000020080007090602000500070060000000901000000020040005000603090400070010000000",
      "solution": "954716328381547692672389514179463852243951786568729143425178639896435271713692485"
    },{
      "id": 12,
      "puzzle": "008000500010603070500000001000174000040302010000589000800000003060208050009000700",
      "solution": "378421569912653478546897321695174832741362915234589671857916243163248759429735186"
    },{
      "id": 11,
      "puzzle": "000000000302070104081040520000206000940000087000708000034050260706010403000000000",
      "solution": "597831642362579184481642523875296314943157286621748935134958267756214893218364759"
    },{
      "id": 10,
      "puzzle": "000602000400050001085010620038000160000060000067000340019050270200080005000907000",
      "solution": "193642857426857391785319624538724169941563782267198345819456273274381965653297418"
    },{
      "id": 9,
      "puzzle": "200080300060007084030500209000105408000000000602003000504002090910030020008040006",
      "solution": "245981367169327584837564219923175486758496123614283975584612793916738542372549861"
    },{
      "id": 8,
      "puzzle": "003020600900305001001806400008102900700000008006708200002609500800203009005010300",
      "solution": "483921657967345821251876493548132976729564138136798254372619584814253769695487312"
    }];
    const result: {sudokuList: string,answers: string} = {
      sudokuList: '',
      answers: '',
    };
    const res = totalSudoku[Math.floor(Math.random() * totalSudoku.length)];
    if(result){
      result.sudokuList = res.puzzle;
      result.answers = res.solution;
    }else {
      wx.showToast({
        title: '未获取到数独',
        icon: 'error'
      });
    }
    return result;
  }
})