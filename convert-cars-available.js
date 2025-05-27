const fs = require('fs');
const path = require('path');
const carsPath = path.join(__dirname, '../data/cars.json');

fs.readFile(carsPath, 'utf8', (err, data) => {
  if (err) return console.error('Read error:', err);
  let cars = [];
  try { cars = JSON.parse(data); } catch (e) { return console.error('Parse error:', e); }
  cars.forEach(car => {
    if (typeof car.available === 'boolean') {
      car.available = car.available ? 1 : 0;
    }
  });
  fs.writeFile(carsPath, JSON.stringify(cars, null, 2), err2 => {
    if (err2) return console.error('Write error:', err2);
    console.log('cars.json available fields converted to numbers.');
  });
}); 