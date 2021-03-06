export async function delayUntil(delay: number = 0) {
  return new Promise((yay) => {
    const delayNum = 'number' === typeof(delay) ? +delay : 0;

    if (delayNum < 1) yay();
    else setTimeout(yay, delay);
  });
}
