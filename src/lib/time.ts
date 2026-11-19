export const day = (time: number) => new Date(time).toISOString().slice(0, 10);
export const clock = (time: number) => new Date(time).toISOString().slice(11, 19);
export const duration = (seconds: number) => `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
