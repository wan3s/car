function generateLineRoad(roadsNum) {
    let width = mainField.width / 2,
        height = mainField.height / 2,
        maxLim =  Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)),
        resArr = [];

    for (let radius = ROAD_RADIUS + LINE_ROAD_FREQ; radius <= maxLim; radius += LINE_ROAD_FREQ) {
        for (let alpha = 0; alpha < 360; alpha += 360 / roadsNum) {
            let addAlpha = 360 * (Math.asin(DIST_BETWEEN_LINES / radius) / (2 * Math.PI)),
                piAlpha = (2 * Math.PI) / (360 / alpha),
                x = width + radius * Math.cos(piAlpha),
                y = height + radius * Math.sin(piAlpha),
                xDiff = Math.sin(piAlpha) * DIST_BETWEEN_LINES,
                yDiff = Math.cos(piAlpha) * DIST_BETWEEN_LINES,
                towCenterX = x + xDiff,
                towCenterY = y - yDiff,
                point1 = new Point(
                    { radius: radius, alpha: alpha - addAlpha },
                    { radius: 1, alpha: ALPHA_DIRECTION },
                    LINE_ROAD_ID
                ),
                point2 = new Point(
                    { radius: radius, alpha: alpha + addAlpha },
                    { radius: -1, alpha: ALPHA_DIRECTION },
                    LINE_ROAD_ID
                );
            
            if (Math.abs(towCenterX) <= EPS || Math.abs(mainField.width - towCenterX) <= EPS ||
                Math.abs(towCenterY) <= EPS || Math.abs(mainField.height - towCenterY) <= EPS) { 
                startPositions.push(point1);
            }

            resArr = resArr.concat([
                point1,
                point2
            ]); 
        }
    }

    return resArr;
}

function highlightPoints(pointsArr) {
    for (let i in pointsArr) {
        let point = pointsArr[i];

        point.draw('pink', 3);
    }
}

function generateCircleRoad() {
    let resArr = [];

    for (let alpha = 0; alpha < 360; alpha += CIRCLE_ROAD_FREQ) {
        resArr.push(new Point(
            { radius: ROAD_RADIUS, alpha: alpha },
            { radius: 0, alpha: ALPHA_DIRECTION },
            CIRCLE_ROAD_ID
        ));
    }

    return resArr;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (1 + max - min) + min);
}

function addCar() {
    let cars = document.cars;

    if (cars.length < MAX_CARS_NUM) {
        cars.push(new Car());
    } else {
        document.getElementById("debug").innerText = `Max num of cars reached (${MAX_CARS_NUM})!\n`;
    }
}

function draw(timestamp) {
    let cars = document.cars,
        road = document.road;

    canvasContext.clearRect(0, 0, mainField.width, mainField.height);
    road.draw();

    for (let i in cars) {
        let car = cars[i];

        if (car.finished) {
            cars.splice(i, 1);
        } else {
            car.draw(timestamp);
        }
    }

    window.requestAnimationFrame(draw);
}

function chooseRoadNumHandler(roadsNum) {
    main(roadsNum);
    closeModalWindow();
}

function openModalWindow() {
    location.href = '#chooseRoadType';
}

function closeModalWindow() {
    location.href = '#';
}

function changeRoadNumHandler(roadsNum, btnId) {
    let roadsWordForm = "";

    switch (roadsNum) {
        case "1":
            roadsWordForm = "дорогу";
            break;
        case "2":
        case "3":
        case "4":
            roadsWordForm = "дороги";
            break;
        default:
            roadsWordForm = "дорог";
    }
    btnId.value = `выбрать ${roadsNum} ${roadsWordForm}`;
}

function checkDirection (currentPoint, point) {
    let alpha = (Math.abs(point.alpha - currentPoint.alpha) > 1.0 * Math.PI ? 
            point.alpha + ALPHA_DIRECTION * 2 * Math.PI :
            point.alpha),
        diffR = currentPoint.radius - point.radius,
        diffA = alpha - currentPoint.alpha,
        curDirR = currentPoint.direction.radius,
        curDirA = currentPoint.direction.alpha,
        candDirR = point.direction.radius,
        candDirA = point.direction.alpha;

    return  diffR * curDirR >= 0 && diffA * curDirA >= 0 &&
            diffR * candDirR >= 0 && diffA * candDirA >= 0;
}

function main (roadsNum) {
    document.cars = [];
    document.road = new Road(roadsNum);
    document.finishPositions = [
        new Point(DIST_BETWEEN_LINES, 0),
        new Point(mainField.width, DIST_BETWEEN_LINES),
        new Point(mainField.width - DIST_BETWEEN_LINES, mainField.height),
        new Point(0, mainField.height - DIST_BETWEEN_LINES)
    ];
    window.requestAnimationFrame(draw);
}