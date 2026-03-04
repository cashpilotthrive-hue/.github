export const gestureMap = {
  'tap': (element: any) => console.log('Quick info'),
  'double_tap': (command: any) => console.log('Execute'),
  'swipe_up': (amount: any) => console.log('Increase'),
  'swipe_down': (amount: any) => console.log('Decrease'),
  'swipe_left': (asset: any) => console.log('Sell'),
  'swipe_right': (asset: any) => console.log('Buy'),
  'pinch': (scale: any) => console.log('Zoom'),
  'long_press': (item: any) => console.log('Advanced options'),
  'shake': () => console.log('Emergency protocol'),
  'face_id': () => console.log('Quantum unlock'),
};
