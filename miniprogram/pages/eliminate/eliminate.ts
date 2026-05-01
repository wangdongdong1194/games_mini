type Direction = 'left' | 'right' | 'up' | 'down';

interface EliminateCell {
    type: number;
    clear: boolean;
    fullDown: boolean;
}

interface EliminateClearResult {
    maxRowNo: number;
    columnArray: number[];
    cellIndexArray: number[][];
}

interface PageData {
    eliminateDatas: EliminateCell[];
    isOperating: boolean;
    dragStartX: number;
    dragStartY: number;
    dragIndex: number;
    dragging: boolean;
    MOVE_DISTANCE: number;
    animationInternal: number;
    maxType: number;
    cellStyles: string[];
}

Page({
    data: {
        eliminateDatas: [],
        isOperating: false,
        dragStartX: 0,
        dragStartY: 0,
        dragIndex: -1,
        dragging: false,
        MOVE_DISTANCE: 10,
        animationInternal: 400,
        maxType: 3,
        cellStyles: ['#ff0000', '#00ff00', '#00ffff'],
    } as PageData,

    onLoad() {
        const eliminateDatas = Array.from({ length: 81 }, () => ({
            type: this.getRandomType(),
            clear: false,
            fullDown: false,
        }));
        this.setData({ eliminateDatas }, () => {
            this.start();
        });
    },

    onTouchStart(e: WechatMiniprogram.TouchEvent) {
        if (this.data.isOperating) {
            return;
        }
        const rawIndex = e.currentTarget.dataset.index;
        const index = Number(rawIndex == null ? -1 : rawIndex);
        if (index < 0) {
            return;
        }
        const touch = e.touches[0];
        this.setData({
            dragStartX: touch.clientX,
            dragStartY: touch.clientY,
            dragIndex: index,
            dragging: true,
        });
    },

    async onTouchMove(e: WechatMiniprogram.TouchEvent) {
        if (!this.data.dragging || this.data.isOperating) {
            return;
        }
        const touch = e.touches[0];
        const dx = touch.clientX - this.data.dragStartX;
        const dy = touch.clientY - this.data.dragStartY;

        if (Math.abs(dx) <= this.data.MOVE_DISTANCE && Math.abs(dy) <= this.data.MOVE_DISTANCE) {
            return;
        }

        this.setData({ dragging: false });
        const direction: Direction =
            Math.abs(dx) > Math.abs(dy)
                ? dx > 0
                    ? 'right'
                    : 'left'
                : dy > 0
                    ? 'down'
                    : 'up';

        const swapped = this.trySwapAndCheck(this.data.dragIndex, direction);
        if (swapped) {
            await this.start();
        }
    },

    onTouchEnd() {
        if (this.data.dragging) {
            this.setData({ dragging: false });
        }
    },

    getRandomType() {
        return Math.floor(Math.random() * this.data.maxType);
    },

    trySwapAndCheck(index: number, direction: Direction) {
        const row = Math.floor(index / 9);
        const col = index % 9;
        let target = -1;

        if (direction === 'left' && col > 0) {
            target = index - 1;
        }
        if (direction === 'right' && col < 8) {
            target = index + 1;
        }
        if (direction === 'up' && row > 0) {
            target = index - 9;
        }
        if (direction === 'down' && row < 8) {
            target = index + 9;
        }

        if (target < 0 || target >= this.data.eliminateDatas.length) {
            return false;
        }

        const board = this.data.eliminateDatas.slice();
        [board[index], board[target]] = [board[target], board[index]];

        if (this.canTriggerEliminate(index, board) || this.canTriggerEliminate(target, board)) {
            this.setData({ eliminateDatas: board });
            return true;
        }

        return false;
    },

    canTriggerEliminate(idx: number, board: EliminateCell[]) {
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        const rowResult = this.canClearRow(row, board);
        const colResult = this.canClearColumn(col, board);
        return rowResult.cellIndexArray.flat().length > 0 || colResult.cellIndexArray.flat().length > 0;
    },

    canClearRow(rowNo: number, board: EliminateCell[]): EliminateClearResult {
        const rowCells = board.filter((_, index) => Math.floor(index / 9) === rowNo);
        const indexArray: number[][] = [];
        const line: number[] = [];

        for (let i = 0; i < rowCells.length; i++) {
            const curType = rowCells[i].type;
            if (!line.length) {
                line.push(i);
                continue;
            }
            if (rowCells[line[line.length - 1]].type !== curType) {
                if (line.length >= 3) {
                    indexArray.push([...line]);
                }
                line.splice(0, line.length);
            }
            line.push(i);
        }

        if (line.length >= 3) {
            indexArray.push([...line]);
        }

        return {
            maxRowNo: rowNo,
            columnArray: indexArray.flat(),
            cellIndexArray: indexArray.map((item) => item.map((i) => i + rowNo * 9)),
        };
    },

    canClearColumn(columnNo: number, board: EliminateCell[]): EliminateClearResult {
        const columnCells = board.filter((_, index) => index % 9 === columnNo);
        const indexArray: number[][] = [];
        const line: number[] = [];

        for (let i = 0; i < columnCells.length; i++) {
            const curType = columnCells[i].type;
            if (!line.length) {
                line.push(i);
                continue;
            }
            if (columnCells[line[line.length - 1]].type !== curType) {
                if (line.length >= 3) {
                    indexArray.push([...line]);
                }
                line.splice(0, line.length);
            }
            line.push(i);
        }

        if (line.length >= 3) {
            indexArray.push([...line]);
        }

        const cellIndexes = indexArray.map((item) => item.map((i) => i * 9 + columnNo));
        const flatIndexes = cellIndexes.flat();

        return {
            maxRowNo: flatIndexes.length ? Math.max(...flatIndexes.map((idx) => Math.floor(idx / 9))) : -1,
            columnArray: flatIndexes.length ? [columnNo] : [],
            cellIndexArray: cellIndexes,
        };
    },

    fulldown(columns: number[], board: EliminateCell[]) {
        const result: Record<number, EliminateCell[]> = {};

        for (const column of columns) {
            const colCells = board.filter((_, index) => index % 9 === column);
            const noClearCells = colCells
                .map((cell, row) => ({ cell, row }))
                .filter((item) => !item.cell.clear)
                .map((item) => ({ ...item.cell, clear: false, _oldRow: item.row }));

            const needFill = 9 - noClearCells.length;
            const downCells: EliminateCell[] = Array.from({ length: needFill }, () => ({
                type: this.getRandomType(),
                clear: false,
                fullDown: true,
            }));

            const finalCells = [...downCells, ...noClearCells].map((cell, newRow) => {
                if ('_oldRow' in cell) {
                    const oldRow = (cell as EliminateCell & { _oldRow: number })._oldRow;
                    const moved = oldRow !== newRow;
                    const { _oldRow, ...rest } = cell as EliminateCell & { _oldRow: number };
                    return { ...rest, fullDown: moved };
                }
                return cell;
            });

            result[column] = finalCells as EliminateCell[];
        }

        return result;
    },

    applyFulldown(fulldownResult: Record<number, EliminateCell[]>) {
        const board = this.data.eliminateDatas.slice();
        for (let index = 0; index < board.length; index++) {
            const column = index % 9;
            if (!fulldownResult[column]) {
                continue;
            }
            const row = Math.floor(index / 9);
            board[index] = fulldownResult[column][row];
        }
        this.setData({ eliminateDatas: board });
    },

    resetFlags() {
        const board = this.data.eliminateDatas.map((cell) => ({
            ...cell,
            clear: false,
            fullDown: false,
        }));
        this.setData({ eliminateDatas: board });
    },

    collectClearResults(board: EliminateCell[]) {
        const resultArray: EliminateClearResult[] = [];

        for (let i = 8; i >= 0; i--) {
            const rowResult = this.canClearRow(i, board);
            if (rowResult.columnArray.length) {
                resultArray.push(rowResult);
            }
        }

        for (let i = 8; i >= 0; i--) {
            const columnResult = this.canClearColumn(i, board);
            if (columnResult.columnArray.length) {
                resultArray.push(columnResult);
            }
        }

        return resultArray;
    },

    async start() {
        if (this.data.isOperating) {
            return;
        }
        this.setData({ isOperating: true });

        while (true) {
            const currentBoard = this.data.eliminateDatas;
            const resultArray = this.collectClearResults(currentBoard);
            if (!resultArray.length) {
                break;
            }

            const clearIndexes = new Set<number>();
            const columns = new Set<number>();

            for (const res of resultArray) {
                res.cellIndexArray.forEach((line) => line.forEach((index) => clearIndexes.add(index)));
                res.columnArray.forEach((column) => columns.add(column));
            }

            const markBoard = currentBoard.map((cell, index) => ({
                ...cell,
                clear: clearIndexes.has(index),
            }));
            this.setData({ eliminateDatas: markBoard });

            await this.sleep();

            const fulldownResult = this.fulldown([...columns], markBoard);
            this.applyFulldown(fulldownResult);

            await this.sleep();

            this.resetFlags();
        }

        this.setData({ isOperating: false });
    },

    sleep() {
        return new Promise<void>((resolve) => {
            setTimeout(() => resolve(), this.data.animationInternal);
        });
    },
});
