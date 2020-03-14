/*
 *  class Aplication
 *      creates road, stores application flags, 
 *      redraws frames
 */

class Application {
    constructor(roadsNum) {
        this.mainField = document.getElementById(CANVAS_ID);
        this.canvasContext = mainField.getContext('2d');

        this.flags = {
            stop: false,
            leaveCircle: false,
        };

        this.startPositions = [];
        this.cars = [];
        this.road = new Road(this, roadsNum);
        this.addEventListeners();
    }

    addEventListeners() {
        document.addEventListener('keypress', (event) => {
            const keyName = event.key;

            if (keyName === 'C') {
                showMessage("[Shift + c] Interrupt");
                this.flags.stop = true;
            }
        });
    }

    draw(timestamp) {
        let cars = this.cars,
            road = this.road;
    
        if (this.flags.stop) {
            return;
        }
    
        this.canvasContext.clearRect(0, 0, this.mainField.width, this.mainField.height);
        road.draw();
    
        for (let i in cars) {
            let car = cars[i];
    
            if (car.states.finished) {
                cars.splice(i, 1);
            } else {
                car.draw(timestamp);
            }
        }
    
        window.requestAnimationFrame(this.draw.bind(this));
    }
}

/*
 *  class Point
 *      stores info about points,
 *      compares points, calculates distances between points,
 *      draws point
 */

class Point {
    constructor(pos, direction, id) {
        let alpha = (2 * Math.PI) / (360 / pos.alpha);

        this.radius = pos.radius;
        this.alpha = alpha;
        this.x = mainField.width / 2 + pos.radius * Math.cos(alpha);
        this.y = mainField.height / 2 + pos.radius * Math.sin(alpha);
        this.direction = direction || { radius: 1, alpha: 0 };
        this.id = id || LINE_ROAD_ID;
    }

    isEqual (point) {
        return Math.abs(this.x - point.x) <  POINTS_COMP_EPS
            && Math.abs(this.y - point.y) <  POINTS_COMP_EPS;
    }

    draw (color, radius = 1) {
        let canvasContext = document.app.canvasContext;

        canvasContext.beginPath();
        canvasContext.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        canvasContext.fillStyle = color;
        canvasContext.fill();
        canvasContext.closePath();
    }

    distanceToPoint(other) {
        return Math.sqrt(
                Math.pow(this.x - other.x, 2) + 
                Math.pow(this.y - other.y, 2)
            );
    }
}

/* 
 *  class Car
 *      stores info about car, moves car,
 *      recalculates car's speed
 */

class Car {
    constructor() {
        let speed = randomInt(MIN_NEAREST_POINTS_EPS, MAX_NEAREST_POINTS_EPS),
            app = document.app;

        this.point = app.startPositions[randomInt(0, app.startPositions.length - 1)];
        this.prevPoint = null;
        this.color = `rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)})`;
        this.start = null;
        this.speed = speed;
        this.maxSpeed = speed;
        this.states = {
            slowDown: false,
            finished: false,
        };
    }

    draw(timestamp) {
        if (!this.start) {
            this.start = timestamp;
        }
    
        if (timestamp - this.start >= FRAMES_DELAY) {
            this.move();
            this.start = timestamp;
        }
    
        this.point.draw(this.color, this.states.slowDown ? 7 : 5);
    }

    move() {
        let app = document.app,
            road = app.road,
            nearestPoints,
            length,
            nextPoint;
    
        if (isFinishPoint(this.point)) {
            this.states.finished = true;
            return;
        }

        this.states.slowDown = false;

        this.recalculateSpeed();

        nearestPoints = road.getNearestPoints(this.point, this.speed);
        length = nearestPoints.length;
        nextPoint = nearestPoints[randomInt(0, length - 1)];
    
        if (!nextPoint) {
            return;
        }

        this.prevPoint = this.point;
        this.point = nextPoint;
    }

    recalculateSpeed() {
        let cars = document.app.cars;

        cars = cars.filter((other) => {
            let dist = this.point.distanceToPoint(other.point);

            return  dist <= MIN_DIST && 
                    other.point.id >= this.point.id &&
                    checkDirection(this.point, other.point);
        });

        if (cars.length > 1) {
            this.states.slowDown = true;
            this.speed = Math.max(0, this.speed - SPEED_DEC);
            return;
        }
        this.speed = Math.min(this.maxSpeed, this.speed + SPEED_INC);
    }
}

/* class Road
 *      stores info about road, generate road's points,
 *      calculates points, which can be reaches from given point
 */

class Road {
    constructor(app, roadsNum) {
        this.roadsNum = roadsNum;
        this.generateRoad(app, roadsNum)
    }

    draw() {
        let road = this.points;

        for (let i in road) {
            let point = road[i];

            point.draw('grey', LINE_WIDTH);
        }
    }

    generateRoad(app) {
        this.points = generateLineRoad(app, this.roadsNum).concat(generateCircleRoad(app));
    }

    getNearestPoints(currentPoint, speed) {
        let filteredCandidates = this.points.filter((point) => {
                return checkDirection(currentPoint, point);
            }), 
            nearestCandidates = [],
            uniqueCandidates = [], 
            idsArr = [];

        for (let i in filteredCandidates) {
            let roadPoint = filteredCandidates[i],
                dist = roadPoint.distanceToPoint(currentPoint);

            if (dist < speed) {
                nearestCandidates.push({
                    dist: dist,
                    point: roadPoint,
                })
            }
        }

        nearestCandidates.sort((a, b) => {
            return b.dist - a.dist;
        });

        for (let i in nearestCandidates) {
            let candidatePoint = nearestCandidates[i];

            if (idsArr.indexOf(candidatePoint.point.id) == -1) {
                uniqueCandidates.push(candidatePoint.point);
                idsArr.push(candidatePoint.point.id);
            }
        }

        return uniqueCandidates;
    }
}