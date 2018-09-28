// utils
export function parsePxInt(sizePx){
  return parseInt(sizePx.replace('px', ''));
}

export function randGate(min, max){
  return Math.random() * (max - min) + min;
}

export function stringToObj(str){
  var res = {};
  var arr = str.split(' ');
  for (var i = 0; i < arr.length; i++) {
    var data = arr[i];
    var reData = data.split(':');
    if(reData.length > 1) {
      if(reData[1] == 'false') res[reData[0]] = false;
      else if(reData[1] == 'true') res[reData[0]] = true;
      else res[reData[0]] = parseInt(reData[1]) || reData[1];
    }
    else if(data.length) res[data] = true;
  }
  return res;
}

export function perToRatio(per){
  var perVal = parseInt(per.replace('%', ''));
  return perVal / 100;
}

export function signOf(val){
  if(val < 0) return -1;
  if(val > 0) return 1;
  return 0;
}
