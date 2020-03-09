const CANVAS_ID = 'mainField',
    ROAD_RADIUS = 150,
    LINE_ROAD_FREQ = 1,
    LINE_ROAD_COEF = 0.5,
    CIRCLE_ROAD_FREQ = 1,
    CIRCLE_ROAD_COEF = 1,
    EPS = 1,
    DIST_BETWEEN_LINES = 10,
    MAX_CARS_NUM = 20;


class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    isEqual (point) {
        return this.x == point.x && this.y == point.y;
    }
}

class Car {
    constructor(color) {
        let startPoint = startPositions[Math.floor(Math.random() * startPositions.length)];
        this.pos = new Point(startPoint.x, startPoint.y)
        this.color = color;
        this.start = null;
        this.roadCoef = LINE_ROAD_COEF;
    }
}

let mainField = document.getElementById(CANVAS_ID),
    canvasContext = mainField.getContext('2d'),
    startPositions = [
        new Point(0, DIST_BETWEEN_LINES),
        new Point(DIST_BETWEEN_LINES, mainField.height),
        new Point(mainField.width, mainField.height - DIST_BETWEEN_LINES),
        new Point(mainField.width - DIST_BETWEEN_LINES, 0)
    ],
    finishPositions = [
        new Point(DIST_BETWEEN_LINES, 0),
        new Point(mainField.width, DIST_BETWEEN_LINES),
        new Point(mainField.width - DIST_BETWEEN_LINES, mainField.height),
        new Point(0, mainField.height - DIST_BETWEEN_LINES)
    ],
    cars, road;

function addCar() {
    if (cars.length < MAX_CARS_NUM) {
        cars.push(new Car(`rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)})`));
    } else {
        document.getElementById("debug").innerText = `Max num of cars reached (${MAX_CARS_NUM})!\n`;
    }
}

function generateCircleRoad() {
    let res_arr = [];

    for (let alpha = 1; alpha <= 360; alpha += CIRCLE_ROAD_FREQ) {
        let piAlpha = (2 * Math.PI) / (360 / alpha),
            x = mainField.width / 2 + ROAD_RADIUS * Math.cos(piAlpha),
            y = mainField.height / 2 + ROAD_RADIUS * Math.sin(piAlpha);

        if (alpha <= 90) res_arr.push([x, y, -1, -1, CIRCLE_ROAD_COEF])
        else if (alpha <= 180) res_arr.push([x, y, -1, 1, CIRCLE_ROAD_COEF])
        else if (alpha <= 270) res_arr.push([x, y, 1, 1, CIRCLE_ROAD_COEF])
        else if (alpha <= 360) res_arr.push([x, y, 1, -1, CIRCLE_ROAD_COEF]);
    }

    return res_arr;
}

function generateLineRoad() {
    let res_arr = [], offset = 2;
    
    for (let x = 0; x < mainField.width; x += LINE_ROAD_FREQ) {
        let offX = x - mainField.width / 2;

        for (let y = 0; y < mainField.height; ++y) {
            let offY = y - mainField.height / 2;

            if (x - y == -DIST_BETWEEN_LINES && Math.sqrt(offX * offX + offY * offY) > ROAD_RADIUS + offset) {
                res_arr.push([x, y, -1, 1, LINE_ROAD_COEF]);
            } else if (x - y == DIST_BETWEEN_LINES && Math.sqrt(offX * offX + offY * offY) > ROAD_RADIUS + offset) {
                res_arr.push([x, y, 1, -1, LINE_ROAD_COEF]);
            } else if ((mainField.width - x) - y == -DIST_BETWEEN_LINES && Math.sqrt(offX * offX + offY * offY) > ROAD_RADIUS + offset) {
                res_arr.push([x, y, -1, -1, LINE_ROAD_COEF]);
            } else if ((mainField.width - x) - y == DIST_BETWEEN_LINES && Math.sqrt(offX * offX + offY * offY) > ROAD_RADIUS + offset) {
                res_arr.push([x, y, 1, 1, LINE_ROAD_COEF]);
            }
        }
    }

    return res_arr;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (1 + max - min) + min);
}

function draw(timestamp) {

    canvasContext.clearRect(0, 0, mainField.width, mainField.height);
    drawRoad();

    for (let i in cars) {
        let car = cars[i];

        drawCar(car, timestamp);
    }


    window.requestAnimationFrame(draw);
}

function drawRoad() {
    for (i in road) {
        let point = road[i],
            x = point[0],
            y = point[1];

        canvasContext.beginPath();
        canvasContext.fillRect(x, y, 1, 1);
        canvasContext.fillStyle = 'blue';
        canvasContext.closePath();

    }
}

function drawCar(car, timestamp) {

    //console.log(car);

    if (!car.start) {
        car.start = timestamp;
    }

    if (timestamp - car.start >= 20 * car.roadCoef) {
        moveCar(car);
        car.start = timestamp;
    }

    canvasContext.beginPath();
	canvasContext.arc(car.pos.x, car.pos.y, 5, 0, 2 * Math.PI);
	canvasContext.fillStyle = car.color;
    canvasContext.fill();
    canvasContext.closePath();
}

function moveCar(car) {
    let candidates = road.filter((point) => {
            let diffX = car.pos.x - point[0],
                diffY = car.pos.y - point[1],
                dirX = point[2],
                dirY = point[3];

            return diffY * dirY < 0 && diffX * dirX > 0;
        ;
        }),
        minDist = Math.sqrt(mainField.width * mainField.width + mainField.height * mainField.height),
        minPoints = [];
    
    //console.log(candidates);

    for (let i in candidates) {
        let point = candidates[i],
            diffX = car.pos.x - point[0],
            diffY = car.pos.y - point[1],
            dist = Math.sqrt(diffX * diffX + diffY * diffY);

        if (Math.abs(dist - minDist) < 0.5) {
            minPoints.push(point);
        } else if (dist < minDist) {
            minPoints = [point];
            minDist = dist;
        }
    }

    let nextPoint = minPoints[Math.floor(Math.random() * minPoints.length)];

    if (!nextPoint) {
        return;
    }
    car.pos.x = nextPoint[0];
    car.pos.y = nextPoint[1];
    car.roadCoef = nextPoint[4];
}

function generateRoad() {
    return  generateLineRoad()
            .concat(generateCircleRoad());
}

road = generateRoad();
cars = [
    new Car('red'),
];
window.requestAnimationFrame(draw);