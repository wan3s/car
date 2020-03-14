
// start application
function start (roadsNum) {
    closeModalWindow();
    document.app = new Application(roadsNum);
    window.requestAnimationFrame(document.app.draw.bind(document.app));
}

// generate roads adjacent to the intersection
function generateLineRoad(app, roadsNum) {
    let width = app.mainField.width / 2,
        height = app.mainField.height / 2,
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
                    app.startPositions.push(point1);
            }

            resArr = resArr.concat([
                point1,
                point2
            ]); 
        }
    }

    return resArr;
}

// generates roundabout
function generateCircleRoad(app) {
    let resArr = [];

    for (let alpha = 0; alpha < 360; alpha += CIRCLE_ROAD_FREQ) {
        resArr.push(new Point(
            { radius: ROAD_RADIUS, alpha: alpha },
            { radius: app.flags.leaveCircle ? 0 : 1, alpha: ALPHA_DIRECTION },
            CIRCLE_ROAD_ID
        ));
    }

    return resArr;
}

// debug function which highlights road described by given points
function highlightPoints(pointsArr) {
    for (let i in pointsArr) {
        let point = pointsArr[i];

        point.draw('pink', 3);
    }
}

// random int between min and max
function randomInt(min, max) {
    return Math.floor(Math.random() * (1 + max - min) + min);
}

// called when user clicks button 
function addCar() {
    let app = document.app,
        cars = app.cars;

    if (app.flags.stop) {
        return;
    }

    if (cars.length < MAX_CARS_NUM) {
        cars.push(new Car());
    } else {
        showMessage(`Достигнуто максимальное количество машин: ${MAX_CARS_NUM}`);
    }
}

function openModalWindow() {
    location.href = '#chooseRoadType';
}

function closeModalWindow() {
    location.href = '#';
}

// changes button value when user move slider
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

// check that point can be reached from current point according to direction
function checkDirection (currentPoint, point) {
    let alpha = (point.alpha - currentPoint.alpha > 1.8 * Math.PI ? 
            point.alpha + ALPHA_DIRECTION * 2 * Math.PI :
            point.alpha),
        diffR = currentPoint.radius - point.radius,
        diffA = alpha - currentPoint.alpha,
        curDirR = currentPoint.direction.radius,
        curDirA = currentPoint.direction.alpha,
        candDirR = point.direction.radius,
        candDirA = point.direction.alpha;

    if (currentPoint.alpha - point.alpha > 1.8 * Math.PI) return false;

    return  diffR * curDirR >= 0 && diffA * curDirA >= 0 &&
            diffR * candDirR >= 0 && diffA * candDirA >= 0;
}

// checks that given point is finish
function isFinishPoint (point) {
    let app = document.app;

    return  point.x < -FINISH_BORDERS_OFFSET || 
            point.x > app.mainField.width + FINISH_BORDERS_OFFSET ||
            point.y < -FINISH_BORDERS_OFFSET || 
            point.y > app.mainField.height + FINISH_BORDERS_OFFSET;
}

// switch app state when user clicks button leave / stay on roundabout
function switchLeaveMode (obj) {
    let app = document.app;

    if (app.flags.stop) {
        return;
    }
    app.flags.leaveCircle = !app.flags.leaveCircle;
    obj.innerText = LEAVE_MODE_SWITCHER_LABEL[app.flags.leaveCircle];
    obj.title = LEAVE_MODE_SWITCHER_TITLES[app.flags.leaveCircle];
    app.road.generateRoad(app);
}

// calls when user closes the application
function closeApp () {
    let app = document.app;

    app.flags.stop = true;
    location.href = `#${CLOSE_WINDOW_ID}`;
}

// displays banner with given message
function showMessage (msg) {
    document.getElementById(MESSAGE_BANNER_ID).innerText = msg;
    location.href = `#${MESSAGE_BANNER_ID}`;
    setTimeout(() => { closeModalWindow() }, MESSAGE_BANNER_DELAY);
}