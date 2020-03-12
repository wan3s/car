class Application {
    constructor(roadsNum) {
        this.mainField = document.getElementById(CANVAS_ID),
        this.canvasContext = mainField.getContext('2d'),
        this.startPositions = [],
        this.cars = [];
        this.road = new Road(this, roadsNum);
        this.flags = {
            stop: false,
        };
        this.addEventListeners();
    }

    addEventListeners() {
        document.addEventListener('keypress', (event) => {
            const keyName = event.key;

            if (keyName === 'C') {
                this.flags.stop = true;
            }
        });
    }
}

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

class Car {
    constructor() {
        let speed = randomInt(MIN_NEAREST_POINTS_EPS, MAX_NEAREST_POINTS_EPS),
            app = document.app;

        console.log(app);
        this.point = app.startPositions[randomInt(0, app.startPositions.length - 1)];
        this.prevPoint = null;
        this.color = `rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)})`;
        this.start = null;
        this.finished = false;
        this.speed = speed;
        this.maxSpeed = speed;
        this.slowDown = false;
    }

    draw(timestamp) {
        if (!this.start) {
            this.start = timestamp;
        }
    
        if (timestamp - this.start >= FRAMES_DELAY) {
            this.move();
            this.start = timestamp;
        }
    
        /*if (this.prevPos) {
            // this.prevPos.draw(this.color, this.slowDown ? 10 : 5);
        }*/
        this.point.draw(this.color, this.slowDown ? 10 : 5);
    }

    move() {
        let app = document.app,
            road = app.road,
            cars = app.cars,
            nearestPoints,
            length,
            nextPoint;
    
        if (this.point.x < -FINISH_BORDERS_OFFSET || this.point.x > mainField.width + FINISH_BORDERS_OFFSET ||
            this.point.y < -FINISH_BORDERS_OFFSET || this.point.y > mainField.height + FINISH_BORDERS_OFFSET) {
            
            this.finished = true;
            return;
        }

        this.slowDown = false;

        cars = cars.filter((other) => {
            let dist = this.point.distanceToPoint(other.point);

            return  dist <= MIN_DIST && 
                    other.point.id >= this.point.id &&
                    checkDirection(this.point, other.point);
        });

        if (cars.length > 1) {
            this.slowDown = true;
            this.speed = Math.max(0, this.speed - SPEED_DELTA);
            return;
        } else {
            this.speed = Math.min(this.maxSpeed, this.speed + SPEED_DELTA);
        }

        nearestPoints = road.getNearestPoints(this.point, this.speed);
        length = nearestPoints.length;
        nextPoint = nearestPoints[randomInt(0, length - 1)];
    
        if (!nextPoint) {
            return;
        }

        /* cars = cars.filter((other) => {
            let dist1 = this.point.distanceToPoint(other.point),
                dist2 = nextPoint.distanceToPoint(other.point);

            return dist2 <= MIN_DIST && dist2 <= dist1;
        }); */

        this.prevPoint = this.point;
        this.point = nextPoint;
    }
}

class Road {
    constructor(app, roadsNum) {
        this.points = generateLineRoad(app, roadsNum).concat(generateCircleRoad());
    }

    draw() {
        let road = this.points;

        for (let i in road) {
            let point = road[i];

            point.draw('grey', LINE_WIDTH);
        }
    }

    getNearestPoints(currentPoint, speed) {
        let filteredCandidates = this.points.filter((point) => {
                return checkDirection(currentPoint, point);
            }), 
            nearestCandidates = [],
            uniqueCandidates = [], 
            idsArr = [];

        // highlightPoints(filteredCandidates);

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