Page({
  /**
   * 页面的初始数据
   */
  data: {
    cellWidth: 0,
    eliminateDatas:Array<{type: string;clearRow: boolean;fullDown: boolean}>(),
    pressInfo: {
      startTouchX: 0,
      startTouchY: 0,
      touchState: false,
    },
    index: -1,
    MOVE_DISTANCE: 10, // 超过这个值算移动
    maxType: 3,
    animationInternal: 200,
    playState: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const eliminateDatas = Array.from({ length: 81 }).map(() => {
      return {
        type: String(Math.floor(Math.random() * (this.data.maxType + 1))),
        clearRow: false,
        fullDown: false,
      }
    });
    this.data.playState =false;
    this.setData({
      eliminateDatas,
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.calCellWidth();
    this.handler();
  },
  // 计算cell宽度
  calCellWidth(){
    const query = wx.createSelectorQuery();
    const info = wx.getSystemInfoSync();
    query.select('.cell-9 ').boundingClientRect(res => {
      this.data.cellWidth = res.width * 750 / info.screenWidth;
      console.log(this.data.cellWidth, res.width, info.screenWidth);
      this.setData({
        cellWidth: this.data.cellWidth,
      });
    }).exec()
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
    this.data.pressInfo.startTouchX = clientX;
    this.data.pressInfo.startTouchY = clientY;
    this.data.pressInfo.touchState = true;
    this.data.index = index;
    this.setData({
      pressInfo: this.data.pressInfo,
    });
  },
  async onTouchMove(e:any) {
    if(!this.data.pressInfo.touchState || this.data.playState){
      return;
    }
    console.log('==');
    // 交换
    if(!this.exchange(e.touches[0].clientX,e.touches[0].clientY)){
      return;
    }else {
      await this.handler();
    }
  },
  onTouchEnd(e:any) {
    const index = e.currentTarget.dataset.index;
    console.log('松开', index)
    this.data.pressInfo.touchState = false;
  },
  // 处理
  async handler(){
    if(this.data.playState){
      return;
    }
    this.data.playState = true;
    let startLine = 8;
    while(startLine >= 0){
      const lines = this.canClearRow(startLine);
      if(lines.length){
        this.setClearRowSwing(startLine, lines, true);
        await new Promise(resolve => setTimeout(resolve, this.data.animationInternal));
        this.setClearRowSwing(startLine, lines);
        await new Promise(resolve => setTimeout(resolve, this.data.animationInternal));
        this.fullDownRow(startLine, lines);
        await new Promise(resolve => setTimeout(resolve, this.data.animationInternal));
        this.fulllDownRowRestore();
        this.addZeroRow(lines);
      } else {
        startLine --;
      }
    }
    this.data.playState =false;
  },
  // 二维转一维，步进值
  towArray2OneArray(lineNo: number, lines: number[][],step: number = 9){
    const arr = [];
    for(const line of lines){
      for(const l of line){
        arr.push(l + lineNo * step);
      }
    }
    return arr;
  },
  // 设置行样式
  setClearRowSwing(lineNo: number, lines: number[][], quit?: boolean){
    const clearRowArray = this.towArray2OneArray(lineNo, lines);
    const eliminateDatas = this.data.eliminateDatas.map((t, index)=>{
      if(clearRowArray.includes(index)){
        t.clearRow = !!quit;
      }
      return t;
    });
    this.setData({
      eliminateDatas,
    });
  },
  // 交换节点
  exchange(touchX: number, touchY: number){
    const x = touchX - this.data.pressInfo.startTouchX;
    const y = touchY - this.data.pressInfo.startTouchY;
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    if(absX < this.data.MOVE_DISTANCE && absY < this.data.MOVE_DISTANCE){
      return;
    }
    this.data.pressInfo.touchState = false;
    const index = this.data.index;
    let modifyIndex = -1;
    if(absX > absY){
      if(x > 0){
        modifyIndex = index + 1;
      } else if(x < 0){
        modifyIndex = index - 1;
      }
    } else if(absX < absY){
      if(y > 0){
        modifyIndex = index + 9;
      }else if(y < 0){
        modifyIndex = index - 9;
      }
    }
    const type = String(this.data.eliminateDatas[index].type);
    this.data.eliminateDatas[index].type = this.data.eliminateDatas[modifyIndex].type;
    this.data.eliminateDatas[modifyIndex].type = type;
    this.setData({
      eliminateDatas: this.data.eliminateDatas,
    });
    return true;
  },
  // 消的优先逻辑：
  // 行 从下到上 优先消除，消除后再比较
  // 列 从右往左
  // 判断行是否可以消-从9到1行
  canClearRow(lineNo: number):number[][]{
    // 行
    const eliminateData = this.data.eliminateDatas.filter((_, index) => Math.floor(index / 9) === lineNo);
    const resultArray: number[][] = [];
    const line: number[] = [];
    for(let i = 0 ; i < eliminateData.length ; i ++){
      const curType = eliminateData[i].type;
      if (!line.length) {
        line.push(i);
        continue;
      }
      if(eliminateData[line[line.length-1]].type !== curType){
        if(line.length >= 3){
          resultArray.push([...line]);
        }
        line.splice(0, line.length);
      }
      line.push(i);
    }
    if(line.length >= 3){
      resultArray.push([...line]);
    }
    return resultArray;
  },
  fullDownRow(lineNo: number, lines: number[][]){
    if(lineNo === 0){
      return;
    }
    this.fulllDownRowRestore();
    for(let i = lineNo ; i > 0 ; i --){
      const startLineNo = i * 9;
      const preLineNo = (i - 1) * 9;
      for(let j = 0;j < lines.length ; j ++){
        for(let t = 0; t < lines[j].length ; t ++){
          const sLineNo = startLineNo + lines[j][t];
          const eLineNo = preLineNo + lines[j][t];
          this.data.eliminateDatas[sLineNo].type = this.data.eliminateDatas[eLineNo].type;
          this.data.eliminateDatas[eLineNo].fullDown = true;
        }
      }
    }
    this.setData({
      eliminateDatas: this.data.eliminateDatas
    });
  },
  fulllDownRowRestore(){
    this.setData({
      eliminateDatas: this.data.eliminateDatas.map(t => {
        t.fullDown = false;
        return t;
      })
    });
  },
  addZeroRow(lines: number[][]){
    for(let j = 0;j < lines.length ; j ++){
      for(let t = 0; t < lines[j].length ; t ++){
        const sLineNo = lines[j][t];
        this.data.eliminateDatas[sLineNo].type = String(Math.floor(Math.random() * this.data.maxType));
      }
    }
    this.setData({
      eliminateDatas: this.data.eliminateDatas
    });
  }
})