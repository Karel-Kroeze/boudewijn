export async function cursorTo(x: number, y?: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const ready = process.stdout.cursorTo(x, y, () => {
            if (ready) {
                resolve();
            } else {
                process.stdout.once("drain", resolve);
            }
        });
    });
}
export async function clearScreenDown(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const ready = process.stdout.clearScreenDown(() => {
            if (ready) {
                resolve();
            } else {
                process.stdout.once("drain", resolve);
            }
        });
    });
}
export async function moveCursor(dx: number, dy: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const ready = process.stdout.moveCursor(dx, dy, () => {
            if (ready) {
                resolve();
            } else {
                process.stdout.once("drain", resolve);
            }
        });
    });
}
export async function write(str: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const ready = process.stdout.write(str, () => {
            if (ready) {
                resolve();
            } else {
                process.stdout.once("drain", resolve);
            }
        });
    });
}
