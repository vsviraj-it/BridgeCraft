export const formatSpeed = (speedBytesPerSecond: number): string => {
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let speed = speedBytesPerSecond;
  let unitIndex = 0;

  while (speed >= 1000 && unitIndex < units.length - 1) {
    speed /= 1000;
    unitIndex++;
  }

  return `${speed.toFixed(2)} ${units[unitIndex]}`;
};
