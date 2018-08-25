import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {innerProfileToPolygon, calc_vol, join2Polylines} from './calc_functions'

it('calc capacity', () => {
  let points = '0,1052.3622 -95.023423,-29.3709 -43.192467,-41.46474 -38.00937,-76.01874 -51.83095,8.6385 -22.46009,6.91079 -36.28167,-41.46476 43.19247,-60.46946 70.83564,-15.54928 29.37088,-27.64318 17.27698,-88.11263 -70.83564,-29.37088 196.95764,0 0,393.91528'
  points = [ [ 0.0, 0.0 ], [ -26.817721518987359, -8.289113924050639 ], [ -39.00759493670887, -19.991392405063319 ], [ -49.734683544303813, -41.445569620253202 ], [ -64.362531645569618, -39.00759493670887 ], [ -70.701265822784819, -37.057215189873432 ], [ -80.940759493670896, -48.759493670886087 ], [ -68.750886075949381, -65.825316455696225 ], [ -48.759493670886087, -70.21367088607596 ], [ -40.470379746835448, -78.015189873417739 ], [ -35.594430379746854, -102.882531645569699 ], [ -55.585822784810148, -111.171645569620296 ]]
  let NEWpoints = []
  points.forEach(function(point){
    //let arr = point.split(',')
    NEWpoints.push({cx:point[0], cy:point[1]})
  })
  let poly = innerProfileToPolygon(NEWpoints)
  let vol = calc_vol(poly, 1)
  let freeCadVol = 904638.6118402461
  //il volume è in un range del 6x10000 rispetto a quello calcolato da FreeCad
  const valid_volume = vol < freeCadVol + (freeCadVol*0.0006) && vol > freeCadVol - (freeCadVol*0.0006)
  expect(valid_volume).toBe(true)
});

it('calc capacity2', () => {
  let points = '0.0,0.0 -2.0,1.0 -3.512141,0.509005 -4.275649,0.661708 -4.555602,1.654269 -3.88117,2.328702 -2.0,2.0 -1.271513,2.236541 -1.043462,3.130386 -1.616094,3.703018 -2.837708,3.372164 -4.0,4.0 -4.0,5.0 -3.0,5.0 0,5'
  points = points.split(' ')
  let NEWpoints = []
  points.forEach(function(point){
    let arr = point.split(',')
    NEWpoints.push({cx:parseFloat(arr[0]), cy:parseFloat(arr[1])})
  })
  let poly = innerProfileToPolygon(NEWpoints)
  let vol = calc_vol(poly, 1)
  let freeCadVol = 166.12811187617132
  //il volume è in un range del 6x10000 rispetto a quello calcolato da FreeCad
  const valid_volume = vol < freeCadVol + (freeCadVol*0.0006) && vol > freeCadVol - (freeCadVol*0.0006)
  expect(valid_volume).toBe(true)
});

it('calc vessel volume', () => {
  let ext_p = '0,0 -1.472755,0.329184 -2.286904,0.155961 -2.529417,0.398473 -3.288122,0.734947 -3.174366,0.848703'
  let int_p = '-3.174366,0.848703 -2.455346,0.548808 -2.229327,0.32279 -1.582713,0.455697 -0.011694,0.102919 0,0.102919'
  ext_p = ext_p.split(' ')
  int_p = int_p.split(' ')

  let int_pp = {points:[]}
  int_p.forEach(function(point){
    let arr = point.split(',')
    int_pp.points.push({cx:parseFloat(arr[0]), cy:parseFloat(arr[1])})
  })

  let ext_pp = {points:[]}
  ext_p.forEach(function(point){
    let arr = point.split(',')
    ext_pp.points.push({cx:parseFloat(arr[0]), cy:parseFloat(arr[1])})
  })

  let poly = join2Polylines(int_pp, ext_pp)
  let vol = calc_vol(poly, 1)
  let freeCadVol = 5.1375084521728045
  //il volume è in un range del 6x10000 rispetto a quello calcolato da FreeCad
  const valid_volume = vol < freeCadVol + (freeCadVol*0.0006) && vol > freeCadVol - (freeCadVol*0.0006)
  expect(valid_volume).toBe(true)
});
